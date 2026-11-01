-- Puesta en marcha de notificaciones push en UN entorno (después de la migración y de desplegar la función push-notify).
-- Sustituir __FUNCTION_URL__ por https://<ref>.supabase.co/functions/v1/push-notify del mismo proyecto.
-- El secreto del programador lo genera la base de datos dentro de Vault: nadie lo ve ni se copia.
create extension if not exists pg_cron;
create extension if not exists pg_net;
select vault.create_secret(encode(extensions.gen_random_bytes(32),'hex'),'push_cron_secret','Rise push: secreto del programador')
 where not exists (select 1 from vault.secrets where name='push_cron_secret');
select cron.unschedule(jobname) from cron.job where jobname in ('rise-push-new','rise-push-digest');
-- Lo nuevo: cada 10 minutos.
select cron.schedule('rise-push-new','*/10 * * * *',$job$select net.http_post(url:='__FUNCTION_URL__',
 headers:=jsonb_build_object('content-type','application/json','x-push-cron',(select decrypted_secret from vault.decrypted_secrets where name='push_cron_secret')),
 body:='{"mode":"new"}'::jsonb,timeout_milliseconds:=30000)$job$);
-- Resumen diario de lo pendiente: 08:00 UTC (09:00 en invierno, 10:00 en verano en Ámsterdam).
select cron.schedule('rise-push-digest','0 8 * * *',$job$select net.http_post(url:='__FUNCTION_URL__',
 headers:=jsonb_build_object('content-type','application/json','x-push-cron',(select decrypted_secret from vault.decrypted_secrets where name='push_cron_secret')),
 body:='{"mode":"digest"}'::jsonb,timeout_milliseconds:=30000)$job$);
