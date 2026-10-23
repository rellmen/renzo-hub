#!/usr/bin/env bash
# Concurrencia REAL (dos conexiones PostgreSQL independientes) para las RPC Nocturne ya instaladas en staging:
#   - payroll_apply_review_cas  (supabase/pending/20261023124512_payroll_review_cas.sql)
#   - nocturne_review_capture   (supabase/pending/20261023155335_nocturne_capture_review.sql)
# Réplica local vacía + migraciones del repo + datos SINTÉTICOS. Nunca se conecta a Supabase.
# No sustituye la prueba HTTP con dos JWT reales: acredita la semántica transaccional bajo contención.
# Uso: bash tools/db-replica/nocturne_cas_concurrency_test.sh   (PGBIN=/usr/lib/postgresql/16/bin para otra versión)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
PGBIN="${PGBIN:-/usr/lib/postgresql/17/bin}"
WORK="$(mktemp -d)"; PORT=55441; chmod 777 "$WORK"
run_pg(){ if [ "$(id -u)" = 0 ]; then su postgres -s /bin/bash -c "$*"; else bash -c "$*"; fi; }
cleanup(){ run_pg "$PGBIN/pg_ctl -D $WORK/data -m immediate stop" >/dev/null 2>&1 || true; rm -rf "$WORK"; }
trap cleanup EXIT
run_pg "$PGBIN/initdb -D $WORK/data -U postgres -A trust >/dev/null"
run_pg "$PGBIN/pg_ctl -D $WORK/data -o '-p $PORT -k $WORK' -l $WORK/log -w start >/dev/null"
PSQL=("$PGBIN/psql" -h "$WORK" -p "$PORT" -U postgres -v ON_ERROR_STOP=1 -qtA -X)
q(){ "${PSQL[@]}" -c "$1"; }
load(){ cp "$1" "$WORK/m.sql"; chmod 644 "$WORK/m.sql"; "${PSQL[@]}" -f "$WORK/m.sql" >/dev/null 2>"$WORK/err" || { cat "$WORK/err"; echo "FAIL cargando $(basename "$1")"; exit 1; }; }
fail(){ echo "FAIL $*"; for f in "$WORK"/*.log; do [ -f "$f" ] && { echo "--- $f"; cat "$f"; }; done; exit 1; }

load "$ROOT/tools/db-replica/bootstrap.sql"
q "create publication supabase_realtime" >/dev/null 2>&1 || true
# hub_user_state existe en el esquema real (baseline); se crea solo si falta en la réplica.
for f in "$ROOT"/supabase/migrations/*.sql; do load "$f"; done
load "$ROOT/supabase/pending/20261023124512_payroll_review_cas.sql"
load "$ROOT/supabase/pending/20261023155335_nocturne_capture_review.sql"
echo "  OK  esquema: $(ls "$ROOT"/supabase/migrations/*.sql | wc -l) migraciones + 2 RPC pendientes (CAS nómina, revisión captura)"

U=22222222-2222-4222-8222-222222222222; ID=33333333-3333-4333-8333-333333333333; CAP=77777777-7777-4777-8777-777777777777
q "insert into auth.users(id) values('$U')" >/dev/null
q "insert into payroll_employers(id,user_id,name,normalized_code) values('$ID','$U','QA Synthetic','QA');
   insert into payroll_documents(id,user_id,original_file_name,file_sha256,status) values('$ID','$U','synthetic.pdf',repeat('a',64),'processed');
   insert into payroll_payslips(id,user_id,employer_id,document_id,period_type,period_year,period_number,period_label,review_status,net_payment)
   values('$ID','$U','$ID','$ID','weekly',2026,43,'QA 43','pending',500);" >/dev/null
AUTH="set local role authenticated;set local request.jwt.claim.sub='$U';"

# Lanza A (mantiene el lock 3 s) y B con la MISMA versión esperada; B debe esperar y después ser rechazado (40001).
race(){ # $1 nombre, $2 llamada A, $3 llamada B, $4 tabla/relación bloqueada para observar
  local name=$1
  q "set application_name='$name-a';begin;$AUTH $2; select pg_sleep(3);commit;" > "$WORK/$name-a.log" 2>&1 &
  local A=$! seen=0
  for _ in $(seq 1 60); do
    [ "$(q "select count(*) from pg_stat_activity where application_name='$name-a' and query like '%pg_sleep%'")" -gt 0 ] && { seen=1; break; }
    sleep 0.05
  done
  [ $seen = 1 ] || fail "$name: no se observó la transacción A en curso"
  q "set application_name='$name-b';begin;$AUTH $3;commit;" > "$WORK/$name-b.log" 2>&1 &
  local B=$! waited=0
  for _ in $(seq 1 60); do
    [ "$(q "select count(*) from pg_stat_activity where application_name='$name-b' and wait_event_type='Lock'")" -gt 0 ] && { waited=1; break; }
    sleep 0.05
  done
  [ $waited = 1 ] || fail "$name: B no llegó a esperar el bloqueo de fila de A"
  wait $A || fail "$name: A falló"
  if wait $B; then fail "$name: B debía ser rechazada"; fi
  grep -q -E "changed|cambi" "$WORK/$name-b.log" || fail "$name: B rechazada por un motivo inesperado"
  echo "  OK  $name: B esperó el lock de A y fue rechazada por versión ($(grep -o -m1 -E 'Payroll changed[^"]*|Capture changed[^"]*' "$WORK/$name-b.log" | head -c 60))"
}

STAMP=$(q "select updated_at::text from payroll_payslips where id='$ID'")
race payroll \
  "select payroll_apply_review_cas('$ID','$STAMP','{\"net_payment\":501}'::jsonb,'approved')" \
  "select payroll_apply_review_cas('$ID','$STAMP','{\"net_payment\":999}'::jsonb,'approved')"
R=$(q "select net_payment::text||':'||review_status from payroll_payslips where id='$ID'")
[ "$R" = "501.00:approved" ] || fail "payroll estado final $R (esperado 501.00:approved, sin sobrescritura de B)"
[ "$(q 'select count(*) from payroll_corrections')" = 1 ] || fail "payroll: correcciones duplicadas"
echo "  OK  payroll: estado final 501.00/approved, exactamente 1 corrección"

# Captura pendiente con recibo Jarvis EUR: el recibo y el evento deben existir una sola vez.
q "insert into hub_records(id,owner_id,domain,record_type,title,status,payload,source,requires_review)
   values('$CAP','$U','system','renzo_inbox','Recibo QA','needs_review',
   '{\"status\":\"needs_review\",\"category\":\"receipt\",\"source\":\"jarvis\",\"date\":\"2026-10-20\",\"extracted\":{\"amount\":\"12.34\",\"currency\":\"EUR\",\"category\":\"Groceries\"}}','capture',true)" >/dev/null
CSTAMP=$(q "select updated_at::text from hub_records where id='$CAP'")
race capture \
  "select nocturne_review_capture('$CAP','$CSTAMP')" \
  "select nocturne_review_capture('$CAP','$CSTAMP')"
R=$(q "select (select count(*) from hub_records where record_type='renzo_money')||':'||(select count(*) from hub_records where record_type='renzo_event')||':'||(select status from hub_records where id='$CAP')")
[ "$R" = "1:1:reviewed" ] || fail "capture estado final $R (esperado 1 recibo, 1 evento, reviewed)"
echo "  OK  capture: 1 recibo renzo_money, 1 evento, captura reviewed; sin movimiento bancario creado ($(q "select count(*) from hub_records where record_type='bank_tx'") bank_tx)"

# Rollbacks retiran solo las funciones y conservan todas las filas.
BEFORE=$(q "select (select count(*) from hub_records)||':'||(select count(*) from payroll_payslips)||':'||(select count(*) from payroll_corrections)")
load "$ROOT/supabase/pending/20261023155335_nocturne_capture_review.rollback.sql"
load "$ROOT/supabase/pending/20261023124512_payroll_review_cas.rollback.sql"
AFTER=$(q "select (select count(*) from hub_records)||':'||(select count(*) from payroll_payslips)||':'||(select count(*) from payroll_corrections)")
[ "$BEFORE" = "$AFTER" ] || fail "rollback perdió filas $BEFORE -> $AFTER"
[ -z "$(q "select to_regprocedure('public.nocturne_review_capture(uuid,timestamptz)')")" ] || fail "rollback captura no retiró la función"
echo "  OK  rollbacks: funciones retiradas, filas conservadas ($AFTER)"
echo "TEST_OK Nocturne CAS: contención real de 2 conexiones en nómina y captura, una sola escritura, rollback sin pérdida"
