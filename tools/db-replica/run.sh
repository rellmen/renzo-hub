#!/usr/bin/env bash
# Prueba local de las migraciones de permisos contra una réplica de PostgreSQL 17 con los privilegios reales de producción.
# Uso: tools/db-replica/run.sh   (requiere postgresql-17 instalado; no se conecta a Supabase)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
PGBIN=/usr/lib/postgresql/17/bin
WORK="$(mktemp -d)"; PORT=55432
run_pg(){ if [ "$(id -u)" = 0 ]; then su postgres -s /bin/bash -c "$*"; else bash -c "$*"; fi; }
cleanup(){ run_pg "$PGBIN/pg_ctl -D $WORK/data -m immediate stop" >/dev/null 2>&1 || true; rm -rf "$WORK"; }
trap cleanup EXIT
chmod 777 "$WORK"
run_pg "$PGBIN/initdb -D $WORK/data -U postgres -A trust >/dev/null"
run_pg "$PGBIN/pg_ctl -D $WORK/data -o '-p $PORT -k $WORK' -l $WORK/log -w start >/dev/null"
PSQL=(psql -h "$WORK" -p $PORT -U postgres -d postgres -v ON_ERROR_STOP=1 -q -X)
acl(){ "${PSQL[@]}" -At -c "
  select c.relname||':'||a.grantee::regrole::text||'='||string_agg(a.privilege_type, ',' order by a.privilege_type)
  from pg_class c cross join lateral aclexplode(c.relacl) a
  where c.relnamespace='public'::regnamespace and c.relkind in ('r','v') and a.grantee in ('anon'::regrole,'authenticated'::regrole)
  group by c.relname, a.grantee union all
  select p.oid::regprocedure::text||':'||case when a.grantee=0 then 'PUBLIC' else a.grantee::regrole::text end||'=EXECUTE'
  from pg_proc p cross join lateral aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) a
  where p.pronamespace='public'::regnamespace and (a.grantee=0 or a.grantee in ('anon'::regrole,'authenticated'::regrole))
  union all
  select p.oid::regprocedure::text||':search_path='||coalesce(array_to_string(p.proconfig,','),'unset')
  from pg_proc p where p.pronamespace='public'::regnamespace and p.proname like 'payroll%'
  order by 1"; }
