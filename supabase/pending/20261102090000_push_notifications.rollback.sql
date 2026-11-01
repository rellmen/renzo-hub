-- Rollback de notificaciones push. Borra suscripciones, claves y registro de avisos; no toca otros datos.
-- El programador y el secreto se retiran con supabase/pending/push_notifications_setup.rollback.sql (ejecutar antes).
begin;
drop function if exists public.push_public_key();
drop table if exists public.push_subscriptions;
drop function if exists public.push_srv_cron_ok(text);
drop function if exists public.push_srv_vapid(text,text);
drop function if exists public.push_srv_sent(uuid,text[]);
drop function if exists public.push_srv_mark(uuid,text[]);
drop table if exists push_private.sent;
drop table if exists push_private.vapid;
drop schema if exists push_private;
commit;
