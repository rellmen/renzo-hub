#!/usr/bin/env bash
# Academia +25 · simulacros: claves ocultas, cronómetro en servidor, CAS, elección de preguntas, penalizaciones,
# unidades, grupos de descuento, regla de palabras, autocorrección acotada, aislamiento entre cuentas y rollback.
# PostgreSQL local con identidades sintéticas; nunca se conecta a Supabase.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
PGBIN="${PGBIN:-/usr/lib/postgresql/17/bin}"
WORK="$(mktemp -d)"; PORT=55442; chmod 777 "$WORK"
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
MIG="$ROOT/supabase/pending/20261024200000_academy_mocks.sql"
RB="$ROOT/supabase/pending/20261024200000_academy_mocks.rollback.sql"
SEED="$ROOT/supabase/seed/academy_mock_keys.sql"
"${PSQL[@]}" -f "$F"; "${PSQL[@]}" -f "$MIG"; "${PSQL[@]}" -f "$SEED"; "${PSQL[@]}" -f "$SEED"
[ "$(q "select count(*) from academy_mock_defs")" = 5 ] || die "defs"
N=$(q "select count(*) from academy_mock_items"); [ "$N" -gt 100 ] && ok "seed idempotente: 5 simulacros, $N preguntas" || die "items $N"
[ "$(q "select column_default from information_schema.columns where table_name='academy_preferences' and column_name='elective'")" = "'fisica'::text" ] || die "elective por defecto"
ok "la segunda específica por defecto pasa a Física"

expect_err "begin;$AS_A select count(*) from academy_mock_items;commit;" "permission denied"
expect_err "begin;$AS_A select count(*) from academy_mock_defs;commit;" "permission denied"
expect_err "begin;set local role anon; select academy_mock_start(gen_random_uuid(),'s1-matematicas');commit;" "permission denied"
expect_err "begin;$AS_A insert into academy_mock_sessions(user_id,client_session_id,mock_id,course,content_version,duration_minutes,deadline_at) values('$A',gen_random_uuid(),'s1-matematicas','matematicas',1,90,now());commit;" "permission denied"
expect_err "begin;$AS_A select academy_parse_sci('1');commit;" "permission denied"
ok "claves y soluciones invisibles; anon no inicia; el cliente no inserta sesiones ni usa funciones internas"

R=$(q "select academy_parse_sci('1,6e-13')=1.6e-13 and academy_parse_sci('1,6·10⁻¹³')=1.6e-13 and academy_parse_sci('4,8 x 10^3')=4800 and academy_parse_sci('30.000')=30000 and academy_parse_sci('8/3') between 2.66 and 2.67")
[ "$R" = t ] || die "notación científica $R"
[ "$(q "select academy_norm_unit('m/s²')=academy_norm_unit('m/s2') and academy_norm_unit('Ω')=academy_norm_unit('ohm') and academy_norm_unit('º')=academy_norm_unit('grados')")" = t ] || die "unidades"
ok "notación científica (e, ·10^, x10, superíndices), miles con punto, fracciones y unidades equivalentes"

# --- Matemáticas: inicio idempotente, CAS, elección y corrección ---
C1=aaaaaaaa-0000-4000-8000-000000000001
S=$(asA "select academy_mock_start('$C1','s1-matematicas')->>'id'")
[ "$(asA "select academy_mock_start('$C1','s1-matematicas')->>'id'")" = "$S" ] || die "inicio no idempotente"
[ "$(asA "select (academy_mock_start('$C1','s1-matematicas')->>'deadline_at')::timestamptz-(academy_mock_start('$C1','s1-matematicas')->>'started_at')::timestamptz = interval '90 minutes'")" = t ] || die "límite"
expect_err "begin;$AS_A select academy_mock_start(gen_random_uuid(),'s1-fisica');commit;" "en curso"
ok "inicio idempotente, límite de 90 min fijado por el servidor y un solo simulacro en curso"

ANS='{"c1b":{"choice":"no"},"c1a":{"text":"x+3y+2z-5=0"},"c2b":{"choice":"a"},"c2x":{"value":"1"},"c2y":{"value":"-1"},"c2z":{"value":"2"},
 "c3a":{"choice":"a"},"c3b":{"choice":"a"},"c4a":{"value":"2"},"c5a":{"choice":"a"},"c5b":{"value":"8/3"},"c5c":{"value":"2,0"},
 "p2y":{"value":"150"},"p2x":{"value":"200"},"p2c":{"value":"30.000"},"p2a":{"text":"A(y)=400y-4/3y^2"}}'
