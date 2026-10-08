-- ESTADO: PENDIENTE DE AUTORIZACIÓN (cambia permisos). Aplicar primero en staging, después en producción.
-- Objetivo (auditoría S-03, S-04, S-05): solo aditivo / restrictivo, no borra datos ni objetos.
-- Rollback: supabase/pending/20261008120000_harden_grants_and_functions.rollback.sql

begin;

-- S-03: el rol anon no necesita privilegios directos en tablas (RLS ya lo bloquea; esto es defensa en profundidad).
revoke all privileges on table public.profiles, public.skin_notes, public.skin_routine_logs, public.user_settings from anon;

-- S-04: authenticated solo necesita CRUD. Quita TRUNCATE/REFERENCES/TRIGGER (TRUNCATE no respeta RLS).
do $$
declare r record;
begin
  for r in select c.relname from pg_class c where c.relnamespace = 'public'::regnamespace and c.relkind in ('r','v') loop
    execute format('revoke truncate, references, trigger on table public.%I from authenticated', r.relname);
  end loop;
end $$;

-- Vistas de payroll: solo lectura para el propietario (security_invoker ya aplica RLS).
revoke insert, update, delete on table
  public.payroll_v_confirmed, public.payroll_v_monthly, public.payroll_v_queue,
  public.payroll_v_rate_history, public.payroll_v_ytd,
  public.payroll_deductions, public.payroll_hours, public.payroll_income_items
from authenticated;

-- S-05: search_path fijo en funciones auxiliares (advisor 0011).
alter function public.payroll_num(jsonb, text) set search_path = public;
alter function public.payroll_period_key(text, integer, integer) set search_path = public;
alter function public.payroll_periods_per_year(text, integer) set search_path = public;
alter function public.payroll_touch_updated_at() set search_path = public;

-- S-05: la función de trigger SECURITY DEFINER no debe ser invocable por API (advisors 0028/0029).
revoke execute on function public.payroll_snapshot_payslip() from public, anon, authenticated;
revoke execute on function public.payroll_touch_updated_at() from public, anon, authenticated;
revoke execute on function public.set_hub_records_updated_at() from public, anon, authenticated;

commit;

-- Verificación esperada tras aplicar:
--   select * from information_schema.role_table_grants where table_schema='public' and grantee='anon';  -> 0 filas
--   get_advisors(security): sin 0011 ni 0028/0029 para payroll_*
