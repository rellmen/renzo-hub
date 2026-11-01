-- Retira el programador y el secreto de las notificaciones push (ejecutar antes del rollback de la migración).
select cron.unschedule(jobname) from cron.job where jobname in ('rise-push-new','rise-push-digest');
delete from vault.secrets where name='push_cron_secret';
