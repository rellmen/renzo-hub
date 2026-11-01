#!/usr/bin/env bash
# Academia +25: RLS entre cuentas, claves ocultas, corrección idempotente, cierre de evaluación, CAS y rollback.
# PostgreSQL local con identidades sintéticas; nunca se conecta a Supabase.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
PGBIN="${PGBIN:-/usr/lib/postgresql/17/bin}"
WORK="$(mktemp -d)"; PORT=55441; chmod 777 "$WORK"
run_pg(){ if [ "$(id -u)" = 0 ]; then su postgres -s /bin/bash -c "$*"; else bash -c "$*"; fi; }
cleanup(){ run_pg "$PGBIN/pg_ctl -D $WORK/data -m immediate stop" >/dev/null 2>&1 || true; rm -rf "$WORK"; }
trap cleanup EXIT
run_pg "$PGBIN/initdb -D $WORK/data -U postgres -A trust >/dev/null"
run_pg "$PGBIN/pg_ctl -D $WORK/data -o '-p $PORT -k $WORK' -l $WORK/log -w start >/dev/null"
PSQL=("$PGBIN/psql" -h "$WORK" -p "$PORT" -U postgres -v ON_ERROR_STOP=1 -qtA)
q(){ "${PSQL[@]}" -c "$1"; }
ok(){ echo "  OK  $*"; }
die(){ echo "FAIL $*"; exit 1; }
expect_err(){ local sql="$1" pat="$2" out; if out=$("${PSQL[@]}" -c "$sql" 2>&1); then die "se esperaba error ($pat): $out"; fi; grep -q "$pat" <<<"$out" || die "error inesperado: $out"; }
A=11111111-1111-4111-8111-111111111111; B=22222222-2222-4222-8222-222222222222
AS_A="set local role authenticated;set local request.jwt.claim.sub='$A';"
AS_B="set local role authenticated;set local request.jwt.claim.sub='$B';"
q "create role anon;create role authenticated;create schema auth;create table auth.users(id uuid primary key);
create function auth.uid() returns uuid language sql stable as \$\$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid\$\$;
grant usage on schema auth to anon,authenticated;grant execute on function auth.uid() to anon,authenticated;grant usage on schema public to anon,authenticated;
insert into auth.users values('$A'),('$B');"
MIG="$ROOT/supabase/pending/20261024090000_academy_foundation.sql"
# Las claves de catalán requieren 20261101100000_academy_catalan.sql (probada en academy_catalan_test.sh): aquí se excluyen.
KEYS_SQL="$WORK/keys_sin_catalan.sql"; grep -v "'catalan'" "$ROOT/supabase/seed/academy_question_keys.sql" > "$KEYS_SQL"
RB="$ROOT/supabase/pending/20261024090000_academy_foundation.rollback.sql"
"${PSQL[@]}" -f "$MIG"; "${PSQL[@]}" -f "$KEYS_SQL"
"${PSQL[@]}" -f "$KEYS_SQL"
N=$(q "select count(*) from academy_question_keys"); [ "$N" -gt 90 ] && ok "seed idempotente: $N claves" || die "claves $N"

expect_err "begin;$AS_A select count(*) from academy_question_keys;commit;" "permission denied"
expect_err "begin;set local role anon; select count(*) from academy_question_keys;commit;" "permission denied"
expect_err "begin;set local role anon; select public.academy_grade(gen_random_uuid(),'mat-001','{\"choice\":\"b\"}','practice');commit;" "permission denied"
ok "claves invisibles para authenticated y anon; anon no puede corregir"

C1=aaaaaaaa-0000-4000-8000-000000000001
R=$(q "begin;$AS_A select academy_grade('$C1','mat-001','{\"choice\":\"b\"}','practice')->>'is_correct';commit;")
[ "$R" = true ] || die "corrección MC $R"
R=$(q "begin;$AS_A select academy_grade('$C1','mat-001','{\"choice\":\"a\"}','practice')->>'duplicate';commit;")
[ "$R" = true ] || die "reintento $R"
[ "$(q "select count(*)||':'||bool_and(is_correct) from academy_attempts")" = "1:true" ] || die "duplicado de intento"
ok "corrección en servidor e idempotente (reenvío con otra respuesta no duplica ni cambia la nota)"
expect_err "begin;$AS_A select academy_grade('$C1','mat-002','{\"choice\":\"d\"}','practice');commit;" "reutilizado"
expect_err "begin;$AS_A select academy_grade(gen_random_uuid(),'m00l01-x1','{\"value\":\"7\"}','practice');commit;" "no válida en este modo"
expect_err "begin;$AS_A select academy_grade(gen_random_uuid(),'mat-001','{\"choice\":\"b\"}','exit');commit;" "sesión"
ok "id reutilizado, pregunta de salida en práctica y salida sin sesión rechazados"

R=$(q "begin;$AS_A select academy_grade(gen_random_uuid(),'eco-007','{\"value\":\"41,32\"}','practice')->>'is_correct';commit;")
[ "$R" = true ] || die "decimal con coma"
R=$(q "begin;$AS_A select academy_grade(gen_random_uuid(),'eco-004','{\"value\":\"16.000\"}','practice')->>'is_correct';commit;")
[ "$R" = true ] || die "miles con punto"
R=$(q "begin;$AS_A select academy_grade(gen_random_uuid(),'mat-005','{\"dont_know\":true}','diagnostic')->>'is_correct';commit;")
[ "$R" = false ] || die "no sé"
R=$(q "begin;$AS_A select academy_grade(gen_random_uuid(),'c01l01-x5','{\"text\":\"  TELÉFONO \"}','exit','bbbbbbbb-0000-4000-8000-000000000000')->>'is_correct';commit;" 2>&1 || true)
[ "$R" = true ] || die "texto corto normalizado: $R"
ok "números con coma decimal y punto de miles, 'no sé' y texto corto normalizado"

