-- Stubs de payroll_* (solo nombres y firmas, sin columnas reales): bastan para probar privilegios.
-- El esquema real de payroll_* sigue pendiente de volcar (T2.1).
create table public.payroll_employers (id uuid primary key default gen_random_uuid(), user_id uuid, updated_at timestamptz);
create table public.payroll_documents (id uuid primary key default gen_random_uuid(), user_id uuid, updated_at timestamptz);
create table public.payroll_payslips (id uuid primary key default gen_random_uuid(), user_id uuid, updated_at timestamptz, net numeric);
create table public.payroll_payslip_versions (id uuid primary key default gen_random_uuid(), payslip_id uuid, snapshot jsonb);
create table public.payroll_line_items (id uuid primary key default gen_random_uuid(), user_id uuid);
create table public.payroll_anomalies (id uuid primary key default gen_random_uuid(), user_id uuid);
create table public.payroll_corrections (id uuid primary key default gen_random_uuid(), user_id uuid);
create table public.payroll_events (id uuid primary key default gen_random_uuid(), user_id uuid);
create table public.payroll_validations (id uuid primary key default gen_random_uuid(), user_id uuid);
create view public.payroll_deductions with (security_invoker) as select * from public.payroll_line_items;
create view public.payroll_hours with (security_invoker) as select * from public.payroll_line_items;
create view public.payroll_income_items with (security_invoker) as select * from public.payroll_line_items;
create view public.payroll_v_confirmed with (security_invoker) as select * from public.payroll_payslips;
create view public.payroll_v_monthly with (security_invoker) as select * from public.payroll_payslips;
create view public.payroll_v_queue with (security_invoker) as select * from public.payroll_documents;
create view public.payroll_v_rate_history with (security_invoker) as select * from public.payroll_payslips;
create view public.payroll_v_ytd with (security_invoker) as select * from public.payroll_payslips;
alter table public.payroll_payslips enable row level security;
create policy payroll_payslips_owner_select on public.payroll_payslips for select to authenticated using (user_id = auth.uid());
create policy payroll_payslips_owner_update on public.payroll_payslips for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
alter table public.payroll_payslip_versions enable row level security;
create function public.payroll_num(p jsonb, k text) returns numeric language sql as $$ select (p->>k)::numeric $$;
create function public.payroll_period_key(p_type text, p_year integer, p_num integer) returns text language sql as $$ select p_type||p_year||'-'||p_num $$;
create function public.payroll_periods_per_year(p_type text, p_year integer) returns integer language sql as $$ select 52 $$;
create function public.payroll_touch_updated_at() returns trigger language plpgsql as $$ begin new.updated_at := now(); return new; end $$;
create function public.payroll_snapshot_payslip() returns trigger language plpgsql security definer set search_path = public as $$
begin insert into public.payroll_payslip_versions(payslip_id, snapshot) values (old.id, to_jsonb(old)); return new; end $$;
create trigger payroll_payslips_touch before update on public.payroll_payslips for each row execute function public.payroll_touch_updated_at();
create trigger payroll_payslips_version_trg before update on public.payroll_payslips for each row execute function public.payroll_snapshot_payslip();
