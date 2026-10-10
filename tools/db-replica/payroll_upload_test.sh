#!/usr/bin/env bash
# Comprueba que el payload que genera payroll-pdf.js (subida desde la app) lo acepta payroll_ingest tal cual:
# PostgreSQL 17 vacío + todas las migraciones -> payroll_register_document + payroll_ingest con la nómina FICTICIA.
# Uso: bash tools/db-replica/payroll_upload_test.sh [payload.json ...]   (por defecto tests/fixtures/nomina-sdworx-ficticia.payload.json)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
PGBIN=/usr/lib/postgresql/17/bin
WORK="$(mktemp -d)"; PORT=55436; chmod 777 "$WORK"
run_pg(){ if [ "$(id -u)" = 0 ]; then su postgres -s /bin/bash -c "$*"; else bash -c "$*"; fi; }
cleanup(){ run_pg "$PGBIN/pg_ctl -D $WORK/data -m immediate stop" >/dev/null 2>&1 || true; rm -rf "$WORK"; }
trap cleanup EXIT
run_pg "$PGBIN/initdb -D $WORK/data -U postgres -A trust >/dev/null"
run_pg "$PGBIN/pg_ctl -D $WORK/data -o '-p $PORT -k $WORK' -l $WORK/log -w start >/dev/null"
PSQL="$PGBIN/psql -h $WORK -p $PORT -U postgres -v ON_ERROR_STOP=1 -qtA"
cp "$ROOT/tools/db-replica/bootstrap.sql" "$WORK/"; chmod 644 "$WORK"/*.sql
$PSQL -f "$WORK/bootstrap.sql" >/dev/null; $PSQL -c "create publication supabase_realtime;" >/dev/null 2>&1
for f in "$ROOT"/supabase/migrations/*.sql; do cp "$f" "$WORK/m.sql"; chmod 644 "$WORK/m.sql"; $PSQL -f "$WORK/m.sql" >/dev/null 2>"$WORK/err" || { cat "$WORK/err"; echo "FALLO migración $(basename "$f")"; exit 1; }; done
U=00000000-0000-4000-8000-0000000000aa
$PSQL -c "insert into auth.users(id,email) values ('$U','prueba@example.test')" >/dev/null
PAYLOADS=("$@"); [ ${#PAYLOADS[@]} -eq 0 ] && PAYLOADS=("$ROOT/tests/fixtures/nomina-sdworx-ficticia.payload.json")
i=0
for P in "${PAYLOADS[@]}"; do i=$((i+1))
  SHA=$(printf '%064d' "$i")
  cp "$P" "$WORK/p.json"; chmod 644 "$WORK/p.json"
  DOC=$($PSQL -c "select (payroll_register_document('$U','$SHA','n$i.pdf','manual','app_upload','application/pdf',1000,'$U/Inbox/$SHA.pdf'))->>'document_id'")
  printf "\\set p \`cat %s\`\nselect payroll_ingest('%s', :'p'::jsonb);\n" "$WORK/p.json" "$DOC" > "$WORK/i.sql"; chmod 644 "$WORK/i.sql"
  OUT=$($PSQL -f "$WORK/i.sql")
  echo "$OUT" | python3 -I -c 'import json,sys; d=json.loads(sys.stdin.read()); assert d["ok"] and not d["duplicate"], d; assert d["review_status"]=="pending", d; print("  OK  ingest nº", d["archived_file_name"], "· revisión", d["review_status"])'
  python3 -I - "$WORK/p.json" <<PY
import json,sys,subprocess
p=json.load(open(sys.argv[1]))['payslip']
row=subprocess.run("$PSQL -c \"select row_to_json(x) from (select payslip_number,gross_salary,net_salary,net_payment,loonheffing,review_status,validation_status,(select count(*) from payroll_line_items l where l.payslip_id=s.id) li from payroll_payslips s where document_id='$DOC') x\"",shell=True,capture_output=True,text=True).stdout
r=json.loads(row)
for k in ['gross_salary','net_salary','net_payment','loonheffing']: assert abs(float(r[k])-p[k])<0.005,(k,r[k],p[k])
assert r['payslip_number']==p['payslip_number'] and r['review_status']=='pending' and r['validation_status']=='review_required', r
assert r['li']>0, r
print("  OK  importes guardados = leídos ·", r['li'], "conceptos · pendiente de revisión")
PY
  DUP=$($PSQL -c "select (payroll_register_document('$U','$SHA','n$i.pdf','manual','app_upload','application/pdf',1000,null))->>'is_duplicate'")
  [ "$DUP" = "true" ] || { echo "FALLO: el mismo PDF subido otra vez debería ser duplicado ($DUP)"; exit 1; }
  echo "  OK  el mismo PDF otra vez = duplicado (no se crea otra nómina)"
done
echo "TODO OK"
