"""Genera, a partir de una instantánea de producción (JSON de solo lectura, sin datos de usuario en la salida):
  - tests/db/fixtures/prod_acl_<fecha>.json / .sql : privilegios exactos de anon/authenticated para la réplica
  - supabase/pending/20261008120000_harden_grants_and_functions.rollback.sql : rollback exacto
Uso: python3 tools/db-replica/make_fixture.py <snapshot.json> <fecha>
"""
import json, sys, os

snap, fecha = sys.argv[1], sys.argv[2]
d = json.load(open(snap))
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
L = {"a": "insert", "r": "select", "w": "update", "d": "delete", "D": "truncate", "x": "references", "t": "trigger", "m": "maintain"}
ROLES = ("anon", "authenticated")
TOUCHED_FUNCS = ["payroll_num(jsonb,text)", "payroll_period_key(text,integer,integer)", "payroll_periods_per_year(text,integer)",
                 "payroll_touch_updated_at()", "payroll_snapshot_payslip()", "set_hub_records_updated_at()"]
SIG = {"payroll_num(jsonb,text)": "payroll_num(jsonb, text)", "payroll_period_key(text,integer,integer)": "payroll_period_key(text, integer, integer)",
       "payroll_periods_per_year(text,integer)": "payroll_periods_per_year(text, integer)"}


def acl_roles(acl):
    out = {}
    for e in (acl or "").strip("{}").split(","):
        if "=" not in e:
            continue
        role, priv = e.split("/")[0].split("=")
        out[role or "PUBLIC"] = priv
    return out


tables = {t: {r: p for r, p in acl_roles(a).items() if r in ROLES} for t, a in d["relacl"].items()}
funcs = {f: sorted(r for r in acl_roles(v["acl"]) if r in ("PUBLIC",) + ROLES) for f, v in d["functions"].items()}
unset = [f for f in TOUCHED_FUNCS if not d["functions"][f]["config"] or not any(c.startswith("search_path") for c in d["functions"][f]["config"])]
fixture = {"source": f"producción mgncykyrhavpepfggmng, instantánea {d['taken_at']} (solo anon/authenticated)",
           "tables": tables, "function_execute": funcs, "search_path_unset": unset}
fx_dir = os.path.join(ROOT, "tests/db/fixtures")
json.dump(fixture, open(os.path.join(fx_dir, f"prod_acl_{fecha}.json"), "w"), indent=1, ensure_ascii=False)


def grants(t, roles):
    out = []
    for r, p in sorted(roles.items()):
        out.append(f"grant {', '.join(L[c] for c in p)} on table public.{t} to {r};")
    return out


sql = [f"-- Generado desde la instantánea de producción {d['taken_at']}: deja la réplica con los mismos privilegios."]
for t, roles in sorted(tables.items()):
    sql.append(f"revoke all on table public.{t} from anon, authenticated, public;")
    sql += grants(t, roles)
REPLICA_FUNCS = set(TOUCHED_FUNCS) | {"set_updated_at()", "handle_new_user()", "hub_financial_ingest(uuid,jsonb)"}
for f, roles in sorted(funcs.items()):
    if f not in REPLICA_FUNCS:
        continue  # el resto de funciones payroll_* no existe en la réplica (stubs)
    name = SIG.get(f, f)
    sql.append(f"revoke all on function public.{name} from public, anon, authenticated;")
    if roles:
        sql.append(f"grant execute on function public.{name} to {', '.join('public' if r == 'PUBLIC' else r for r in roles)};")
for f in unset:
    sql.append(f"alter function public.{SIG.get(f, f)} reset search_path;")
open(os.path.join(fx_dir, f"prod_acl_{fecha}.sql"), "w").write("\n".join(sql) + "\n")

# Rollback exacto: devuelve a anon/authenticated exactamente lo que tenían en la instantánea.
rb = [f"-- Rollback EXACTO de 20261008120000 en PRODUCCIÓN, generado desde la instantánea {d['taken_at']}",
      "-- (pg_class.relacl, pg_proc.proacl y pg_default_acl). Solo privilegios; no toca datos.",
      "begin;"]
for t, roles in sorted(tables.items()):
    rb.append(f"revoke all on table public.{t} from anon, authenticated;")
    rb += grants(t, roles)
for f in TOUCHED_FUNCS:
    name, roles = SIG.get(f, f), funcs[f]
    rb.append(f"revoke execute on function public.{name} from public, anon, authenticated;")
    if roles:
        rb.append(f"grant execute on function public.{name} to {', '.join('public' if r == 'PUBLIC' else r for r in roles)};")
for f in unset:
    rb.append(f"alter function public.{SIG.get(f, f)} reset search_path;")
rb += ["-- Privilegios por defecto del rol postgres en public (estado previo: todo concedido a anon).",
       "alter default privileges for role postgres in schema public grant all on tables to anon;",
       "alter default privileges for role postgres in schema public grant all on sequences to anon;",
       "alter default privileges for role postgres in schema public grant execute on functions to anon;",
       "commit;"]
open(os.path.join(ROOT, "supabase/pending/20261008120000_harden_grants_and_functions.rollback.sql"), "w").write("\n".join(rb) + "\n")
print("tablas", len(tables), "funciones", len(funcs), "sin search_path", unset)
