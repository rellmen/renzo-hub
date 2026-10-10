#!/usr/bin/env bash
# Comprueba que supabase/migrations/20261007200000_payroll_schema_baseline.sql reproduce EXACTAMENTE el esquema de Nóminas de staging:
# PostgreSQL 17 vacío + réplica mínima de Supabase -> migración (dos veces: idempotente) -> huella == tests/db/fixtures/payroll_schema_staging_*.json
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
PGBIN=/usr/lib/postgresql/17/bin
WORK="$(mktemp -d)"; PORT=55434; chmod 777 "$WORK"
run_pg(){ if [ "$(id -u)" = 0 ]; then su postgres -s /bin/bash -c "$*"; else bash -c "$*"; fi; }
cleanup(){ run_pg "$PGBIN/pg_ctl -D $WORK/data -m immediate stop" >/dev/null 2>&1 || true; rm -rf "$WORK"; }
trap cleanup EXIT
run_pg "$PGBIN/initdb -D $WORK/data -U postgres -A trust >/dev/null"
run_pg "$PGBIN/pg_ctl -D $WORK/data -o '-p $PORT -k $WORK' -l $WORK/log -w start >/dev/null"
PSQL="$PGBIN/psql -h $WORK -p $PORT -U postgres -v ON_ERROR_STOP=1 -qtA"
cp "$ROOT/tools/db-replica/bootstrap.sql" "$ROOT/supabase/migrations/20261007200000_payroll_schema_baseline.sql" "$ROOT/tools/db-replica/payroll_fingerprint.sql" "$WORK/"; chmod 644 "$WORK"/*.sql
$PSQL -f "$WORK/bootstrap.sql" >/dev/null
$PSQL -c "create publication supabase_realtime;" >/dev/null 2>&1
$PSQL -f "$WORK/20261007200000_payroll_schema_baseline.sql" >/dev/null 2>"$WORK/err1" || { cat "$WORK/err1"; echo "FALLO: la migración no se aplica en una base vacía"; exit 1; }
echo "  OK  se aplica en una base vacía"
$PSQL -f "$WORK/20261007200000_payroll_schema_baseline.sql" >/dev/null 2>"$WORK/err2" || { cat "$WORK/err2"; echo "FALLO: no es idempotente"; exit 1; }
echo "  OK  idempotente (segunda ejecución sin errores)"
$PSQL -f "$WORK/payroll_fingerprint.sql" > "$WORK/local.json"
python3 -I - "$WORK/local.json" "$ROOT"/tests/db/fixtures/payroll_schema_staging_*.json <<'PY'
import json,sys
local=json.loads(open(sys.argv[1]).read().strip())
ref=json.load(open(sorted(sys.argv[2:])[-1]))['huella']
bad=0
for k in ref:
    a,b=set(local.get(k) or []),set(ref[k] or [])
    if a!=b:
        bad+=1; print(f"FALLO {k}: falta {sorted(b-a)[:3]} · sobra {sorted(a-b)[:3]}")
    else: print(f"  OK  {k}: {len(b)} elementos idénticos a staging")
sys.exit(1 if bad else 0)
PY
[ "$($PSQL -c "select count(*) from storage.buckets where id='payroll' and public=false")" = 1 ] || { echo "FALLO: bucket payroll"; exit 1; }
echo "  OK  bucket privado payroll"
[ "$($PSQL -c "select count(*) from pg_publication_tables where pubname='supabase_realtime' and tablename like 'payroll%'")" -ge 1 ] || { echo "FALLO: realtime"; exit 1; }
echo "  OK  realtime"
# Cadena completa: todas las migraciones del repo, en orden, sobre otra base vacía
$PSQL -c "create database cadena;" >/dev/null
PSQL2="$PGBIN/psql -h $WORK -p $PORT -U postgres -d cadena -v ON_ERROR_STOP=1 -qtA"
grep -v "^create role" "$WORK/bootstrap.sql" > "$WORK/bootstrap2.sql"; chmod 644 "$WORK/bootstrap2.sql"; $PSQL2 -f "$WORK/bootstrap2.sql" >/dev/null; $PSQL2 -c "create publication supabase_realtime;" >/dev/null 2>&1
for f in "$ROOT"/supabase/migrations/*.sql; do cp "$f" "$WORK/m.sql"; chmod 644 "$WORK/m.sql"
  $PSQL2 -f "$WORK/m.sql" >/dev/null 2>"$WORK/errc" || { cat "$WORK/errc"; echo "FALLO: cadena completa en $(basename "$f")"; exit 1; }; done
$PSQL2 -f "$WORK/payroll_fingerprint.sql" > "$WORK/cadena.json"
python3 -I - "$WORK/cadena.json" "$ROOT"/tests/db/fixtures/payroll_schema_staging_*.json <<'PY'
import json,sys
local=json.loads(open(sys.argv[1]).read().strip()); ref=json.load(open(sorted(sys.argv[2:])[-1]))['huella']
bad=[k for k in ref if set(local.get(k) or [])!=set(ref[k] or [])]
for k in bad: print(f"FALLO cadena {k}: falta {sorted(set(ref[k])-set(local.get(k) or []))[:3]} · sobra {sorted(set(local.get(k) or [])-set(ref[k]))[:3]}")
sys.exit(1 if bad else 0)
PY
echo "  OK  cadena completa (todas las migraciones del repo en orden) = esquema de Nóminas de staging"
echo "TODO OK"