CH='{"p1":["c1","c2","c3","c5"],"p2":["pr2"]}'
[ "$(asA "select academy_mock_save('$S',1,'$ANS','$CH')->>'revision'")" = 2 ] || die "guardado"
expect_err "begin;$AS_A select academy_mock_save('$S',1,'$ANS','$CH');commit;" "otro dispositivo"
expect_err "begin;$AS_A select academy_mock_save('$S',2,'{\"zz\":{\"value\":\"1\"}}','{}');commit;" "no existe"
expect_err "begin;$AS_A select academy_mock_save('$S',2,'{}','{\"p1\":[\"c1\",\"c2\",\"c3\",\"c4\",\"c5\"]}');commit;" "solo puedes elegir 4"
expect_err "begin;$AS_A select academy_mock_save('$S',2,'{}','{\"p1\":[\"c1\",\"c1\"]}');commit;" "repetida"
[ "$(q "begin;$AS_B select count(*) from academy_mock_sessions;commit;")" = 0 ] || die "B ve sesiones de A"
expect_err "begin;$AS_B select academy_mock_submit('$S','{}','{}');commit;" "no encontrado"
ok "autoguardado con CAS; respuestas a preguntas inexistentes, más de 4 cuestiones y repeticiones rechazadas; B no ve ni entrega lo de A"

R=$(asA "select academy_mock_submit('$S','$ANS','$CH')::text")
grep -q '"auto_score": 4.5' <<<"$R" || die "nota automática matemáticas: $R"
grep -q '"open_max": 4' <<<"$R" || die "máximo abierto: $R"
[ "$(asA "select (result->'items'->'c4a'->>'status')||':'||(result->'items'->'c3b'->>'score')||':'||(result->'items'->'c2z'->>'status')||':'||(result->'items'->'c1a'->>'status') from academy_mock_sessions where id='$S'")" = "not_chosen:-0.25:wrong:open" ] || die "detalle"
[ "$(asA "select academy_mock_submit('$S','{}','{}')->>'duplicate'")" = true ] || die "entrega doble"
ok "entrega: test con −0,25, cuestión no elegida sin puntuar, fracciones y miles → 4,5 automáticos; reentregar no cambia nada"

expect_err "begin;$AS_A select academy_mock_self_score('$S','{\"c1a\":1.5}');commit;" "entre 0 y 1"
expect_err "begin;$AS_A select academy_mock_self_score('$S','{\"c6a\":0.5}');commit;" "abiertas elegidas"
expect_err "begin;$AS_A select academy_mock_self_score('$S','{\"c1b\":0.5}');commit;" "abiertas elegidas"
R=$(asA "select academy_mock_self_score('$S','{\"c1a\":1,\"c2a\":0.5,\"p2a\":1,\"p2b\":0.5}')->>'total_score'")
[ "$R" = 7.5 ] || die "total $R"
[ "$(asA "select academy_mock_self_score('$S','{\"c1a\":0}')->>'duplicate'")" = true ] || die "recalificar"
[ "$(q "select status||':'||total_score from academy_mock_sessions where id='$S'")" = "graded:7.5" ] || die "estado final"
ok "autocorrección acotada al máximo de cada pregunta abierta elegida; total 7,5 e inmutable"

# --- Física: unidades ---
S2=$(asA "select academy_mock_start(gen_random_uuid(),'s1-fisica')->>'id'")
PA='{"c2a":{"value":"4","unit":"m/s²"},"c2b":{"value":"5","unit":""},"c2c":{"value":"4,8e3","unit":"N"},"c3a":{"value":"7,56·10^3","unit":"m/s"},"c3b":{"value":"97","unit":"min"},
 "p1f":{"value":"1,6·10⁻¹³","unit":"N"},"p1r":{"value":"4,2e-2","unit":"m"},"p1t":{"value":"1,31e-7","unit":"s"},"p1w":{"choice":"a"}}'
R=$(asA "select academy_mock_submit('$S2','$PA','{\"p1\":[\"c2\",\"c3\"],\"p2\":[\"pr1\"]}')::text")
grep -q '"auto_score": 5.75' <<<"$R" || die "física: $R"
[ "$(asA "select result->'items'->'c2b'->>'status'||':'||(result->'items'->'c2b'->>'score') from academy_mock_sessions where id='$S2'")" = "unit:0" ] || die "unidad: $(asA "select result->'items'->'c2b' from academy_mock_sessions where id='$S2'")"
ok "Física: sin unidad resta 0,5 (o anula si vale menos), notación científica aceptada → 5,75 automáticos"
asA "select academy_mock_self_score('$S2','{}')" >/dev/null

# --- Castellano: grupos de descuento, suelo a 0, tildes y texto normalizado ---
S3=$(asA "select academy_mock_start(gen_random_uuid(),'s1-castellano')->>'id'")
CA='{"c11":{"choice":"a"},"c12":{"choice":"a"},"c13":{"choice":"b"},"c15":{"choice":"a"},
 "r31camion":{"text":"camión"},"r31arbol":{"text":"arbol"},"r31examen":{"text":"examen"},"r31cesped":{"text":"césped"},"r31heroe":{"text":"heroe"},"r31raiz":{"text":"raíz"},
 "r32":{"choice":"a"},"r340":{"text":"conduje"},"r341":{"text":"quepo"},"r342":{"text":"anduvieron"},"r343":{"text":"Satisfará"},"r344":{"text":" haya "},
 "r35a":{"choice":"a"},"r35b":{"text":"matias"},"r36a":{"text":"Contó."},"r36b":{"text":"iba"},"r36c":{"text":"visitó"}}'