ok(){ echo "  OK  $*"; }
echo "1) Réplica: roles, auth, migraciones del repo y stubs de payroll"
"${PSQL[@]}" -f "$ROOT/tools/db-replica/bootstrap.sql"
for f in "$ROOT"/supabase/migrations/*.sql; do "${PSQL[@]}" -f "$f"; done
"${PSQL[@]}" -f "$ROOT/tools/db-replica/payroll_stub.sql"
"${PSQL[@]}" -f "$ROOT/tests/db/fixtures/prod_acl_2026-10-08.sql"
ok "esquema cargado ($(ls "$ROOT"/supabase/migrations/*.sql | wc -l) migraciones)"
md5=$("${PSQL[@]}" -At -c "select md5(prosrc) from pg_proc where proname='hub_financial_ingest'")
[ "$md5" = "14f7a531cc5a4e00a1189cd3953c88b2" ] && ok "hub_financial_ingest idéntica a staging y producción (md5 $md5)" || { echo "FAIL md5 $md5"; exit 1; }
"${PSQL[@]}" -c "insert into auth.users values ('fdf1f291-863b-4027-9e90-e36de360a553','test@example.invalid')"
acl > "$WORK/before.txt"; ok "estado inicial = producción ($(wc -l < "$WORK/before.txt") entradas de privilegios)"

echo "2) Migración de endurecimiento (versión pendiente para producción)"
MIG="$ROOT/supabase/pending/20261008120000_harden_grants_and_functions.sql"
"${PSQL[@]}" -f "$MIG"; acl > "$WORK/after.txt"
 ! grep -vE '^[a-z_]+\(' "$WORK/after.txt" | grep -q ':anon=' && ok "anon sin privilegios en tablas" || { echo FAIL anon; grep ':anon=' "$WORK/after.txt"; exit 1; }
! grep -E ':authenticated=.*(TRUNCATE|REFERENCES|TRIGGER|MAINTAIN)' "$WORK/after.txt" && ok "authenticated sin TRUNCATE/REFERENCES/TRIGGER/MAINTAIN" || exit 1
! grep -E '^payroll_(v_|deductions|hours|income_items).*:authenticated=.*(INSERT|UPDATE|DELETE)' "$WORK/after.txt" && ok "vistas payroll solo lectura" || exit 1
! grep -q 'search_path=unset' "$WORK/after.txt" && ok "search_path fijado en funciones payroll" || exit 1
! grep -E '^(payroll_snapshot_payslip|payroll_touch_updated_at|set_hub_records_updated_at)\(\):(PUBLIC|anon|authenticated)=EXECUTE' "$WORK/after.txt" && ok "funciones de trigger no invocables por API" || exit 1
diff <(grep -E '^(gym|hub_)' "$WORK/before.txt") <(grep -E '^(gym|hub_)' "$WORK/after.txt") >/dev/null && ok "gym_* y hub_* sin cambios" || exit 1
"${PSQL[@]}" -f "$MIG"; acl > "$WORK/after2.txt"; diff -q "$WORK/after.txt" "$WORK/after2.txt" >/dev/null && ok "idempotente (segunda aplicación sin cambios)"

echo "3) La app sigue funcionando con los permisos nuevos (usuario autenticado, RLS y triggers)"
"${PSQL[@]}" -f "$ROOT/tests/db/staging_authenticated_rls.sql" 2>"$WORK/rls.err" || true
grep -o 'TEST_OK.*' "$WORK/rls.err" | sed 's/^/  OK  /' || { echo "FAIL rls"; cat "$WORK/rls.err"; exit 1; }
"${PSQL[@]}" -c "insert into public.payroll_payslips(id,user_id,net) values ('44444444-4444-4444-8444-444444444444','fdf1f291-863b-4027-9e90-e36de360a553',100)"
"${PSQL[@]}" -c "begin; set local role authenticated; select set_config('request.jwt.claims','{\"sub\":\"fdf1f291-863b-4027-9e90-e36de360a553\"}',true);
  update public.payroll_payslips set net = 101 where id='44444444-4444-4444-8444-444444444444'; commit;" >/dev/null
n=$("${PSQL[@]}" -At -c "select count(*) from public.payroll_payslip_versions")
[ "$n" = 1 ] && ok "trigger SECURITY DEFINER sigue disparando tras revocar EXECUTE (versiones de nómina: $n)" || { echo "FAIL trigger $n"; exit 1; }

echo "4) Rollback exacto"
"${PSQL[@]}" -f "$ROOT/supabase/pending/20261008120000_harden_grants_and_functions.rollback.sql"; acl > "$WORK/rollback.txt"
if diff "$WORK/before.txt" "$WORK/rollback.txt"; then ok "tras rollback los privilegios son idénticos al estado inicial de producción"; else echo "FAIL rollback difiere"; exit 1; fi

echo "5) Revisión obligatoria de importaciones financieras (migración pendiente)"
F="$ROOT/supabase/pending/20261008140000_financial_ingest_always_review.sql"
if [ -f "$F" ]; then
  "${PSQL[@]}" -f "$F"
  res=$("${PSQL[@]}" -At -c "set role service_role; select public.hub_financial_ingest('fdf1f291-863b-4027-9e90-e36de360a553',
    '{\"eventId\":\"t1\",\"type\":\"expense\",\"date\":\"2026-10-01\",\"confidence\":0.99,\"extracted\":{\"amount\":42.5,\"currency\":\"EUR\",\"category\":\"fuel\"}}')->>'status'")
  [ "$res" = needs_review ] && ok "gasto con confianza 0.99 va a revisión (status=$res)" || { echo "FAIL ingest $res"; exit 1; }
  res=$("${PSQL[@]}" -At -c "set role service_role; select public.hub_financial_ingest('fdf1f291-863b-4027-9e90-e36de360a553',
    '{\"eventId\":\"t1\",\"type\":\"expense\",\"date\":\"2026-10-01\",\"confidence\":0.99,\"extracted\":{\"amount\":42.5}}')->>'status'")
  [ "$res" = duplicate ] && ok "reenvío del mismo documento = duplicate" || { echo "FAIL dup $res"; exit 1; }
  n=$("${PSQL[@]}" -At -c "select count(*) from public.hub_records where record_type='renzo_money'")
  [ "$n" = 0 ] && ok "nada entra directo en Money" || { echo "FAIL money $n"; exit 1; }
  "${PSQL[@]}" -f "$ROOT/supabase/pending/20261008140000_financial_ingest_always_review.rollback.sql"
  m=$("${PSQL[@]}" -At -c "select md5(prosrc) from pg_proc where proname='hub_financial_ingest'")
  [ "$m" = "14f7a531cc5a4e00a1189cd3953c88b2" ] && ok "rollback restaura la función original" || { echo "FAIL rollback ingest"; exit 1; }
fi
echo "TODO OK"
