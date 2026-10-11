-- SOLO LECTURA. Huella del esquema COMPLETO de public + políticas y buckets de Storage (sin datos).
-- Ejecutar en staging y en producción (SQL Editor → Run → Export → Copy as markdown) y comparar: cada fila debe coincidir.
-- Si una sección no coincide, esa es la parte del esquema que difiere entre entornos.
with s as (
  select 'tablas_columnas' seccion, (select json_agg(x order by x) from (select table_name||'.'||column_name||':'||data_type||':'||is_nullable||':'||coalesce(column_default,'') x from information_schema.columns where table_schema='public') t) j
  union all select 'restricciones', (select json_agg(x order by x) from (select conrelid::regclass::text||':'||conname||':'||pg_get_constraintdef(oid) x from pg_constraint where connamespace='public'::regnamespace) t)
  union all select 'indices', (select json_agg(indexdef order by indexdef) from pg_indexes where schemaname='public')
  union all select 'politicas_public', (select json_agg(x order by x) from (select tablename||':'||policyname||':'||permissive||':'||array_to_string(roles,',')||':'||cmd||':'||coalesce(qual,'')||':'||coalesce(with_check,'') x from pg_policies where schemaname='public') t)
  union all select 'politicas_storage', (select json_agg(x order by x) from (select policyname||':'||cmd||':'||array_to_string(roles,',')||':'||coalesce(qual,'')||':'||coalesce(with_check,'') x from pg_policies where schemaname='storage') t)
  union all select 'funciones', (select json_agg(x order by x) from (select proname||'('||pg_get_function_identity_arguments(oid)||'):'||md5(prosrc)||':'||prosecdef||':'||coalesce(array_to_string(proconfig,','),'') x from pg_proc where pronamespace='public'::regnamespace) t)
  union all select 'vistas', (select json_agg(x order by x) from (select viewname||':'||md5(definition) x from pg_views where schemaname='public') t)
  union all select 'triggers', (select json_agg(x order by x) from (select pg_get_triggerdef(t.oid) x from pg_trigger t join pg_class c on c.oid=t.tgrelid where c.relnamespace='public'::regnamespace and not t.tgisinternal) t)
  union all select 'permisos_tablas', (select json_agg(x order by x) from (select c.relname||':'||a.grantee::regrole::text||':'||a.privilege_type x from pg_class c, aclexplode(c.relacl) a where c.relnamespace='public'::regnamespace and a.grantee in ('anon'::regrole,'authenticated'::regrole)) t)
  union all select 'permisos_funciones', (select json_agg(x order by x) from (select p.proname||':'||case when a.grantee=0 then 'public' else a.grantee::regrole::text end x from pg_proc p, aclexplode(coalesce(p.proacl, acldefault('f',p.proowner))) a where p.pronamespace='public'::regnamespace and (a.grantee=0 or a.grantee in ('anon'::regrole,'authenticated'::regrole))) t)
  union all select 'rls', (select json_agg(x order by x) from (select relname||':'||relrowsecurity||':'||relforcerowsecurity x from pg_class where relnamespace='public'::regnamespace and relkind in ('r','p')) t)
  union all select 'buckets', (select json_agg(x order by x) from (select id||':'||public||':'||coalesce(file_size_limit::text,'')||':'||coalesce(allowed_mime_types::text,'') x from storage.buckets) t)
)
select seccion, coalesce(json_array_length(j),0) elementos, md5(coalesce(j::text,'[]')) huella from s order by seccion;
