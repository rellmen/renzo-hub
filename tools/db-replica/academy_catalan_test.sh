#!/usr/bin/env bash
# Academia +25 · catalán (01-11-2026): el curso catalan se admite en claves, simulacros y exámenes; rollback limpio.
# Comprueba también que las filas existentes no cambian y que la elección por defecto vuelve a Economía.
# PostgreSQL local con identidades sintéticas; nunca se conecta a Supabase.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
PGBIN="${PGBIN:-/usr/lib/postgresql/17/bin}"
WORK="$(mktemp -d)"; PORT=55452; chmod 777 "$WORK"
run_pg(){ if [ "$(id -u)" = 0 ]; then su postgres -s /bin/bash -c "$*"; else bash -c "$*"; fi; }
cleanup(){ run_pg "$PGBIN/pg_ctl -D $WORK/data -m immediate stop" >/dev/null 2>&1 || true; rm -rf "$WORK"; }
trap cleanup EXIT
run_pg "$PGBIN/initdb -D $WORK/data -U postgres -A trust >/dev/null"
run_pg "$PGBIN/pg_ctl -D $WORK/data -o '-p $PORT -k $WORK' -l $WORK/log -w start >/dev/null"
PSQL=("$PGBIN/psql" -h "$WORK" -p "$PORT" -U postgres -v ON_ERROR_STOP=1 -qtA)
q(){ "${PSQL[@]}" -c "$1"; }
ok(){ echo "  OK  $*"; }
die(){ echo "FAIL $*"; exit 1; }
expect_err(){ local sql="$1" pat="$2" out; if out=$("${PSQL[@]}" -c "$sql" 2>&1); then die "se esperaba error ($pat): $out"; fi; grep -q "$pat" <<<"$out" || die "error inesperado ($pat): $out"; }
A=11111111-1111-4111-8111-111111111111; B=22222222-2222-4222-8222-222222222222
AS_A="set local role authenticated;set local request.jwt.claim.sub='$A';"
AS_B="set local role authenticated;set local request.jwt.claim.sub='$B';"
asA(){ q "begin;$AS_A $1;commit;"; }
q "create role anon;create role authenticated;create schema auth;create table auth.users(id uuid primary key);
create function auth.uid() returns uuid language sql stable as \$\$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid\$\$;
grant usage on schema auth to anon,authenticated;grant execute on function auth.uid() to anon,authenticated;grant usage on schema public to anon,authenticated;
insert into auth.users values('$A'),('$B');"
F="$ROOT/supabase/pending/20261024090000_academy_foundation.sql"
M="$ROOT/supabase/pending/20261024200000_academy_mocks.sql"
MIG="$ROOT/supabase/pending/20261101100000_academy_catalan.sql"
RB="$ROOT/supabase/pending/20261101100000_academy_catalan.rollback.sql"
SEED="$ROOT/supabase/seed/academy_question_keys.sql"
MSEED="$ROOT/supabase/seed/academy_mock_keys.sql"
"${PSQL[@]}" -f "$F"; "${PSQL[@]}" -f "$M"; "${PSQL[@]}" -f "$MSEED"
# Antes de la migración solo se pueden cargar las claves que no son de catalán.
grep -v "'catalan'" "$SEED" > "$WORK/seed_sin_catalan.sql"; "${PSQL[@]}" -f "$WORK/seed_sin_catalan.sql"
expect_err "$(grep -m1 "'catalan'" "$SEED")" "academy_question_keys_course_check"
ok "el seed nuevo no se puede cargar sin la migración (las claves de catalán se rechazan)"
KEYS=$(q "select md5(string_agg(question_id||key::text,',' order by question_id)) from academy_question_keys")
DEFS=$(q "select count(*) from academy_mock_defs")
KEYQ="insert into academy_question_keys(question_id,lesson_id,course,kind,role,key) values('k-test-1','catalan-k01-l01','catalan','multiple_choice','exit','{\"correct_choice_id\":\"a\"}')"
expect_err "$KEYQ" "academy_question_keys_course_check"
ok "antes de migrar, catalan se rechaza"
"${PSQL[@]}" -f "$MIG"
q "$KEYQ"
q "insert into academy_mock_defs(mock_id,course,title,duration_minutes,structure) values('s9-catalan','catalan','Prova',90,'{\"sections\":[]}')"
[ "$(q "select column_default from information_schema.columns where table_name='academy_preferences' and column_name='elective'")" = "'economia'::text" ] || die "elective por defecto"
[ "$(q "select md5(string_agg(question_id||key::text,',' order by question_id)) from academy_question_keys where question_id<>'k-test-1'")" = "$KEYS" ] || die "claves existentes alteradas"
[ "$(q "select count(*) from academy_mock_defs where course<>'catalan'")" = "$DEFS" ] || die "simulacros existentes alterados"
expect_err "insert into academy_question_keys(question_id,lesson_id,course,kind,role,key) values('k-test-2','x-x-x','aleman','multiple_choice','exit','{}')" "academy_question_keys_course_check"
ok "migración: catalan admitido, otras asignaturas siguen rechazadas, filas existentes intactas, Economía por defecto"
q "delete from academy_question_keys where question_id='k-test-1'"
"${PSQL[@]}" -f "$SEED"; "${PSQL[@]}" -f "$SEED"
NCAT=$(q "select count(*) from academy_question_keys where course='catalan'"); [ "$NCAT" = 55 ] || die "claves de catalán $NCAT"
[ "$(q "select md5(string_agg(question_id||key::text,',' order by question_id)) from academy_question_keys where course<>'catalan'")" = "$KEYS" ] || die "el seed alteró claves existentes"
ok "seed completo idempotente: 55 claves de catalán, las demás idénticas"
"${PSQL[@]}" -f "$RB"
[ "$(q "select count(*) from academy_question_keys where course='catalan'")" = 0 ] || die "rollback deja claves de catalán"
[ "$(q "select count(*) from academy_mock_defs where course='catalan'")" = 0 ] || die "rollback deja simulacros de catalán"
[ "$(q "select md5(string_agg(question_id||key::text,',' order by question_id)) from academy_question_keys")" = "$KEYS" ] || die "rollback alteró claves"
expect_err "$KEYQ" "academy_question_keys_course_check"
"${PSQL[@]}" -f "$MIG"; q "$KEYQ"
ok "rollback limpio y migración reaplicable"
echo "academy_catalan_test: OK"
