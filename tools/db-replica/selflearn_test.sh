#!/usr/bin/env bash
# Two independent PostgreSQL 17 connections, synthetic owner only; never Supabase.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
PGBIN=/usr/lib/postgresql/17/bin
WORK="$(mktemp -d)"; PORT=55439; chmod 777 "$WORK"
run_pg(){ if [ "$(id -u)" = 0 ]; then su postgres -s /bin/bash -c "$*"; else bash -c "$*"; fi; }
cleanup(){ run_pg "$PGBIN/pg_ctl -D $WORK/data -m immediate stop" >/dev/null 2>&1 || true; rm -rf "$WORK"; }
trap cleanup EXIT
run_pg "$PGBIN/initdb -D $WORK/data -U postgres -A trust >/dev/null"
run_pg "$PGBIN/pg_ctl -D $WORK/data -o '-p $PORT -k $WORK' -l $WORK/log -w start >/dev/null"
PSQL=("$PGBIN/psql" -h "$WORK" -p "$PORT" -U postgres -v ON_ERROR_STOP=1 -qtA)
q(){ "${PSQL[@]}" -c "$1"; }
q "create role anon;create role authenticated;create schema auth;create table auth.users(id uuid primary key);
create function auth.uid() returns uuid language sql stable as \$\$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid\$\$;
grant usage on schema auth to authenticated;grant execute on function auth.uid() to authenticated;
create table public.hub_user_state(owner_id uuid,state jsonb);grant select on hub_user_state to authenticated;"
"${PSQL[@]}" -f "$ROOT/supabase/migrations/20261007000206_add_shared_hub_records.sql"
"${PSQL[@]}" -f "$ROOT/supabase/pending/20261022090000_selflearn_transactions.sql"
q "insert into auth.users values('22222222-2222-4222-8222-222222222222')"
AUTH="set local role authenticated;set local request.jwt.claim.sub='22222222-2222-4222-8222-222222222222';"
INSERT="insert into hub_records(owner_id,domain,record_type,payload) values(auth.uid(),'system','renzo_event','{\"kind\":\"learning\",\"course\":\"nl\",\"practice\":\"Study path\",\"courseLessonId\":\"a1-legacy-1\",\"xp\":10}') on conflict(id) do update set payload=excluded.payload;
insert into hub_records(owner_id,domain,record_type,payload) values(auth.uid(),'learning','renzo_vocabulary','{\"course\":\"nl\",\"front\":\"de winkel\",\"back\":\"la tienda\"}') on conflict(id) do update set payload=excluded.payload;"
q "begin;$AUTH insert into hub_records(id,owner_id,domain,record_type,payload) values('33333333-3333-4333-8333-333333333333',auth.uid(),'learning','learning_run','{\"sessionId\":\"33333333-3333-4333-8333-333333333333\",\"course\":\"nl\",\"run\":{\"version\":2,\"mode\":\"lesson\",\"course\":\"nl\",\"unitId\":\"a1-legacy-1\",\"index\":1,\"queue\":[\"s1\"],\"steps\":[{\"id\":\"s1\",\"type\":\"choice\"}],\"attempts\":{\"s1\":1},\"firstTry\":{\"s1\":true}}}');commit;"
RPC=$(cat <<'SQL'
select selflearn_finalize_lesson('33333333-3333-4333-8333-333333333333',
'{"id":"55555555-5555-4555-8555-555555555555","owner_id":"22222222-2222-4222-8222-222222222222","payload":{"kind":"learning","practice":"Study path","course":"nl","courseLessonId":"a1-legacy-1","passed":true,"score":1,"totalQuestions":1,"xp":10}}',
'[{"id":"66666666-6666-4666-8666-666666666666","owner_id":"22222222-2222-4222-8222-222222222222","payload":{"course":"nl","unitId":"a1-legacy-1","front":"de winkel","back":"la tienda","repetitions":0}}]');
SQL
)
q "set application_name='selflearn-a';begin;$AUTH $RPC select pg_sleep(4);commit;" > "$WORK/client-a.log" 2>&1 &
CLIENT_A=$!
OBSERVED_A=0
for attempt in $(seq 1 50); do
  if [ "$(q "select count(*) from pg_locks where locktype='advisory' and granted")" -gt 0 ]; then OBSERVED_A=1;break; fi
  sleep 0.05
done
[ "$OBSERVED_A" = 1 ] || { echo 'FAIL did not observe client A lock';exit 1; }
q "set application_name='selflearn-b';begin;$AUTH $INSERT commit;" > "$WORK/client-b.log" 2>&1 &
CLIENT_B=$!
OBSERVED_B=0
for attempt in $(seq 1 50); do
  if [ "$(q "select count(*) from pg_stat_activity where application_name='selflearn-b' and wait_event_type='Lock' and wait_event='advisory'")" -gt 0 ]; then OBSERVED_B=1;break; fi
  sleep 0.05
done
[ "$OBSERVED_B" = 1 ] || { echo 'FAIL did not observe classic client waiting for RPC transaction';exit 1; }
wait "$CLIENT_A" || { cat "$WORK/client-a.log"; exit 1; }
wait "$CLIENT_B" || { cat "$WORK/client-b.log"; exit 1; }
RESULT=$(q "select count(*)||':'||sum((payload->>'xp')::int) from hub_records where record_type='renzo_event'")
[ "$RESULT" = '2:10' ] || { echo "FAIL competing awards $RESULT";exit 1; }
[ "$(q "select count(*) from hub_records where record_type='renzo_vocabulary'")" = '1' ] || { echo 'FAIL duplicate word';exit 1; }
BEFORE=$(q 'select count(*) from hub_records')
"${PSQL[@]}" -f "$ROOT/supabase/pending/20261022090000_selflearn_transactions.rollback.sql"
[ "$(q 'select count(*) from hub_records')" = "$BEFORE" ] || { echo 'FAIL rollback lost history';exit 1; }
echo 'TEST_OK SelfLearn: observed classic/RPC contention, one XP award, one vocabulary card, rollback preserves history'