R=$(asA "select academy_mock_submit('$S3','$CA','{}')::text")
grep -q '"auto_score": 2.15' <<<"$R" || die "castellano: $R"
[ "$(asA "select string_agg(g->>'group_id'||'='||(g->>'auto_score'),',' order by g->>'group_id') from academy_mock_sessions, jsonb_array_elements(result->'groups') g where id='$S3'")" = "comp=0,e21=0,e22=0,r31=0.3,r32=0.5,r33=0,r34=0.5,r35=0.5,r36=0.35" ] || die "grupos"
ok "Castellano: test con suelo 0, tildes exigidas (−0,1 por palabra), en blanco descuenta, mayúsculas y punto final normalizados → 2,15"
asA "select academy_mock_self_score('$S3','{}')" >/dev/null

# --- Comentario: penalización por número de palabras aplicada en servidor ---
S4=$(asA "select academy_mock_start(gen_random_uuid(),'s1-comentario')->>'id'")
W120=$(python3 -c "print(' '.join(['palabra']*120))")
CO="{\"q11\":{\"choice\":\"b\"},\"q12\":{\"choice\":\"b\"},\"q13\":{\"choice\":\"c\"},\"q14\":{\"choice\":\"b\"},\"q15\":{\"choice\":\"b\"},\"q16\":{\"choice\":\"c\"},\"ea\":{\"text\":\"$W120\"}}"
R=$(asA "select academy_mock_submit('$S4','$CO','{\"p2\":[\"oa\"]}')::text")
grep -q '"auto_score": 3' <<<"$R" || die "comentario: $R"
[ "$(asA "select result->'items'->'ea'->>'word_count' from academy_mock_sessions where id='$S4'")" = 120 ] || die "recuento"
R=$(asA "select academy_mock_self_score('$S4','{\"q21\":1,\"q22\":0.5,\"q23\":1,\"ea\":3}')::text")
grep -q '"total_score": 8' <<<"$R" && grep -q '"penalty": 0.5' <<<"$R" || die "penalización palabras: $R"
ok "Comentario: redacción de 120 palabras pierde 0,5 en servidor; total 8"

# --- Cronómetro: después del límite + 2 min no se aceptan cambios y se corrige lo último guardado ---
S5=$(asA "select academy_mock_start(gen_random_uuid(),'s1-ingles')->>'id'")
asA "select academy_mock_save('$S5',1,'{\"e1\":{\"choice\":\"b\"}}','{}')" >/dev/null
q "update academy_mock_sessions set deadline_at=now()-interval '5 minutes' where id='$S5'"
expect_err "begin;$AS_A select academy_mock_save('$S5',2,'{\"e1\":{\"choice\":\"b\"},\"e2\":{\"choice\":\"c\"}}','{}');commit;" "Tiempo agotado"
R=$(asA "select academy_mock_submit('$S5','{\"e1\":{\"choice\":\"b\"},\"e2\":{\"choice\":\"c\"},\"e3\":{\"choice\":\"b\"}}','{}')::text")
grep -q '"late_answers_ignored": true' <<<"$R" && grep -q '"auto_score": 1' <<<"$R" || die "tiempo: $R"
ok "fuera de tiempo: no se guardan cambios y la entrega usa lo guardado antes del límite (1 punto, no 3)"
S6=$(asA "select academy_mock_start(gen_random_uuid(),'s1-ingles')->>'id'")
R=$(asA "select academy_mock_submit('$S6','{\"e1\":{\"choice\":\"a\"},\"e2\":{\"choice\":\"a\"},\"e3\":{\"choice\":\"b\"}}','{}')::text")
grep -q '"auto_score": 0.34' <<<"$R" || die "inglés: $R"
ok "Inglés: −0,33 por fallo (1 − 0,66 = 0,34)"

"${PSQL[@]}" -f "$RB"
[ "$(q "select count(*) from pg_class where relname like 'academy_mock%'")$(q "select count(*) from pg_proc where proname in ('academy_parse_sci','academy_norm_unit','academy_word_count') or proname like 'academy_mock%'")" = "00" ] || die "rollback incompleto"
[ "$(q "select count(*) from pg_class where relname='academy_question_keys'")" = 1 ] || die "rollback tocó la fundación"
[ "$(q "select column_default from information_schema.columns where table_name='academy_preferences' and column_name='elective'")" = "'economia'::text" ] || die "rollback del valor por defecto"
"${PSQL[@]}" -f "$MIG" && "${PSQL[@]}" -f "$SEED"
ok "rollback elimina solo objetos de simulacros, restaura el valor por defecto y la migración se puede reaplicar"
echo "TEST_OK Academia simulacros: claves ocultas, cronómetro, CAS, elección, penalizaciones, unidades, palabras, autocorrección, aislamiento y rollback"
