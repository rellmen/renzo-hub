#!/usr/bin/env bash
# Notificaciones push (02-11-2026): RLS de suscripciones, esquema privado inaccesible, funciones solo para el servidor,
# claves VAPID creadas una sola vez, registro de avisos idempotente, secreto del programador y rollback limpio.
# PostgreSQL local con identidades sintéticas y Vault simulado; nunca se conecta a Supabase.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
PGBIN="${PGBIN:-/usr/lib/postgresql/17/bin}"
WORK="$(mktemp -d)"; PORT=55461; chmod 777 "$WORK"
run_pg(){ if [ "$(id -u)" = 0 ]; then su postgres -s /bin/bash -c "$*"; else bash -c "$*"; fi; }
cleanup(){ run_pg "$PGBIN/pg_ctl -D $WORK/data -m immediate stop" >/dev/null 2>&1 || true; rm -rf "$WORK"; }
trap cleanup EXIT
run_pg "$PGBIN/initdb -D $WORK/data -U postgres -A trust >/dev/null"
run_pg "$PGBIN/pg_ctl -D $WORK/data -o '-p $PORT -k $WORK' -l $WORK/log -w start >/dev/null"
PSQL=("$PGBIN/psql" -h "$WORK" -p "$PORT" -U postgres -v ON_ERROR_STOP=1 -qtA)
q(){ "${PSQL[@]}" -c "$1"; }
ok(){ echo "  OK  $*"; }
die(){ echo "FAIL $*"; exit 1; }
expect_err(){ local sql="$1" pat="$2" out; if out=$("${PSQL[@]}" -c "$sql" 2>&1); then die "se esperaba error ($pat): $out"; fi; grep -qi "$pat" <<<"$out" || die "error inesperado ($pat): $out"; }
A=11111111-1111-4111-8111-111111111111; B=22222222-2222-4222-8222-222222222222
AS_A="set local role authenticated;set local request.jwt.claim.sub='$A';"
AS_B="set local role authenticated;set local request.jwt.claim.sub='$B';"
SRV="set local role service_role;"
P=$(printf 'B%.0s' $(seq 1 87)); AU=$(printf 'c%.0s' $(seq 1 22))
q "create role anon;create role authenticated;create role service_role;create schema auth;create table auth.users(id uuid primary key);
create function auth.uid() returns uuid language sql stable as \$\$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid\$\$;
grant usage on schema auth to anon,authenticated,service_role;grant execute on function auth.uid() to anon,authenticated,service_role;
grant usage on schema public to anon,authenticated,service_role;
create schema vault;create table vault.secrets(id uuid primary key default gen_random_uuid(),name text unique,secret text);
create view vault.decrypted_secrets as select id,name,secret as decrypted_secret from vault.secrets;
insert into auth.users values('$A'),('$B');"
MIG="$ROOT/supabase/pending/20261102090000_push_notifications.sql"
RB="$ROOT/supabase/pending/20261102090000_push_notifications.rollback.sql"
"${PSQL[@]}" -f "$MIG"
"${PSQL[@]}" -f "$MIG"
ok "migración aplicada e idempotente"

q "begin;$AS_A insert into push_subscriptions(endpoint,p256dh,auth,label) values('https://push.example/a','$P','$AU','iPhone');commit;"
q "begin;$AS_B insert into push_subscriptions(endpoint,p256dh,auth) values('https://push.example/b','$P','$AU');commit;"
[ "$(q "begin;$AS_A select count(*) from push_subscriptions;commit;")" = 1 ] || die "A ve suscripciones ajenas"
[ "$(q "begin;$AS_B delete from push_subscriptions where endpoint='https://push.example/a' returning 1;commit;")" = "" ] || die "B borra la de A"
expect_err "begin;$AS_A insert into push_subscriptions(owner_id,endpoint,p256dh,auth) values('$B','https://push.example/x','$P','$AU');commit;" "row-level security"
expect_err "begin;$AS_A update push_subscriptions set failures=9;commit;" "permission denied"
expect_err "begin;$AS_A insert into push_subscriptions(endpoint,p256dh,auth) values('http://inseguro','$P','$AU');commit;" "check constraint"
expect_err "begin;set local role anon; select * from push_subscriptions;commit;" "permission denied"
ok "suscripciones: cada uno solo ve y borra las suyas, sin http, sin anon"

expect_err "begin;$AS_A select * from push_private.vapid;commit;" "permission denied"
expect_err "begin;$AS_A select * from push_srv_vapid();commit;" "permission denied"
expect_err "begin;$AS_A select push_srv_cron_ok('x');commit;" "permission denied"
expect_err "begin;$AS_A select push_srv_mark('$A',array['k']);commit;" "permission denied"
expect_err "begin;set local role anon; select push_public_key();commit;" "permission denied"
[ "$(q "begin;$AS_A select coalesce(push_public_key(),'NULL');commit;")" = "NULL" ] || die "clave sin generar"
ok "esquema privado y funciones del servidor cerrados para usuarios y anon"

PUB=$(printf 'Q%.0s' $(seq 1 87)); PRIV=$(printf 'd%.0s' $(seq 1 43))
q "begin;$SRV select * from push_srv_vapid('$PUB','$PRIV');commit;" >/dev/null
q "begin;$SRV select * from push_srv_vapid('$(printf 'Z%.0s' $(seq 1 87))','$PRIV');commit;" >/dev/null
[ "$(q "begin;$AS_B select push_public_key();commit;")" = "$PUB" ] || die "la clave cambió o no es pública"
ok "claves VAPID: se crean una sola vez y solo la pública es legible"

q "begin;$SRV select push_srv_mark('$A',array['inbox:1','inbox:1','digest:2026-11-02']);commit;" >/dev/null
[ "$(q "begin;$SRV select array_to_string(push_srv_sent('$A',array['inbox:1','inbox:2','digest:2026-11-02']),',');commit;")" = "inbox:1,digest:2026-11-02" ] || die "sent"
[ "$(q "begin;$SRV select cardinality(push_srv_sent('$B',array['inbox:1']));commit;")" = 0 ] || die "sent por usuario"
ok "registro de avisos idempotente y por usuario"

[ "$(q "begin;$SRV select push_srv_cron_ok('x');commit;")" = f ] || die "sin secreto"
q "insert into vault.secrets(name,secret) values('push_cron_secret','s3cr3t')"
[ "$(q "begin;$SRV select push_srv_cron_ok('s3cr3t')::text||push_srv_cron_ok('otro')::text;commit;")" = truefalse ] || die "cron_ok"
ok "secreto del programador comprobado sin poder leerlo"

q "delete from auth.users where id='$A'"
[ "$(q "select count(*) from push_subscriptions where owner_id='$A'")" = 0 ] || die "cascada subs"
[ "$(q "select count(*) from push_private.sent where owner_id='$A'")" = 0 ] || die "cascada sent"
ok "borrar el usuario borra sus dispositivos y su registro"

"${PSQL[@]}" -f "$RB"
[ "$(q "select count(*) from pg_namespace where nspname='push_private'")" = 0 ] || die "rollback esquema"
[ "$(q "select count(*) from pg_proc where proname like 'push_%'")" = 0 ] || die "rollback funciones"
[ "$(q "select count(*) from information_schema.tables where table_name='push_subscriptions'")" = 0 ] || die "rollback tabla"
"${PSQL[@]}" -f "$MIG"
ok "rollback limpio y migración reaplicable"
echo "push_notifications_test: OK"
