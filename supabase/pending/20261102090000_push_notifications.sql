-- Notificaciones push de Rise (02-11-2026). Decisión de Renzo: aviso al momento de lo nuevo y un resumen diario de lo pendiente.
-- Sin credenciales humanas: la función push-notify genera las claves VAPID la primera vez y las guarda en push_private
-- (sin acceso para anon/authenticated). El secreto del programador lo crea Vault dentro de la base de datos (setup aparte).
-- Rollback: 20261102090000_push_notifications.rollback.sql
begin;

create schema if not exists push_private;
revoke all on schema push_private from public, anon, authenticated;
grant usage on schema push_private to service_role;

create table if not exists push_private.vapid(
 id int primary key default 1 check (id=1),
 public_key text not null check (public_key ~ '^[A-Za-z0-9_-]{80,100}$'),
 private_key text not null check (private_key ~ '^[A-Za-z0-9_-]{40,50}$'),
 created_at timestamptz not null default now());

-- Lo ya avisado: evita repetir un aviso de "nuevo" y el resumen del mismo día.
create table if not exists push_private.sent(
 owner_id uuid not null references auth.users(id) on delete cascade,
 key text not null check (length(key) between 3 and 200),
 sent_at timestamptz not null default now(),
 primary key(owner_id,key));
revoke all on all tables in schema push_private from public, anon, authenticated;
grant select, insert, update, delete on all tables in schema push_private to service_role;

create table if not exists public.push_subscriptions(
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 endpoint text not null unique check (endpoint ~ '^https://' and length(endpoint)<=1000),
 p256dh text not null check (p256dh ~ '^[A-Za-z0-9_-]{80,100}$'),
 auth text not null check (auth ~ '^[A-Za-z0-9_-]{16,30}$'),
 label text not null default '' check (length(label)<=80),
 created_at timestamptz not null default now(),
 last_ok_at timestamptz,
 failures int not null default 0);
alter table public.push_subscriptions enable row level security;
drop policy if exists push_subscriptions_select_own on public.push_subscriptions;
drop policy if exists push_subscriptions_insert_own on public.push_subscriptions;
drop policy if exists push_subscriptions_delete_own on public.push_subscriptions;
create policy push_subscriptions_select_own on public.push_subscriptions for select to authenticated using (owner_id = (select auth.uid()));
create policy push_subscriptions_insert_own on public.push_subscriptions for insert to authenticated with check (owner_id = (select auth.uid()));
create policy push_subscriptions_delete_own on public.push_subscriptions for delete to authenticated using (owner_id = (select auth.uid()));
revoke all on public.push_subscriptions from anon;
grant select, insert, delete on public.push_subscriptions to authenticated;
grant all on public.push_subscriptions to service_role;

-- Clave pública (no es secreta) para suscribir el dispositivo. null hasta que la función la genere.
create or replace function public.push_public_key() returns text language sql stable security definer set search_path='' as $$
 select public_key from push_private.vapid where id=1 $$;
revoke all on function public.push_public_key() from public, anon;
grant execute on function public.push_public_key() to authenticated, service_role;

-- Acceso del servidor (service_role) al esquema privado, que no está expuesto en la API.
create or replace function public.push_srv_cron_ok(p text) returns boolean language sql stable security definer set search_path='' as $$
 select coalesce((select decrypted_secret = p from vault.decrypted_secrets where name='push_cron_secret' limit 1), false) $$;
create or replace function public.push_srv_vapid(p_public text default null, p_private text default null)
returns table(public_key text, private_key text) language plpgsql security definer set search_path='' as $$
begin
 if p_public is not null then
  insert into push_private.vapid(id,public_key,private_key) values(1,p_public,p_private) on conflict (id) do nothing;
 end if;
 return query select v.public_key, v.private_key from push_private.vapid v where v.id=1;
end $$;
create or replace function public.push_srv_sent(p_owner uuid, p_keys text[]) returns text[] language sql stable security definer set search_path='' as $$
 select coalesce(array_agg(key order by key),'{}') from push_private.sent where owner_id=p_owner and key = any(p_keys) $$;
create or replace function public.push_srv_mark(p_owner uuid, p_keys text[]) returns void language sql security definer set search_path='' as $$
 insert into push_private.sent(owner_id,key) select p_owner, k from unnest(p_keys) k where k is not null on conflict do nothing $$;
do $g$ declare f text; begin
 foreach f in array array['public.push_srv_cron_ok(text)','public.push_srv_vapid(text,text)','public.push_srv_sent(uuid,text[])','public.push_srv_mark(uuid,text[])'] loop
  execute format('revoke all on function %s from public, anon, authenticated', f);
  execute format('grant execute on function %s to service_role', f);
 end loop;
end $g$;

commit;