[ "$(q "begin;$AS_B select count(*) from academy_attempts;commit;")" = 0 ] || die "B ve intentos de A"
ok "la cuenta B no ve intentos de A"

S=cccccccc-0000-4000-8000-000000000001
expect_err "begin;$AS_A select academy_finish_quiz('matematicas-m00-l01','$S','exit');commit;" "Faltan 5 de 5"
for x in "x1:{\"value\":\"7\"}" "x2:{\"choice\":\"b\"}" "x3:{\"value\":\"6\"}" "x4:{\"value\":\"3\"}" "x5:{\"choice\":\"c\"}"; do
  qid="m00l01-${x%%:*}"; ans="${x#*:}"
  q "begin;$AS_A select academy_grade(gen_random_uuid(),'$qid','$ans','exit','$S');commit;" >/dev/null
done
R=$(q "begin;$AS_A select academy_finish_quiz('matematicas-m00-l01','$S','exit')::text;commit;")
grep -q '"pct": 80.0' <<<"$R" && grep -q '"status": "completed"' <<<"$R" && grep -q '"band": "dominio"' <<<"$R" || die "cierre $R"
R2=$(q "begin;$AS_A select academy_finish_quiz('matematicas-m00-l01','$S','exit')->>'duplicate';commit;")
[ "$R2" = true ] || die "cierre duplicado"
[ "$(q "select step||':'||(due_on-current_date) from academy_reviews where user_id='$A'")" = "0:1" ] || die "repaso no programado a +1"
ok "evaluación 4/5 = 80 % ⇒ completada, repaso a +1 día; cerrar dos veces no duplica"
[ "$(q "begin;$AS_B select count(*) from academy_lesson_progress;select count(*) from academy_reviews;commit;" | paste -sd:)" = "0:0" ] || die "B ve progreso de A"
ok "la cuenta B no ve progreso ni repasos de A"

expect_err "begin;$AS_A update academy_lesson_progress set status='mastered' where lesson_id='matematicas-m00-l01';commit;" "permission denied"
expect_err "begin;$AS_A insert into academy_lesson_progress(lesson_id,status) values('matematicas-m00-l02','completed');commit;" "permission denied"
ok "el cliente no puede marcar lecciones como completadas ni dominadas"
q "begin;$AS_A insert into academy_lesson_progress(lesson_id,last_section,draft) values('matematicas-m00-l02','3','{\"notes\":\"a\"}');commit;"
REV=$(q "select revision from academy_lesson_progress where user_id='$A' and lesson_id='matematicas-m00-l02'")
q "begin;$AS_A update academy_lesson_progress set draft='{\"notes\":\"b\"}',revision=$((REV+1)) where lesson_id='matematicas-m00-l02' and revision=$REV;commit;"
expect_err "begin;$AS_A update academy_lesson_progress set draft='{\"notes\":\"c\"}',revision=$((REV+1)) where lesson_id='matematicas-m00-l02';commit;" "otro dispositivo"
[ "$(q "select draft->>'notes' from academy_lesson_progress where user_id='$A' and lesson_id='matematicas-m00-l02'")" = b ] || die "CAS"
[ "$(q "begin;$AS_B update academy_lesson_progress set draft='{}',revision=99 where lesson_id='matematicas-m00-l02' returning 1;commit;")" = "" ] || die "B modifica a A"
ok "autoguardado con CAS: versión obsoleta rechazada; B no puede modificar borradores de A"

X=dddddddd-0000-4000-8000-000000000001
q "begin;$AS_A insert into academy_exam_sessions(client_session_id,profile_id,course,source_url,duration_minutes) values('$X','math_2026_cat_ref','matematicas','https://universitats.gencat.cat/x',90);commit;"
expect_err "begin;$AS_A insert into academy_exam_sessions(client_session_id,profile_id,course) values('$X','math_2026_cat_ref','matematicas');commit;" "duplicate key"
q "begin;$AS_A update academy_exam_sessions set scores='{\"c1\":1.5}',total_score=6.5,status='submitted',revision=2 where client_session_id='$X';commit;"
[ "$(q "begin;$AS_A update academy_exam_sessions set total_score=10,revision=3 where client_session_id='$X' returning 1;commit;")" = "" ] || die "simulacro entregado modificable"
[ "$(q "select total_score||':'||(submitted_at is not null) from academy_exam_sessions")" = "6.5:true" ] || die "simulacro"
ok "simulacro: sesión única por id de cliente, entregado e inmutable"

"${PSQL[@]}" -f "$RB"
[ "$(q "select count(*) from pg_class where relname like 'academy%'")$(q "select count(*) from pg_proc where proname like 'academy%'")" = "00" ] || die "rollback incompleto"
[ "$(q "select count(*) from auth.users")" = 2 ] || die "rollback tocó otras tablas"
"${PSQL[@]}" -f "$MIG" && "${PSQL[@]}" -f "$KEYS_SQL"
ok "rollback elimina solo objetos academy_* y la migración se puede reaplicar"
echo "TEST_OK Academia: RLS, claves ocultas, idempotencia, cierre de evaluación, CAS, simulacros y rollback"
