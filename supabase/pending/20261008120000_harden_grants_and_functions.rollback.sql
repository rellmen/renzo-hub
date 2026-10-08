-- Restaura los privilegios previos a 20261008120000 (solo si algo dejara de funcionar).
begin;
grant all privileges on table public.profiles, public.skin_notes, public.skin_routine_logs, public.user_settings to anon;
do $$
declare r record;
begin
  for r in select c.relname from pg_class c where c.relnamespace = 'public'::regnamespace and c.relkind in ('r','v') and c.relname like 'payroll\_%' loop
    execute format('grant truncate, references, trigger on table public.%I to authenticated', r.relname);
  end loop;
end $$;
grant insert, update, delete on table public.payroll_v_confirmed, public.payroll_v_monthly, public.payroll_v_queue,
  public.payroll_v_rate_history, public.payroll_v_ytd, public.payroll_deductions, public.payroll_hours, public.payroll_income_items to authenticated;
alter function public.payroll_num(jsonb, text) reset search_path;
alter function public.payroll_period_key(text, integer, integer) reset search_path;
alter function public.payroll_periods_per_year(text, integer) reset search_path;
alter function public.payroll_touch_updated_at() reset search_path;
grant execute on function public.payroll_snapshot_payslip() to public, anon, authenticated;
grant execute on function public.payroll_touch_updated_at() to public, anon, authenticated;
grant execute on function public.set_hub_records_updated_at() to public, anon, authenticated;
commit;
