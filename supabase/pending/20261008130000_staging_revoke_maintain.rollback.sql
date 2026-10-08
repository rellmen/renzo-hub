-- Rollback de 20261008130000 (solo staging): devuelve MAINTAIN a authenticated donde lo tenía el 2026-10-08.
begin;
grant maintain on table public.payroll_anomalies, public.payroll_corrections, public.payroll_documents, public.payroll_employers,
  public.payroll_events, public.payroll_line_items, public.payroll_payslip_versions, public.payroll_payslips, public.payroll_validations,
  public.payroll_deductions, public.payroll_hours, public.payroll_income_items, public.payroll_v_confirmed, public.payroll_v_monthly,
  public.payroll_v_queue, public.payroll_v_rate_history, public.payroll_v_ytd to authenticated;
commit;
