-- SOLO STAGING. Iguala staging con la versión final de 20261008120000 (que ya incluye MAINTAIN).
-- En staging la primera versión ya se aplicó sin MAINTAIN; payroll_* conserva "m" para authenticated.
-- No toca datos. Rollback: grant maintain on table <mismas tablas> to authenticated.
do $$
declare r record;
begin
  for r in select c.relname from pg_class c where c.relnamespace = 'public'::regnamespace and c.relkind in ('r','v') loop
    execute format('revoke maintain on table public.%I from authenticated', r.relname);
  end loop;
end $$;
