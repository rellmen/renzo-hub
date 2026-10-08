-- Rollback EXACTO de 20261008120000 en PRODUCCIÓN.
-- Generado a partir del estado real de producción leído el 2026-10-08 (pg_class.relacl y pg_proc.proacl, PostgreSQL 17).
-- Solo restaura privilegios; no toca datos. Usar solo si algo dejara de funcionar tras aplicar la migración.
begin;

-- anon tenía todos los privilegios (arwdDxtm) en estas 4 tablas.
grant all privileges on table public.profiles, public.skin_notes, public.skin_routine_logs, public.user_settings to anon;

-- authenticated tenía TRUNCATE/REFERENCES/TRIGGER/MAINTAIN (Dxtm) en estas tablas y vistas
-- (gym_plans, gym_sessions, hub_records y hub_user_state ya estaban solo con arwd: no se tocan).
grant truncate, references, trigger, maintain on table
  public.news_briefs, public.profiles, public.skin_notes, public.skin_routine_logs,
  public.system_preferences, public.system_records, public.user_settings,
  public.payroll_anomalies, public.payroll_corrections, public.payroll_deductions, public.payroll_documents,
  public.payroll_employers, public.payroll_events, public.payroll_hours, public.payroll_income_items,
  public.payroll_line_items, public.payroll_payslip_versions, public.payroll_payslips,
  public.payroll_v_confirmed, public.payroll_v_monthly, public.payroll_v_queue,
  public.payroll_v_rate_history, public.payroll_v_ytd, public.payroll_validations
to authenticated;

-- Escritura en vistas de payroll.
grant insert, update, delete on table
  public.payroll_v_confirmed, public.payroll_v_monthly, public.payroll_v_queue,
  public.payroll_v_rate_history, public.payroll_v_ytd,
  public.payroll_deductions, public.payroll_hours, public.payroll_income_items
to authenticated;

-- search_path de funciones auxiliares (antes sin fijar).
alter function public.payroll_num(jsonb, text) reset search_path;
alter function public.payroll_period_key(text, integer, integer) reset search_path;
alter function public.payroll_periods_per_year(text, integer) reset search_path;
alter function public.payroll_touch_updated_at() reset search_path;

-- EXECUTE de funciones de trigger (antes: PUBLIC, anon y authenticated).
grant execute on function public.payroll_snapshot_payslip() to public, anon, authenticated;
grant execute on function public.payroll_touch_updated_at() to public, anon, authenticated;
grant execute on function public.set_hub_records_updated_at() to public, anon, authenticated;

commit;
