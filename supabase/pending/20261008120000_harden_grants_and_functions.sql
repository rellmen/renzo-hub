-- ESTADO: PENDIENTE DE AUTORIZACIÓN (cambia permisos). Aplicar primero en staging, después en producción.
-- Objetivo (auditoría S-03, S-04, S-05): solo restrictivo; no borra ni modifica filas ni objetos.
-- Revisión 2026-10-09: generalizada a todas las tablas y vistas de public (las vistas payroll_v_monthly_nl y
-- payroll_v_jaaropgave_nl, creadas fuera del repo, heredaron todos los privilegios para anon) y corrige la causa:
-- los privilegios por defecto de Supabase conceden todo a anon en cada objeto nuevo.
-- Rollback exacto: supabase/pending/20261008120000_harden_grants_and_functions.rollback.sql

begin;

-- S-03: anon no necesita privilegios en ninguna tabla ni vista de public (la app exige sesión; RLS ya lo bloquea).
revoke all privileges on all tables in schema public from anon;

-- S-04: authenticated solo necesita CRUD. Quita TRUNCATE/REFERENCES/TRIGGER/MAINTAIN (TRUNCATE no respeta RLS;
-- MAINTAIN existe desde PostgreSQL 17 y la app no lo usa).
do $$
declare r record;
begin
  for r in select c.relname from pg_class c where c.relnamespace = 'public'::regnamespace and c.relkind in ('r','v') loop
    execute format('revoke truncate, references, trigger, maintain on table public.%I from authenticated', r.relname);
  end loop;
  -- Vistas (todas son de payroll, security_invoker): solo lectura para el propietario.
  for r in select c.relname from pg_class c where c.relnamespace = 'public'::regnamespace and c.relkind = 'v' loop
    execute format('revoke insert, update, delete on table public.%I from authenticated', r.relname);
  end loop;
end $$;

-- S-05: search_path fijo en funciones auxiliares (advisor 0011).
alter function public.payroll_num(jsonb, text) set search_path = public;
alter function public.payroll_period_key(text, integer, integer) set search_path = public;
alter function public.payroll_periods_per_year(text, integer) set search_path = public;
alter function public.payroll_touch_updated_at() set search_path = public;

-- S-05: las funciones de trigger no deben ser invocables por API (advisors 0028/0029).
revoke execute on function public.payroll_snapshot_payslip() from public, anon, authenticated;
revoke execute on function public.payroll_touch_updated_at() from public, anon, authenticated;
revoke execute on function public.set_hub_records_updated_at() from public, anon, authenticated;

-- Causa raíz: los objetos que cree el rol postgres en public dejan de concederse automáticamente a anon.
-- (authenticated y service_role mantienen sus privilegios por defecto.)
alter default privileges for role postgres in schema public revoke all on tables from anon;
alter default privileges for role postgres in schema public revoke all on sequences from anon;
alter default privileges for role postgres in schema public revoke execute on functions from anon;

commit;

-- Verificación esperada tras aplicar:
--   select relname, relacl from pg_class where relnamespace='public'::regnamespace and relkind in ('r','v');
--     -> sin entradas anon; authenticated con arwd (tablas) o r (vistas)
--   get_advisors(security): sin 0011 ni 0028/0029 para payroll_*
--   select defaclacl from pg_default_acl where defaclrole='postgres'::regrole and defaclnamespace='public'::regnamespace;
--     -> sin anon
