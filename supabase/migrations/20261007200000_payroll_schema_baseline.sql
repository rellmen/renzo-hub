-- Nóminas (Payroll Agent): esquema completo de payroll_* tal y como está en staging y producción (2026-10-10).
-- Objetivo: esquema reproducible (criterio 4 de la Fase 1). Estas tablas se crearon fuera del repositorio
-- (/Users/Nodalys/Payroll Agent/sql/001..004 y migración 20261010030000); aquí queda su definición vigente.
-- YA ESTÁ APLICADO en staging y producción: este archivo es idempotente (if not exists / create or replace / guardas)
-- y sirve para levantar un entorno nuevo (por ejemplo, el VPS o una réplica). No borra ni modifica datos.
-- Fecha 20261007200000: va ANTES de 20261008120000 (que toca funciones payroll_*) para que la cadena completa funcione
-- en un entorno vacío. Las migraciones posteriores son idempotentes sobre este estado (la de fecha de cobro detecta que ya está).
-- Generado desde el catálogo de staging (solo lectura) y verificado con tools/db-replica/payroll_schema_test.sh.
begin;


-- 1. Tablas
create table if not exists public.payroll_anomalies (
  id uuid default gen_random_uuid() not null,
  user_id uuid default auth.uid() not null,
  payslip_id uuid,
  document_id uuid,
  anomaly_type text not null,
  severity text not null,
  status text default 'open'::text not null,
  title text not null,
  details jsonb default '{}'::jsonb not null,
  detected_at timestamp with time zone default now() not null,
  resolved_at timestamp with time zone
);

create table if not exists public.payroll_corrections (
  id uuid default gen_random_uuid() not null,
  user_id uuid default auth.uid() not null,
  payslip_id uuid not null,
  employer_id uuid,
  field_name text not null,
  extracted_value jsonb,
  corrected_value jsonb,
  error_type text default 'misread'::text not null,
  confidence_at_extraction numeric(4,3),
  prompt_version text,
  model_name text,
  note text,
  created_at timestamp with time zone default now() not null
);

create table if not exists public.payroll_documents (
  id uuid default gen_random_uuid() not null,
  user_id uuid default auth.uid() not null,
  file_sha256 character(64) not null,
  original_file_name text,
  source text default 'manual'::text not null,
  source_ref text,
  mime_type text,
  size_bytes bigint,
  doc_class text default 'unknown'::text not null,
  classification_confidence numeric(4,3),
  text_method text,
  status text default 'received'::text not null,
  duplicate_of uuid,
  attempt_count integer default 0 not null,
  last_error_code text,
  last_error_message text,
  storage_path_raw text,
  storage_path_archive text,
  archived_file_name text,
  processed_at timestamp with time zone,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

create table if not exists public.payroll_employers (
  id uuid default gen_random_uuid() not null,
  user_id uuid default auth.uid() not null,
  name text not null,
  normalized_code text not null,
  address text,
  loonheffingennummer text,
  kvk_number text,
  first_seen_period text,
  last_seen_period text,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

create table if not exists public.payroll_events (
  id bigint generated always as identity not null,
  user_id uuid not null,
  document_id uuid,
  payslip_id uuid,
  event_type text not null,
  detail jsonb default '{}'::jsonb not null,
  created_at timestamp with time zone default now() not null
);

create table if not exists public.payroll_line_items (
  id uuid default gen_random_uuid() not null,
  user_id uuid default auth.uid() not null,
  payslip_id uuid not null,
  category text not null,
  code text not null,
  label_original text not null,
  quantity numeric(12,4),
  rate numeric(12,4),
  amount numeric(12,2),
  period_ref text,
  sort_order integer default 0 not null,
  created_at timestamp with time zone default now() not null
);

create table if not exists public.payroll_payslip_versions (
  id bigint generated always as identity not null,
  user_id uuid not null,
  payslip_id uuid not null,
  version integer not null,
  snapshot jsonb not null,
  change_source text default 'system'::text not null,
  created_at timestamp with time zone default now() not null
);

create table if not exists public.payroll_payslips (
  id uuid default gen_random_uuid() not null,
  user_id uuid default auth.uid() not null,
  document_id uuid not null,
  employer_id uuid not null,
  employee_name text,
  employee_number text,
  payslip_number text,
  period_type text not null,
  period_year integer not null,
  period_number integer not null,
  period_label text not null,
  period_start date,
  period_end date,
  payment_date date,
  document_date date,
  currency character(3) default 'EUR'::bpchar not null,
  contract_type text,
  hourly_rate numeric(10,4),
  salary_rate numeric(12,2),
  contracted_hours numeric(8,2),
  worked_hours numeric(8,2),
  regular_hours numeric(8,2),
  overtime_hours numeric(8,2),
  holiday_hours numeric(8,2),
  sick_hours numeric(8,2),
  unpaid_hours numeric(8,2),
  paid_leave_hours numeric(8,2),
  gross_salary numeric(12,2),
  regular_pay numeric(12,2),
  overtime_pay numeric(12,2),
  holiday_pay numeric(12,2),
  vakantiegeld numeric(12,2),
  bonuses numeric(12,2),
  allowances numeric(12,2),
  shift_allowance numeric(12,2),
  travel_allowance numeric(12,2),
  expense_reimbursements numeric(12,2),
  other_income numeric(12,2),
  taxable_income numeric(12,2),
  loonheffing numeric(12,2),
  wage_tax numeric(12,2),
  social_contributions numeric(12,2),
  pension_contribution numeric(12,2),
  insurance_deductions numeric(12,2),
  employee_contributions numeric(12,2),
  corrections numeric(12,2),
  garnishments numeric(12,2),
  other_deductions numeric(12,2),
  total_deductions numeric(12,2),
  net_salary numeric(12,2),
  net_payment numeric(12,2),
  bank_payment numeric(12,2),
  total_employer_cost numeric(12,2),
  loon_voor_loonheffing numeric(12,2),
  sv_loon numeric(12,2),
  arbeidskorting numeric(12,2),
  loonheffingskorting_applied boolean,
  bijzonder_tarief_pct numeric(6,3),
  tabel_type text,
  vakantiegeld_basis numeric(12,2),
  vakantiegeld_reserved numeric(12,2),
  reserveringen jsonb default '[]'::jsonb not null,
  pensioenbasis numeric(12,2),
  jaarloon_bijzonder_tarief numeric(12,2),
  cumulative_gross numeric(12,2),
  cumulative_tax numeric(12,2),
  cumulative_net numeric(12,2),
  cumulative_hours numeric(10,2),
  cumulative_holiday_pay numeric(12,2),
  cumulative_taxable_income numeric(12,2),
  is_correction boolean default false not null,
  corrected_period_ref text,
  confidence_overall numeric(4,3),
  field_confidence jsonb default '{}'::jsonb not null,
  validation_status text default 'review_required'::text not null,
  review_status text default 'pending'::text not null,
  reviewed_at timestamp with time zone,
  extraction_version integer default 1 not null,
  model_name text,
  prompt_version text,
  text_method text,
  raw_extraction jsonb,
  summary text,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

create table if not exists public.payroll_validations (
  id uuid default gen_random_uuid() not null,
  user_id uuid default auth.uid() not null,
  payslip_id uuid not null,
  rule_code text not null,
  severity text not null,
  passed boolean not null,
  expected numeric(14,4),
  actual numeric(14,4),
  difference numeric(14,4),
  message text,
  created_at timestamp with time zone default now() not null
);

-- 2. Claves, unicidad, checks y claves foráneas
do $c$ begin if not exists (select 1 from pg_constraint where conname='payroll_anomalies_pkey' and conrelid='public.payroll_anomalies'::regclass) then alter table public.payroll_anomalies add constraint payroll_anomalies_pkey PRIMARY KEY (id); end if; end $c$;
do $c$ begin if not exists (select 1 from pg_constraint where conname='payroll_corrections_pkey' and conrelid='public.payroll_corrections'::regclass) then alter table public.payroll_corrections add constraint payroll_corrections_pkey PRIMARY KEY (id); end if; end $c$;
do $c$ begin if not exists (select 1 from pg_constraint where conname='payroll_documents_pkey' and conrelid='public.payroll_documents'::regclass) then alter table public.payroll_documents add constraint payroll_documents_pkey PRIMARY KEY (id); end if; end $c$;
do $c$ begin if not exists (select 1 from pg_constraint where conname='payroll_employers_pkey' and conrelid='public.payroll_employers'::regclass) then alter table public.payroll_employers add constraint payroll_employers_pkey PRIMARY KEY (id); end if; end $c$;
do $c$ begin if not exists (select 1 from pg_constraint where conname='payroll_events_pkey' and conrelid='public.payroll_events'::regclass) then alter table public.payroll_events add constraint payroll_events_pkey PRIMARY KEY (id); end if; end $c$;
do $c$ begin if not exists (select 1 from pg_constraint where conname='payroll_line_items_pkey' and conrelid='public.payroll_line_items'::regclass) then alter table public.payroll_line_items add constraint payroll_line_items_pkey PRIMARY KEY (id); end if; end $c$;
do $c$ begin if not exists (select 1 from pg_constraint where conname='payroll_payslip_versions_pkey' and conrelid='public.payroll_payslip_versions'::regclass) then alter table public.payroll_payslip_versions add constraint payroll_payslip_versions_pkey PRIMARY KEY (id); end if; end $c$;
do $c$ begin if not exists (select 1 from pg_constraint where conname='payroll_payslips_pkey' and conrelid='public.payroll_payslips'::regclass) then alter table public.payroll_payslips add constraint payroll_payslips_pkey PRIMARY KEY (id); end if; end $c$;
do $c$ begin if not exists (select 1 from pg_constraint where conname='payroll_validations_pkey' and conrelid='public.payroll_validations'::regclass) then alter table public.payroll_validations add constraint payroll_validations_pkey PRIMARY KEY (id); end if; end $c$;
do $c$ begin if not exists (select 1 from pg_constraint where conname='payroll_documents_user_id_file_sha256_key' and conrelid='public.payroll_documents'::regclass) then alter table public.payroll_documents add constraint payroll_documents_user_id_file_sha256_key UNIQUE (user_id, file_sha256); end if; end $c$;
do $c$ begin if not exists (select 1 from pg_constraint where conname='payroll_employers_user_id_normalized_code_key' and conrelid='public.payroll_employers'::regclass) then alter table public.payroll_employers add constraint payroll_employers_user_id_normalized_code_key UNIQUE (user_id, normalized_code); end if; end $c$;
do $c$ begin if not exists (select 1 from pg_constraint where conname='payroll_payslip_versions_payslip_id_version_key' and conrelid='public.payroll_payslip_versions'::regclass) then alter table public.payroll_payslip_versions add constraint payroll_payslip_versions_payslip_id_version_key UNIQUE (payslip_id, version); end if; end $c$;
do $c$ begin if not exists (select 1 from pg_constraint where conname='payroll_payslips_document_id_key' and conrelid='public.payroll_payslips'::regclass) then alter table public.payroll_payslips add constraint payroll_payslips_document_id_key UNIQUE (document_id); end if; end $c$;
do $c$ begin if not exists (select 1 from pg_constraint where conname='payroll_validations_payslip_id_rule_code_key' and conrelid='public.payroll_validations'::regclass) then alter table public.payroll_validations add constraint payroll_validations_payslip_id_rule_code_key UNIQUE (payslip_id, rule_code); end if; end $c$;
do $c$ begin if not exists (select 1 from pg_constraint where conname='payroll_anomalies_anomaly_type_check' and conrelid='public.payroll_anomalies'::regclass) then alter table public.payroll_anomalies add constraint payroll_anomalies_anomaly_type_check CHECK ((anomaly_type = ANY (ARRAY['missing_payslip'::text, 'duplicate_payslip'::text, 'net_change'::text, 'gross_change'::text, 'rate_change'::text, 'new_deduction'::text, 'missing_deduction'::text, 'hours_mismatch'::text, 'bank_vs_net'::text, 'tax_change'::text, 'employer_change'::text, 'retro_correction'::text, 'overtime_spike'::text, 'cumulative_regression'::text]))); end if; end $c$;
do $c$ begin if not exists (select 1 from pg_constraint where conname='payroll_anomalies_severity_check' and conrelid='public.payroll_anomalies'::regclass) then alter table public.payroll_anomalies add constraint payroll_anomalies_severity_check CHECK ((severity = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text]))); end if; end $c$;
do $c$ begin if not exists (select 1 from pg_constraint where conname='payroll_anomalies_status_check' and conrelid='public.payroll_anomalies'::regclass) then alter table public.payroll_anomalies add constraint payroll_anomalies_status_check CHECK ((status = ANY (ARRAY['open'::text, 'acknowledged'::text, 'resolved'::text, 'dismissed'::text]))); end if; end $c$;
do $c$ begin if not exists (select 1 from pg_constraint where conname='payroll_corrections_error_type_check' and conrelid='public.payroll_corrections'::regclass) then alter table public.payroll_corrections add constraint payroll_corrections_error_type_check CHECK ((error_type = ANY (ARRAY['misread'::text, 'missing'::text, 'wrong_field'::text, 'format'::text, 'hallucination'::text, 'sign'::text, 'other'::text]))); end if; end $c$;
do $c$ begin if not exists (select 1 from pg_constraint where conname='payroll_documents_classification_confidence_check' and conrelid='public.payroll_documents'::regclass) then alter table public.payroll_documents add constraint payroll_documents_classification_confidence_check CHECK (((classification_confidence >= (0)::numeric) AND (classification_confidence <= (1)::numeric))); end if; end $c$;
do $c$ begin if not exists (select 1 from pg_constraint where conname='payroll_documents_doc_class_check' and conrelid='public.payroll_documents'::regclass) then alter table public.payroll_documents add constraint payroll_documents_doc_class_check CHECK ((doc_class = ANY (ARRAY['payslip'::text, 'jaaropgave'::text, 'contract'::text, 'tax_document'::text, 'other'::text, 'unknown'::text]))); end if; end $c$;
do $c$ begin if not exists (select 1 from pg_constraint where conname='payroll_documents_file_sha256_check' and conrelid='public.payroll_documents'::regclass) then alter table public.payroll_documents add constraint payroll_documents_file_sha256_check CHECK ((file_sha256 ~ '^[a-f0-9]{64}$'::text)); end if; end $c$;
do $c$ begin if not exists (select 1 from pg_constraint where conname='payroll_documents_size_bytes_check' and conrelid='public.payroll_documents'::regclass) then alter table public.payroll_documents add constraint payroll_documents_size_bytes_check CHECK (((size_bytes IS NULL) OR (size_bytes >= 0))); end if; end $c$;
do $c$ begin if not exists (select 1 from pg_constraint where conname='payroll_documents_source_check' and conrelid='public.payroll_documents'::regclass) then alter table public.payroll_documents add constraint payroll_documents_source_check CHECK ((source = ANY (ARRAY['drive'::text, 'webhook'::text, 'ios_shortcut'::text, 'telegram'::text, 'manual'::text, 'retry'::text, 'email'::text]))); end if; end $c$;
do $c$ begin if not exists (select 1 from pg_constraint where conname='payroll_documents_status_check' and conrelid='public.payroll_documents'::regclass) then alter table public.payroll_documents add constraint payroll_documents_status_check CHECK ((status = ANY (ARRAY['received'::text, 'processing'::text, 'processed'::text, 'review_required'::text, 'failed'::text, 'duplicate'::text, 'ignored'::text]))); end if; end $c$;
do $c$ begin if not exists (select 1 from pg_constraint where conname='payroll_documents_text_method_check' and conrelid='public.payroll_documents'::regclass) then alter table public.payroll_documents add constraint payroll_documents_text_method_check CHECK ((text_method = ANY (ARRAY['text_layer'::text, 'ocr_ai'::text, 'none'::text]))); end if; end $c$;
do $c$ begin if not exists (select 1 from pg_constraint where conname='payroll_employers_normalized_code_check' and conrelid='public.payroll_employers'::regclass) then alter table public.payroll_employers add constraint payroll_employers_normalized_code_check CHECK ((normalized_code ~ '^[A-Z0-9]{1,20}$'::text)); end if; end $c$;
do $c$ begin if not exists (select 1 from pg_constraint where conname='payroll_line_items_category_check' and conrelid='public.payroll_line_items'::regclass) then alter table public.payroll_line_items add constraint payroll_line_items_category_check CHECK ((category = ANY (ARRAY['income'::text, 'deduction'::text, 'hours'::text, 'employer_cost'::text, 'reservation'::text, 'info'::text]))); end if; end $c$;
do $c$ begin if not exists (select 1 from pg_constraint where conname='payroll_payslips_confidence_overall_check' and conrelid='public.payroll_payslips'::regclass) then alter table public.payroll_payslips add constraint payroll_payslips_confidence_overall_check CHECK (((confidence_overall >= (0)::numeric) AND (confidence_overall <= (1)::numeric))); end if; end $c$;
do $c$ begin if not exists (select 1 from pg_constraint where conname='payroll_payslips_period_number_check' and conrelid='public.payroll_payslips'::regclass) then alter table public.payroll_payslips add constraint payroll_payslips_period_number_check CHECK (((period_number >= 1) AND (period_number <= 53))); end if; end $c$;
do $c$ begin if not exists (select 1 from pg_constraint where conname='payroll_payslips_period_type_check' and conrelid='public.payroll_payslips'::regclass) then alter table public.payroll_payslips add constraint payroll_payslips_period_type_check CHECK ((period_type = ANY (ARRAY['weekly'::text, 'four_weekly'::text, 'monthly'::text, 'semi_monthly'::text, 'other'::text]))); end if; end $c$;
do $c$ begin if not exists (select 1 from pg_constraint where conname='payroll_payslips_period_year_check' and conrelid='public.payroll_payslips'::regclass) then alter table public.payroll_payslips add constraint payroll_payslips_period_year_check CHECK (((period_year >= 2000) AND (period_year <= 2100))); end if; end $c$;
do $c$ begin if not exists (select 1 from pg_constraint where conname='payroll_payslips_review_status_check' and conrelid='public.payroll_payslips'::regclass) then alter table public.payroll_payslips add constraint payroll_payslips_review_status_check CHECK ((review_status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text, 'not_required'::text]))); end if; end $c$;
do $c$ begin if not exists (select 1 from pg_constraint where conname='payroll_payslips_validation_status_check' and conrelid='public.payroll_payslips'::regclass) then alter table public.payroll_payslips add constraint payroll_payslips_validation_status_check CHECK ((validation_status = ANY (ARRAY['verified'::text, 'warning'::text, 'review_required'::text, 'failed'::text]))); end if; end $c$;
do $c$ begin if not exists (select 1 from pg_constraint where conname='payroll_validations_severity_check' and conrelid='public.payroll_validations'::regclass) then alter table public.payroll_validations add constraint payroll_validations_severity_check CHECK ((severity = ANY (ARRAY['info'::text, 'warning'::text, 'error'::text, 'critical'::text]))); end if; end $c$;
do $c$ begin if not exists (select 1 from pg_constraint where conname='payroll_anomalies_document_id_fkey' and conrelid='public.payroll_anomalies'::regclass) then alter table public.payroll_anomalies add constraint payroll_anomalies_document_id_fkey FOREIGN KEY (document_id) REFERENCES payroll_documents(id) ON DELETE CASCADE; end if; end $c$;
do $c$ begin if not exists (select 1 from pg_constraint where conname='payroll_anomalies_payslip_id_fkey' and conrelid='public.payroll_anomalies'::regclass) then alter table public.payroll_anomalies add constraint payroll_anomalies_payslip_id_fkey FOREIGN KEY (payslip_id) REFERENCES payroll_payslips(id) ON DELETE CASCADE; end if; end $c$;
do $c$ begin if not exists (select 1 from pg_constraint where conname='payroll_anomalies_user_id_fkey' and conrelid='public.payroll_anomalies'::regclass) then alter table public.payroll_anomalies add constraint payroll_anomalies_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE; end if; end $c$;
do $c$ begin if not exists (select 1 from pg_constraint where conname='payroll_corrections_employer_id_fkey' and conrelid='public.payroll_corrections'::regclass) then alter table public.payroll_corrections add constraint payroll_corrections_employer_id_fkey FOREIGN KEY (employer_id) REFERENCES payroll_employers(id); end if; end $c$;
do $c$ begin if not exists (select 1 from pg_constraint where conname='payroll_corrections_payslip_id_fkey' and conrelid='public.payroll_corrections'::regclass) then alter table public.payroll_corrections add constraint payroll_corrections_payslip_id_fkey FOREIGN KEY (payslip_id) REFERENCES payroll_payslips(id) ON DELETE CASCADE; end if; end $c$;
do $c$ begin if not exists (select 1 from pg_constraint where conname='payroll_corrections_user_id_fkey' and conrelid='public.payroll_corrections'::regclass) then alter table public.payroll_corrections add constraint payroll_corrections_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE; end if; end $c$;
do $c$ begin if not exists (select 1 from pg_constraint where conname='payroll_documents_duplicate_of_fkey' and conrelid='public.payroll_documents'::regclass) then alter table public.payroll_documents add constraint payroll_documents_duplicate_of_fkey FOREIGN KEY (duplicate_of) REFERENCES payroll_documents(id) ON DELETE SET NULL; end if; end $c$;
do $c$ begin if not exists (select 1 from pg_constraint where conname='payroll_documents_user_id_fkey' and conrelid='public.payroll_documents'::regclass) then alter table public.payroll_documents add constraint payroll_documents_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE; end if; end $c$;
do $c$ begin if not exists (select 1 from pg_constraint where conname='payroll_employers_user_id_fkey' and conrelid='public.payroll_employers'::regclass) then alter table public.payroll_employers add constraint payroll_employers_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE; end if; end $c$;
do $c$ begin if not exists (select 1 from pg_constraint where conname='payroll_events_document_id_fkey' and conrelid='public.payroll_events'::regclass) then alter table public.payroll_events add constraint payroll_events_document_id_fkey FOREIGN KEY (document_id) REFERENCES payroll_documents(id) ON DELETE CASCADE; end if; end $c$;
do $c$ begin if not exists (select 1 from pg_constraint where conname='payroll_events_payslip_id_fkey' and conrelid='public.payroll_events'::regclass) then alter table public.payroll_events add constraint payroll_events_payslip_id_fkey FOREIGN KEY (payslip_id) REFERENCES payroll_payslips(id) ON DELETE SET NULL; end if; end $c$;
do $c$ begin if not exists (select 1 from pg_constraint where conname='payroll_line_items_payslip_id_fkey' and conrelid='public.payroll_line_items'::regclass) then alter table public.payroll_line_items add constraint payroll_line_items_payslip_id_fkey FOREIGN KEY (payslip_id) REFERENCES payroll_payslips(id) ON DELETE CASCADE; end if; end $c$;
do $c$ begin if not exists (select 1 from pg_constraint where conname='payroll_line_items_user_id_fkey' and conrelid='public.payroll_line_items'::regclass) then alter table public.payroll_line_items add constraint payroll_line_items_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE; end if; end $c$;
do $c$ begin if not exists (select 1 from pg_constraint where conname='payroll_payslip_versions_payslip_id_fkey' and conrelid='public.payroll_payslip_versions'::regclass) then alter table public.payroll_payslip_versions add constraint payroll_payslip_versions_payslip_id_fkey FOREIGN KEY (payslip_id) REFERENCES payroll_payslips(id) ON DELETE CASCADE; end if; end $c$;
do $c$ begin if not exists (select 1 from pg_constraint where conname='payroll_payslips_document_id_fkey' and conrelid='public.payroll_payslips'::regclass) then alter table public.payroll_payslips add constraint payroll_payslips_document_id_fkey FOREIGN KEY (document_id) REFERENCES payroll_documents(id) ON DELETE CASCADE; end if; end $c$;
do $c$ begin if not exists (select 1 from pg_constraint where conname='payroll_payslips_employer_id_fkey' and conrelid='public.payroll_payslips'::regclass) then alter table public.payroll_payslips add constraint payroll_payslips_employer_id_fkey FOREIGN KEY (employer_id) REFERENCES payroll_employers(id); end if; end $c$;
do $c$ begin if not exists (select 1 from pg_constraint where conname='payroll_payslips_user_id_fkey' and conrelid='public.payroll_payslips'::regclass) then alter table public.payroll_payslips add constraint payroll_payslips_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE; end if; end $c$;
do $c$ begin if not exists (select 1 from pg_constraint where conname='payroll_validations_payslip_id_fkey' and conrelid='public.payroll_validations'::regclass) then alter table public.payroll_validations add constraint payroll_validations_payslip_id_fkey FOREIGN KEY (payslip_id) REFERENCES payroll_payslips(id) ON DELETE CASCADE; end if; end $c$;
do $c$ begin if not exists (select 1 from pg_constraint where conname='payroll_validations_user_id_fkey' and conrelid='public.payroll_validations'::regclass) then alter table public.payroll_validations add constraint payroll_validations_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE; end if; end $c$;

-- 3. Índices
CREATE INDEX IF NOT EXISTS payroll_anomalies_open_idx ON public.payroll_anomalies USING btree (user_id, status) WHERE (status = 'open'::text);
CREATE UNIQUE INDEX IF NOT EXISTS payroll_anomalies_uq ON public.payroll_anomalies USING btree (user_id, COALESCE(payslip_id, document_id), anomaly_type, COALESCE((details ->> 'key'::text), ''::text));
CREATE INDEX IF NOT EXISTS payroll_corrections_employer_idx ON public.payroll_corrections USING btree (user_id, employer_id, field_name);
CREATE INDEX IF NOT EXISTS payroll_documents_user_created_idx ON public.payroll_documents USING btree (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS payroll_documents_user_status_idx ON public.payroll_documents USING btree (user_id, status);
CREATE INDEX IF NOT EXISTS payroll_events_doc_idx ON public.payroll_events USING btree (document_id, created_at);
CREATE INDEX IF NOT EXISTS payroll_line_items_payslip_idx ON public.payroll_line_items USING btree (payslip_id, category);
CREATE INDEX IF NOT EXISTS payroll_line_items_user_code_idx ON public.payroll_line_items USING btree (user_id, category, code);
CREATE UNIQUE INDEX IF NOT EXISTS payroll_payslips_logical_uq ON public.payroll_payslips USING btree (user_id, employer_id, period_type, period_year, period_number, COALESCE(payslip_number, ''::text), is_correction);
CREATE INDEX IF NOT EXISTS payroll_payslips_review_idx ON public.payroll_payslips USING btree (user_id, review_status) WHERE (review_status = 'pending'::text);
CREATE INDEX IF NOT EXISTS payroll_payslips_user_payment_idx ON public.payroll_payslips USING btree (user_id, payment_date);
CREATE INDEX IF NOT EXISTS payroll_payslips_user_period_idx ON public.payroll_payslips USING btree (user_id, period_year, period_number);

-- 4. Funciones
CREATE OR REPLACE FUNCTION public.payroll_apply_review(p_payslip_id uuid, p_changes jsonb DEFAULT '{}'::jsonb, p_decision text DEFAULT 'approved'::text, p_error_types jsonb DEFAULT '{}'::jsonb, p_note text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
declare
ps public.payroll_payslips;
k text; v jsonb; old_v jsonb;
allowed text[] := array[
'employee_number','payslip_number','payment_date','contract_type','hourly_rate','salary_rate','contracted_hours',
'worked_hours','regular_hours','overtime_hours','holiday_hours','sick_hours','unpaid_hours','paid_leave_hours',
'gross_salary','regular_pay','overtime_pay','holiday_pay','vakantiegeld','bonuses','allowances','shift_allowance',
'travel_allowance','expense_reimbursements','other_income','taxable_income','loonheffing','wage_tax',
'social_contributions','pension_contribution','insurance_deductions','employee_contributions','corrections',
'garnishments','other_deductions','total_deductions','net_salary','net_payment','bank_payment','total_employer_cost',
'loon_voor_loonheffing','sv_loon','arbeidskorting','vakantiegeld_reserved','cumulative_gross','cumulative_tax',
'cumulative_net','cumulative_hours','cumulative_holiday_pay','cumulative_taxable_income'];
begin
if p_decision not in ('approved','rejected') then raise exception 'decision must be approved or rejected'; end if;
select * into ps from payroll_payslips where id = p_payslip_id and user_id = auth.uid() for update;
if ps.id is null then raise exception 'payslip not found'; end if;
perform set_config('payroll.change_source', 'review', true);
for k, v in select * from jsonb_each(coalesce(p_changes,'{}'::jsonb)) loop
if not (k = any(allowed)) then raise exception 'field % not editable', k; end if;
old_v := to_jsonb(ps) -> k;
if old_v is distinct from v then
insert into payroll_corrections (user_id, payslip_id, employer_id, field_name, extracted_value, corrected_value,
error_type, confidence_at_extraction, prompt_version, model_name, note)
values (auth.uid(), ps.id, ps.employer_id, k, old_v, v, coalesce(p_error_types->>k, 'misread'),
(ps.field_confidence->>k)::numeric, ps.prompt_version, ps.model_name, p_note);
end if;
end loop;
update payroll_payslips t
set (employee_number, payslip_number, payment_date, contract_type, hourly_rate, salary_rate, contracted_hours,
worked_hours, regular_hours, overtime_hours, holiday_hours, sick_hours, unpaid_hours, paid_leave_hours,
gross_salary, regular_pay, overtime_pay, holiday_pay, vakantiegeld, bonuses, allowances, shift_allowance,
travel_allowance, expense_reimbursements, other_income, taxable_income, loonheffing, wage_tax,
social_contributions, pension_contribution, insurance_deductions, employee_contributions, corrections,
garnishments, other_deductions, total_deductions, net_salary, net_payment, bank_payment, total_employer_cost,
loon_voor_loonheffing, sv_loon, arbeidskorting, vakantiegeld_reserved, cumulative_gross, cumulative_tax,
cumulative_net, cumulative_hours, cumulative_holiday_pay, cumulative_taxable_income)
= (select r.employee_number, r.payslip_number, r.payment_date, r.contract_type, r.hourly_rate, r.salary_rate,
r.contracted_hours, r.worked_hours, r.regular_hours, r.overtime_hours, r.holiday_hours, r.sick_hours,
r.unpaid_hours, r.paid_leave_hours, r.gross_salary, r.regular_pay, r.overtime_pay, r.holiday_pay,
r.vakantiegeld, r.bonuses, r.allowances, r.shift_allowance, r.travel_allowance, r.expense_reimbursements,
r.other_income, r.taxable_income, r.loonheffing, r.wage_tax, r.social_contributions,
r.pension_contribution, r.insurance_deductions, r.employee_contributions, r.corrections, r.garnishments,
r.other_deductions, r.total_deductions, r.net_salary, r.net_payment, r.bank_payment,
r.total_employer_cost, r.loon_voor_loonheffing, r.sv_loon, r.arbeidskorting, r.vakantiegeld_reserved,
r.cumulative_gross, r.cumulative_tax, r.cumulative_net, r.cumulative_hours, r.cumulative_holiday_pay,
r.cumulative_taxable_income
from jsonb_populate_record(t, p_changes) r),
review_status = p_decision,
validation_status = case when p_decision = 'approved' then 'verified' else 'failed' end,
reviewed_at = now()
where t.id = ps.id
returning * into ps;
update payroll_documents set status = case when p_decision = 'approved' then 'processed' else 'failed' end
where id = ps.document_id;
update payroll_anomalies set status = 'acknowledged'
where payslip_id = ps.id and status = 'open' and p_decision = 'approved';
return jsonb_build_object('ok', true, 'payslip_id', ps.id, 'review_status', ps.review_status,
'version', ps.extraction_version);
end $function$
;

CREATE OR REPLACE FUNCTION public.payroll_ingest(p_document_id uuid, p_payload jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
d public.payroll_documents;
e_id uuid;
ps public.payroll_payslips;
prev public.payroll_payslips;
dup public.payroll_payslips;
p jsonb := p_payload->'payslip';
v_status text := coalesce(p_payload->>'validation_status', 'review_required');
v_review text;
v_threshold numeric := coalesce((p_payload->>'confidence_threshold')::numeric, 0.85);
v_label text;
v_seq int;
v_file text;
v_folder text;
v_year int;
v_anoms int := 0;
v_hist_net numeric;
v_hist_ot numeric;
v_prev_rate numeric;
v_cur_rate numeric;
v_gap int;
r record;
rank_of jsonb := '{"verified":0,"warning":1,"review_required":2,"failed":3}'::jsonb;
begin
select * into d from payroll_documents where id = p_document_id for update;
if d.id is null then raise exception 'payroll_ingest: document % not found', p_document_id; end if;
perform set_config('payroll.change_source', 'extraction', true);
insert into payroll_employers (user_id, name, normalized_code, address, loonheffingennummer, kvk_number,
first_seen_period, last_seen_period)
values (d.user_id, p_payload->'employer'->>'name', p_payload->'employer'->>'code',
p_payload->'employer'->>'address', p_payload->'employer'->>'loonheffingennummer',
p_payload->'employer'->>'kvk_number', p->>'period_label', p->>'period_label')
on conflict (user_id, normalized_code) do update
set address = coalesce(excluded.address, payroll_employers.address),
loonheffingennummer = coalesce(excluded.loonheffingennummer, payroll_employers.loonheffingennummer),
last_seen_period = greatest(payroll_employers.last_seen_period, excluded.last_seen_period)
returning id into e_id;
select * into dup from payroll_payslips x
where x.user_id = d.user_id and x.employer_id = e_id and x.document_id <> d.id
and x.period_type = p->>'period_type' and x.period_year = (p->>'period_year')::int
and x.period_number = (p->>'period_number')::int
and coalesce(x.payslip_number,'') = coalesce(p->>'payslip_number','')
and x.is_correction = coalesce((p->>'is_correction')::boolean, false)
limit 1;
if dup.id is not null then
update payroll_documents set status = 'duplicate', duplicate_of = dup.document_id, doc_class = 'payslip',
processed_at = now() where id = d.id;
insert into payroll_anomalies (user_id, document_id, anomaly_type, severity, title, details)
values (d.user_id, d.id, 'duplicate_payslip', 'medium',
'Nómina duplicada: ' || (p->>'period_label') || ' ya existe con otro fichero',
jsonb_build_object('key', dup.id::text, 'existing_payslip_id', dup.id))
on conflict do nothing;
insert into payroll_events (user_id, document_id, payslip_id, event_type, detail)
values (d.user_id, d.id, dup.id, 'duplicate_logical', '{}'::jsonb);
return jsonb_build_object('ok', true, 'duplicate', true, 'existing_payslip_id', dup.id,
'validation_status', 'warning', 'review_status', dup.review_status);
end if;
insert into payroll_payslips as t (
user_id, document_id, employer_id, employee_name, employee_number, payslip_number,
period_type, period_year, period_number, period_label, period_start, period_end, payment_date, document_date, currency,
contract_type, hourly_rate, salary_rate, contracted_hours, worked_hours, regular_hours, overtime_hours, holiday_hours,
sick_hours, unpaid_hours, paid_leave_hours,
gross_salary, regular_pay, overtime_pay, holiday_pay, vakantiegeld, bonuses, allowances, shift_allowance,
travel_allowance, expense_reimbursements, other_income, taxable_income,
loonheffing, wage_tax, social_contributions, pension_contribution, insurance_deductions, employee_contributions,
corrections, garnishments, other_deductions, total_deductions,
net_salary, net_payment, bank_payment, total_employer_cost,
loon_voor_loonheffing, sv_loon, arbeidskorting, loonheffingskorting_applied, bijzonder_tarief_pct, tabel_type,
vakantiegeld_basis, vakantiegeld_reserved, reserveringen, pensioenbasis, jaarloon_bijzonder_tarief,
cumulative_gross, cumulative_tax, cumulative_net, cumulative_hours, cumulative_holiday_pay, cumulative_taxable_income,
is_correction, corrected_period_ref,
confidence_overall, field_confidence, validation_status, review_status,
model_name, prompt_version, text_method, raw_extraction, summary)
values (
d.user_id, d.id, e_id, p->>'employee_name', p->>'employee_number', p->>'payslip_number',
p->>'period_type', (p->>'period_year')::int, (p->>'period_number')::int, p->>'period_label',
(p->>'period_start')::date, (p->>'period_end')::date, (p->>'payment_date')::date, (p->>'document_date')::date,
coalesce(p->>'currency','EUR'),
p->>'contract_type', payroll_num(p,'hourly_rate'), payroll_num(p,'salary_rate'), payroll_num(p,'contracted_hours'),
payroll_num(p,'worked_hours'), payroll_num(p,'regular_hours'), payroll_num(p,'overtime_hours'), payroll_num(p,'holiday_hours'),
payroll_num(p,'sick_hours'), payroll_num(p,'unpaid_hours'), payroll_num(p,'paid_leave_hours'),
payroll_num(p,'gross_salary'), payroll_num(p,'regular_pay'), payroll_num(p,'overtime_pay'), payroll_num(p,'holiday_pay'),
payroll_num(p,'vakantiegeld'), payroll_num(p,'bonuses'), payroll_num(p,'allowances'), payroll_num(p,'shift_allowance'),
payroll_num(p,'travel_allowance'), payroll_num(p,'expense_reimbursements'), payroll_num(p,'other_income'), payroll_num(p,'taxable_income'),
payroll_num(p,'loonheffing'), payroll_num(p,'wage_tax'), payroll_num(p,'social_contributions'), payroll_num(p,'pension_contribution'),
payroll_num(p,'insurance_deductions'), payroll_num(p,'employee_contributions'), payroll_num(p,'corrections'),
payroll_num(p,'garnishments'), payroll_num(p,'other_deductions'), payroll_num(p,'total_deductions'),
payroll_num(p,'net_salary'), payroll_num(p,'net_payment'), payroll_num(p,'bank_payment'), payroll_num(p,'total_employer_cost'),
payroll_num(p,'loon_voor_loonheffing'), payroll_num(p,'sv_loon'), payroll_num(p,'arbeidskorting'),
(p->>'loonheffingskorting_applied')::boolean, payroll_num(p,'bijzonder_tarief_pct'), p->>'tabel_type',
payroll_num(p,'vakantiegeld_basis'), payroll_num(p,'vakantiegeld_reserved'), coalesce(p->'reserveringen','[]'::jsonb),
payroll_num(p,'pensioenbasis'), payroll_num(p,'jaarloon_bijzonder_tarief'),
payroll_num(p,'cumulative_gross'), payroll_num(p,'cumulative_tax'), payroll_num(p,'cumulative_net'),
payroll_num(p,'cumulative_hours'), payroll_num(p,'cumulative_holiday_pay'), payroll_num(p,'cumulative_taxable_income'),
coalesce((p->>'is_correction')::boolean, false), p->>'corrected_period_ref',
(p_payload->>'confidence_overall')::numeric, coalesce(p_payload->'field_confidence','{}'::jsonb), v_status, 'pending',
p_payload->>'model_name', p_payload->>'prompt_version', p_payload->>'text_method', p_payload->'raw_extraction',
p_payload->>'summary')
on conflict (document_id) do update set
employer_id = excluded.employer_id, employee_name = excluded.employee_name, employee_number = excluded.employee_number,
payslip_number = excluded.payslip_number, period_type = excluded.period_type, period_year = excluded.period_year,
period_number = excluded.period_number, period_label = excluded.period_label, period_start = excluded.period_start,
period_end = excluded.period_end, payment_date = excluded.payment_date, document_date = excluded.document_date,
currency = excluded.currency, contract_type = excluded.contract_type, hourly_rate = excluded.hourly_rate,
salary_rate = excluded.salary_rate, contracted_hours = excluded.contracted_hours, worked_hours = excluded.worked_hours,
regular_hours = excluded.regular_hours, overtime_hours = excluded.overtime_hours, holiday_hours = excluded.holiday_hours,
sick_hours = excluded.sick_hours, unpaid_hours = excluded.unpaid_hours, paid_leave_hours = excluded.paid_leave_hours,
gross_salary = excluded.gross_salary, regular_pay = excluded.regular_pay, overtime_pay = excluded.overtime_pay,
holiday_pay = excluded.holiday_pay, vakantiegeld = excluded.vakantiegeld, bonuses = excluded.bonuses,
allowances = excluded.allowances, shift_allowance = excluded.shift_allowance, travel_allowance = excluded.travel_allowance,
expense_reimbursements = excluded.expense_reimbursements, other_income = excluded.other_income,
taxable_income = excluded.taxable_income, loonheffing = excluded.loonheffing, wage_tax = excluded.wage_tax,
social_contributions = excluded.social_contributions, pension_contribution = excluded.pension_contribution,
insurance_deductions = excluded.insurance_deductions, employee_contributions = excluded.employee_contributions,
corrections = excluded.corrections, garnishments = excluded.garnishments, other_deductions = excluded.other_deductions,
total_deductions = excluded.total_deductions, net_salary = excluded.net_salary, net_payment = excluded.net_payment,
bank_payment = excluded.bank_payment, total_employer_cost = excluded.total_employer_cost,
loon_voor_loonheffing = excluded.loon_voor_loonheffing, sv_loon = excluded.sv_loon,
arbeidskorting = excluded.arbeidskorting, loonheffingskorting_applied = excluded.loonheffingskorting_applied,
bijzonder_tarief_pct = excluded.bijzonder_tarief_pct, tabel_type = excluded.tabel_type,
vakantiegeld_basis = excluded.vakantiegeld_basis, vakantiegeld_reserved = excluded.vakantiegeld_reserved,
reserveringen = excluded.reserveringen, pensioenbasis = excluded.pensioenbasis,
jaarloon_bijzonder_tarief = excluded.jaarloon_bijzonder_tarief, cumulative_gross = excluded.cumulative_gross,
cumulative_tax = excluded.cumulative_tax, cumulative_net = excluded.cumulative_net,
cumulative_hours = excluded.cumulative_hours, cumulative_holiday_pay = excluded.cumulative_holiday_pay,
cumulative_taxable_income = excluded.cumulative_taxable_income, is_correction = excluded.is_correction,
corrected_period_ref = excluded.corrected_period_ref, confidence_overall = excluded.confidence_overall,
field_confidence = excluded.field_confidence, validation_status = excluded.validation_status,
review_status = case when t.review_status = 'approved' then t.review_status else 'pending' end,
model_name = excluded.model_name, prompt_version = excluded.prompt_version, text_method = excluded.text_method,
raw_extraction = excluded.raw_extraction, summary = excluded.summary
returning * into ps;
delete from payroll_line_items where payslip_id = ps.id;
insert into payroll_line_items (user_id, payslip_id, category, code, label_original, quantity, rate, amount, period_ref, sort_order)
select d.user_id, ps.id, li->>'category', coalesce(nullif(li->>'code',''), 'other'),
coalesce(li->>'label_original', ''), payroll_num(li,'quantity'), payroll_num(li,'rate'), payroll_num(li,'amount'),
li->>'period_ref', (ord - 1)::int
from jsonb_array_elements(coalesce(p_payload->'line_items','[]'::jsonb)) with ordinality as x(li, ord)
where li->>'category' in ('income','deduction','hours','employer_cost','reservation','info');
delete from payroll_validations where payslip_id = ps.id;
insert into payroll_validations (user_id, payslip_id, rule_code, severity, passed, expected, actual, difference, message)
select d.user_id, ps.id, c->>'rule', c->>'severity', (c->>'passed')::boolean,
payroll_num(c,'expected'), payroll_num(c,'actual'), payroll_num(c,'difference'), c->>'message'
from jsonb_array_elements(coalesce(p_payload->'checks','[]'::jsonb)) c
on conflict (payslip_id, rule_code) do nothing;
delete from payroll_anomalies where payslip_id = ps.id and status = 'open';
select * into prev from payroll_payslips x
where x.user_id = d.user_id and x.id <> ps.id and x.is_correction = false
and x.period_type = ps.period_type
and payroll_period_key(x.period_type, x.period_year, x.period_number)
< payroll_period_key(ps.period_type, ps.period_year, ps.period_number)
order by x.period_year desc, x.period_number desc limit 1;
if prev.id is not null then
v_gap := case when prev.period_year = ps.period_year then ps.period_number - prev.period_number
else ps.period_number + coalesce(payroll_periods_per_year(prev.period_type, prev.period_year),0) - prev.period_number end;
if v_gap > 1 then
insert into payroll_anomalies (user_id, payslip_id, anomaly_type, severity, title, details)
values (d.user_id, ps.id, 'missing_payslip', 'medium',
'Faltan ' || (v_gap - 1) || ' nómina(s) entre ' || prev.period_label || ' y ' || ps.period_label,
jsonb_build_object('key', prev.period_label, 'missing_count', v_gap - 1))
on conflict do nothing;
end if;
if prev.employer_id <> ps.employer_id then
insert into payroll_anomalies (user_id, payslip_id, anomaly_type, severity, title, details)
values (d.user_id, ps.id, 'employer_change', 'medium', 'Cambio de empresa pagadora respecto a ' || prev.period_label,
jsonb_build_object('previous_employer_id', prev.employer_id))
on conflict do nothing;
end if;
if prev.hourly_rate is not null and ps.hourly_rate is not null and prev.hourly_rate <> ps.hourly_rate then
insert into payroll_anomalies (user_id, payslip_id, anomaly_type, severity, title, details)
values (d.user_id, ps.id, 'rate_change',
case when ps.hourly_rate < prev.hourly_rate then 'high' else 'low' end,
'Tarifa por hora: ' || prev.hourly_rate || ' → ' || ps.hourly_rate,
jsonb_build_object('previous', prev.hourly_rate, 'current', ps.hourly_rate))
on conflict do nothing;
end if;
v_prev_rate := case when coalesce(prev.loon_voor_loonheffing, prev.taxable_income, prev.gross_salary, 0) > 0
then prev.loonheffing / coalesce(prev.loon_voor_loonheffing, prev.taxable_income, prev.gross_salary) end;
v_cur_rate := case when coalesce(ps.loon_voor_loonheffing, ps.taxable_income, ps.gross_salary, 0) > 0
then ps.loonheffing / coalesce(ps.loon_voor_loonheffing, ps.taxable_income, ps.gross_salary) end;
if v_prev_rate is not null and v_cur_rate is not null and abs(v_cur_rate - v_prev_rate) > 0.05 then
insert into payroll_anomalies (user_id, payslip_id, anomaly_type, severity, title, details)
values (d.user_id, ps.id, 'tax_change', case when v_cur_rate > v_prev_rate then 'medium' else 'low' end,
'Retención: ' || round(v_prev_rate*100,1) || '% → ' || round(v_cur_rate*100,1) || '%',
jsonb_build_object('previous', round(v_prev_rate,4), 'current', round(v_cur_rate,4)))
on conflict do nothing;
end if;
if prev.period_year = ps.period_year and prev.cumulative_gross is not null and ps.cumulative_gross is not null
and ps.cumulative_gross < prev.cumulative_gross then
insert into payroll_anomalies (user_id, payslip_id, anomaly_type, severity, title, details)
values (d.user_id, ps.id, 'cumulative_regression', 'high', 'El bruto acumulado ha bajado respecto a ' || prev.period_label,
jsonb_build_object('previous', prev.cumulative_gross, 'current', ps.cumulative_gross))
on conflict do nothing;
end if;
end if;
select percentile_cont(0.5) within group (order by net_salary),
avg(overtime_hours)
into v_hist_net, v_hist_ot
from (select net_salary, overtime_hours from payroll_payslips x
where x.user_id = d.user_id and x.id <> ps.id and x.is_correction = false and x.period_type = ps.period_type
and payroll_period_key(x.period_type, x.period_year, x.period_number)
< payroll_period_key(ps.period_type, ps.period_year, ps.period_number)
order by x.period_year desc, x.period_number desc limit 8) h;
if v_hist_net is not null and v_hist_net > 0 and ps.net_salary is not null
and abs(ps.net_salary - v_hist_net) / v_hist_net > 0.25 then
insert into payroll_anomalies (user_id, payslip_id, anomaly_type, severity, title, details)
values (d.user_id, ps.id, 'net_change', case when ps.net_salary < v_hist_net then 'high' else 'low' end,
'Neto ' || ps.net_salary || ' frente a mediana ' || round(v_hist_net::numeric,2),
jsonb_build_object('median_last_8', round(v_hist_net::numeric,2), 'current', ps.net_salary))
on conflict do nothing;
end if;
if v_hist_ot is not null and ps.overtime_hours is not null and ps.overtime_hours > greatest(8, 2 * v_hist_ot) then
insert into payroll_anomalies (user_id, payslip_id, anomaly_type, severity, title, details)
values (d.user_id, ps.id, 'overtime_spike', 'low',
'Horas extra ' || ps.overtime_hours || ' (media ' || round(v_hist_ot::numeric,1) || ')',
jsonb_build_object('avg_last_8', round(v_hist_ot::numeric,2), 'current', ps.overtime_hours))
on conflict do nothing;
end if;
for r in
with recent as (
select x.id from payroll_payslips x
where x.user_id = d.user_id and x.id <> ps.id and x.is_correction = false and x.period_type = ps.period_type
and payroll_period_key(x.period_type, x.period_year, x.period_number)
< payroll_period_key(ps.period_type, ps.period_year, ps.period_number)
order by x.period_year desc, x.period_number desc limit 4),
hist as (select li.code, count(distinct li.payslip_id) n from payroll_line_items li
where li.payslip_id in (select id from recent) and li.category = 'deduction' group by li.code),
cur as (select distinct li.code from payroll_line_items li where li.payslip_id = ps.id and li.category = 'deduction'),
n_recent as (select count(*) n from recent)
select 'new_deduction' kind, c.code from cur c, n_recent nr
where nr.n >= 2 and not exists (select 1 from hist h where h.code = c.code)
union all
select 'missing_deduction', h.code from hist h, n_recent nr
where nr.n >= 3 and h.n >= 3 and not exists (select 1 from cur c where c.code = h.code)
loop
insert into payroll_anomalies (user_id, payslip_id, anomaly_type, severity, title, details)
values (d.user_id, ps.id, r.kind, 'medium',
case when r.kind = 'new_deduction' then 'Deducción nueva: ' else 'Deducción habitual ausente: ' end || r.code,
jsonb_build_object('key', r.code))
on conflict do nothing;
end loop;
if exists (select 1 from jsonb_array_elements(coalesce(p_payload->'checks','[]'::jsonb)) c
where c->>'rule' = 'R05_BANK_VS_NET' and (c->>'passed')::boolean = false) then
insert into payroll_anomalies (user_id, payslip_id, anomaly_type, severity, title, details)
values (d.user_id, ps.id, 'bank_vs_net', 'high', 'El pago bancario no coincide con el neto', '{}'::jsonb)
on conflict do nothing;
end if;
if exists (select 1 from jsonb_array_elements(coalesce(p_payload->'checks','[]'::jsonb)) c
where c->>'rule' in ('R03_HOURS_X_RATE','R04_HOURS_SUM') and (c->>'passed')::boolean = false) then
insert into payroll_anomalies (user_id, payslip_id, anomaly_type, severity, title, details)
values (d.user_id, ps.id, 'hours_mismatch', 'medium', 'Las horas no cuadran con la tarifa o el total', '{}'::jsonb)
on conflict do nothing;
end if;
if ps.is_correction or exists (select 1 from payroll_line_items li where li.payslip_id = ps.id and li.period_ref is not null) then
insert into payroll_anomalies (user_id, payslip_id, anomaly_type, severity, title, details)
values (d.user_id, ps.id, 'retro_correction', 'medium', 'Contiene correcciones de periodos anteriores',
jsonb_build_object('corrected_period_ref', ps.corrected_period_ref))
on conflict do nothing;
end if;
select count(*) into v_anoms from payroll_anomalies where payslip_id = ps.id and status = 'open';
if exists (select 1 from payroll_anomalies where payslip_id = ps.id and status = 'open' and severity = 'high')
and (rank_of->>v_status)::int < 2 then
v_status := 'review_required';
elsif v_anoms > 0 and v_status = 'verified' then
v_status := 'warning';
end if;
v_review := case when v_status in ('verified','warning') and coalesce(ps.confidence_overall,0) >= v_threshold
then 'not_required' else 'pending' end;
if ps.review_status = 'approved' then v_review := 'approved'; end if;
v_year := ps.period_year;
v_label := ps.period_label;
select count(*) into v_seq from payroll_payslips x
where x.user_id = d.user_id and x.employer_id = ps.employer_id and x.period_label = ps.period_label
and x.created_at < ps.created_at;
v_file := v_label || '_' || (p_payload->'employer'->>'code') || '_PAYSLIP'
|| case when ps.is_correction then '_CORR' else '' end
|| case when v_seq > 0 then '_' || lpad(v_seq::text, 2, '0') else '' end || '.pdf';
v_folder := d.user_id::text || '/Payroll/' || v_year || '/Payslips/';
perform set_config('payroll.skip_version', 'on', true);
update payroll_payslips set employer_id = e_id, validation_status = v_status, review_status = v_review
where id = ps.id returning * into ps;
perform set_config('payroll.skip_version', 'off', true);
update payroll_documents
set doc_class = 'payslip', status = case when v_review = 'pending' then 'review_required' else 'processed' end,
text_method = coalesce(p_payload->>'text_method', text_method),
archived_file_name = v_file, storage_path_archive = v_folder || v_file,
processed_at = now(), last_error_code = null, last_error_message = null
where id = d.id;
insert into payroll_events (user_id, document_id, payslip_id, event_type, detail)
values (d.user_id, d.id, ps.id, 'ingested',
jsonb_build_object('validation_status', v_status, 'review_status', v_review, 'anomalies', v_anoms,
'version', ps.extraction_version));
return jsonb_build_object(
'ok', true, 'duplicate', false,
'payslip_id', ps.id, 'document_id', d.id, 'employer_id', e_id,
'validation_status', v_status, 'review_status', v_review,
'anomaly_count', v_anoms,
'anomalies', coalesce((select jsonb_agg(jsonb_build_object('type', anomaly_type, 'severity', severity, 'title', title))
from payroll_anomalies where payslip_id = ps.id and status = 'open'), '[]'::jsonb),
'archived_file_name', v_file,
'storage_path_raw', d.storage_path_raw,
'storage_path_archive', v_folder || v_file,
'extraction_version', ps.extraction_version);
end $function$
;

CREATE OR REPLACE FUNCTION public.payroll_mark_failed(p_document_id uuid, p_error_code text, p_error_message text, p_step text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare d public.payroll_documents;
begin
update payroll_documents
set status = 'failed', last_error_code = left(p_error_code, 60), last_error_message = left(p_error_message, 500)
where id = p_document_id returning * into d;
if d.id is null then
return jsonb_build_object('ok', false, 'reason', 'document_not_found');
end if;
insert into payroll_events (user_id, document_id, event_type, detail)
values (d.user_id, d.id, 'failed', jsonb_build_object('code', p_error_code, 'step', p_step, 'attempt', d.attempt_count));
return jsonb_build_object('ok', true, 'document_id', d.id, 'attempt_count', d.attempt_count,
'will_retry', d.attempt_count < 3 and d.storage_path_raw is not null);
end $function$
;

CREATE OR REPLACE FUNCTION public.payroll_num(p jsonb, k text)
 RETURNS numeric
 LANGUAGE sql
 IMMUTABLE
 SET search_path TO 'public'
AS $function$
select case when jsonb_typeof(p->k) = 'number' then (p->>k)::numeric
when jsonb_typeof(p->k) = 'string' and (p->>k) ~ '^-?[0-9]+(\.[0-9]+)?$' then (p->>k)::numeric
else null end
$function$
;

CREATE OR REPLACE FUNCTION public.payroll_period_key(p_type text, p_year integer, p_num integer)
 RETURNS integer
 LANGUAGE sql
 IMMUTABLE
 SET search_path TO 'public'
AS $function$
select p_year * 100 + p_num
$function$
;

CREATE OR REPLACE FUNCTION public.payroll_periods_per_year(p_type text, p_year integer)
 RETURNS integer
 LANGUAGE sql
 IMMUTABLE
 SET search_path TO 'public'
AS $function$
select case p_type
when 'weekly' then extract(week from make_date(p_year, 12, 28))::int
when 'four_weekly' then 13
when 'monthly' then 12
when 'semi_monthly' then 24
else null end
$function$
;

CREATE OR REPLACE FUNCTION public.payroll_register_document(p_user_id uuid, p_sha256 text, p_file_name text, p_source text, p_source_ref text DEFAULT NULL::text, p_mime text DEFAULT NULL::text, p_size bigint DEFAULT NULL::bigint, p_storage_path_raw text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare d public.payroll_documents; v_new boolean := false;
begin
insert into payroll_documents (user_id, file_sha256, original_file_name, source, source_ref, mime_type, size_bytes,
storage_path_raw, status, attempt_count)
values (p_user_id, lower(p_sha256), p_file_name, coalesce(p_source,'manual'), p_source_ref, p_mime, p_size,
p_storage_path_raw, 'processing', 1)
on conflict (user_id, file_sha256) do nothing
returning * into d;
if found then
v_new := true;
else
select * into d from payroll_documents where user_id = p_user_id and file_sha256 = lower(p_sha256);
if d.status in ('failed','received','processing') then
update payroll_documents
set status = 'processing', attempt_count = attempt_count + 1,
storage_path_raw = coalesce(p_storage_path_raw, storage_path_raw),
last_error_code = null, last_error_message = null
where id = d.id returning * into d;
end if;
end if;
insert into payroll_events (user_id, document_id, event_type, detail)
values (p_user_id, d.id, case when v_new then 'registered' when d.status = 'processing' then 'reprocess' else 'duplicate_file' end,
jsonb_build_object('source', p_source, 'attempt', d.attempt_count));
return jsonb_build_object(
'document_id', d.id,
'is_new', v_new,
'is_duplicate', (not v_new and d.status not in ('processing')),
'status', d.status,
'attempt_count', d.attempt_count,
'archived_file_name', d.archived_file_name);
end $function$
;

CREATE OR REPLACE FUNCTION public.payroll_retry_queue(p_max_attempts integer DEFAULT 3)
 RETURNS TABLE(document_id uuid, user_id uuid, storage_path_raw text, original_file_name text, file_sha256 text, mime_type text, attempt_count integer)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
select id, user_id, storage_path_raw, original_file_name, file_sha256, mime_type, attempt_count
from payroll_documents
where status = 'failed' and attempt_count < p_max_attempts and storage_path_raw is not null
and updated_at < now() - interval '30 minutes'
order by updated_at
limit 10
$function$
;

CREATE OR REPLACE FUNCTION public.payroll_set_classification(p_document_id uuid, p_doc_class text, p_confidence numeric, p_text_method text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare d public.payroll_documents;
begin
update payroll_documents
set doc_class = p_doc_class, classification_confidence = p_confidence,
text_method = coalesce(p_text_method, text_method),
status = case when p_doc_class = 'payslip' then status else 'ignored' end,
processed_at = case when p_doc_class = 'payslip' then processed_at else now() end
where id = p_document_id returning * into d;
insert into payroll_events (user_id, document_id, event_type, detail)
values (d.user_id, d.id, 'classified', jsonb_build_object('doc_class', p_doc_class, 'confidence', p_confidence));
return jsonb_build_object('document_id', d.id, 'doc_class', d.doc_class, 'status', d.status);
end $function$
;

CREATE OR REPLACE FUNCTION public.payroll_snapshot_payslip()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
if coalesce(current_setting('payroll.skip_version', true), '') <> 'on'
and to_jsonb(old) - 'updated_at' is distinct from to_jsonb(new) - 'updated_at' then
insert into public.payroll_payslip_versions (user_id, payslip_id, version, snapshot, change_source)
values (old.user_id, old.id, old.extraction_version, to_jsonb(old),
coalesce(current_setting('payroll.change_source', true), 'system'))
on conflict (payslip_id, version) do nothing;
new.extraction_version := old.extraction_version + 1;
end if;
return new;
end $function$
;

CREATE OR REPLACE FUNCTION public.payroll_touch_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
begin
new.updated_at := now();
return new;
end $function$
;

-- 5. Triggers
CREATE OR REPLACE TRIGGER payroll_documents_touch BEFORE UPDATE ON public.payroll_documents FOR EACH ROW EXECUTE FUNCTION payroll_touch_updated_at();
CREATE OR REPLACE TRIGGER payroll_employers_touch BEFORE UPDATE ON public.payroll_employers FOR EACH ROW EXECUTE FUNCTION payroll_touch_updated_at();
CREATE OR REPLACE TRIGGER payroll_payslips_touch BEFORE UPDATE ON public.payroll_payslips FOR EACH ROW EXECUTE FUNCTION payroll_touch_updated_at();
CREATE OR REPLACE TRIGGER payroll_payslips_version_trg BEFORE UPDATE ON public.payroll_payslips FOR EACH ROW EXECUTE FUNCTION payroll_snapshot_payslip();

-- 6. RLS (forzado) y políticas por propietario (incluye Storage del bucket payroll)
alter table public.payroll_anomalies enable row level security; alter table public.payroll_anomalies force row level security;
alter table public.payroll_corrections enable row level security; alter table public.payroll_corrections force row level security;
alter table public.payroll_documents enable row level security; alter table public.payroll_documents force row level security;
alter table public.payroll_employers enable row level security; alter table public.payroll_employers force row level security;
alter table public.payroll_events enable row level security; alter table public.payroll_events force row level security;
alter table public.payroll_line_items enable row level security; alter table public.payroll_line_items force row level security;
alter table public.payroll_payslip_versions enable row level security; alter table public.payroll_payslip_versions force row level security;
alter table public.payroll_payslips enable row level security; alter table public.payroll_payslips force row level security;
alter table public.payroll_validations enable row level security; alter table public.payroll_validations force row level security;
do $p$ begin if not exists (select 1 from pg_policies where schemaname='public' and tablename='payroll_anomalies' and policyname='payroll_anomalies_owner_select') then create policy payroll_anomalies_owner_select on public.payroll_anomalies as PERMISSIVE for SELECT to authenticated using ((user_id = auth.uid())); end if; end $p$;
do $p$ begin if not exists (select 1 from pg_policies where schemaname='public' and tablename='payroll_anomalies' and policyname='payroll_anomalies_owner_update') then create policy payroll_anomalies_owner_update on public.payroll_anomalies as PERMISSIVE for UPDATE to authenticated using ((user_id = auth.uid())) with check ((user_id = auth.uid())); end if; end $p$;
do $p$ begin if not exists (select 1 from pg_policies where schemaname='public' and tablename='payroll_corrections' and policyname='payroll_corrections_owner_insert') then create policy payroll_corrections_owner_insert on public.payroll_corrections as PERMISSIVE for INSERT to authenticated with check ((user_id = auth.uid())); end if; end $p$;
do $p$ begin if not exists (select 1 from pg_policies where schemaname='public' and tablename='payroll_corrections' and policyname='payroll_corrections_owner_select') then create policy payroll_corrections_owner_select on public.payroll_corrections as PERMISSIVE for SELECT to authenticated using ((user_id = auth.uid())); end if; end $p$;
do $p$ begin if not exists (select 1 from pg_policies where schemaname='public' and tablename='payroll_documents' and policyname='payroll_documents_owner_select') then create policy payroll_documents_owner_select on public.payroll_documents as PERMISSIVE for SELECT to authenticated using ((user_id = auth.uid())); end if; end $p$;
do $p$ begin if not exists (select 1 from pg_policies where schemaname='public' and tablename='payroll_documents' and policyname='payroll_documents_owner_update') then create policy payroll_documents_owner_update on public.payroll_documents as PERMISSIVE for UPDATE to authenticated using ((user_id = auth.uid())) with check ((user_id = auth.uid())); end if; end $p$;
do $p$ begin if not exists (select 1 from pg_policies where schemaname='public' and tablename='payroll_employers' and policyname='payroll_employers_owner_select') then create policy payroll_employers_owner_select on public.payroll_employers as PERMISSIVE for SELECT to authenticated using ((user_id = auth.uid())); end if; end $p$;
do $p$ begin if not exists (select 1 from pg_policies where schemaname='public' and tablename='payroll_events' and policyname='payroll_events_owner_select') then create policy payroll_events_owner_select on public.payroll_events as PERMISSIVE for SELECT to authenticated using ((user_id = auth.uid())); end if; end $p$;
do $p$ begin if not exists (select 1 from pg_policies where schemaname='public' and tablename='payroll_line_items' and policyname='payroll_line_items_owner_select') then create policy payroll_line_items_owner_select on public.payroll_line_items as PERMISSIVE for SELECT to authenticated using ((user_id = auth.uid())); end if; end $p$;
do $p$ begin if not exists (select 1 from pg_policies where schemaname='public' and tablename='payroll_payslip_versions' and policyname='payroll_payslip_versions_owner_select') then create policy payroll_payslip_versions_owner_select on public.payroll_payslip_versions as PERMISSIVE for SELECT to authenticated using ((user_id = auth.uid())); end if; end $p$;
do $p$ begin if not exists (select 1 from pg_policies where schemaname='public' and tablename='payroll_payslips' and policyname='payroll_payslips_owner_select') then create policy payroll_payslips_owner_select on public.payroll_payslips as PERMISSIVE for SELECT to authenticated using ((user_id = auth.uid())); end if; end $p$;
do $p$ begin if not exists (select 1 from pg_policies where schemaname='public' and tablename='payroll_payslips' and policyname='payroll_payslips_owner_update') then create policy payroll_payslips_owner_update on public.payroll_payslips as PERMISSIVE for UPDATE to authenticated using ((user_id = auth.uid())) with check ((user_id = auth.uid())); end if; end $p$;
do $p$ begin if not exists (select 1 from pg_policies where schemaname='public' and tablename='payroll_validations' and policyname='payroll_validations_owner_select') then create policy payroll_validations_owner_select on public.payroll_validations as PERMISSIVE for SELECT to authenticated using ((user_id = auth.uid())); end if; end $p$;
do $p$ begin if not exists (select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='payroll_storage_owner_read') then create policy payroll_storage_owner_read on storage.objects as PERMISSIVE for SELECT to authenticated using (((bucket_id = 'payroll'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text))); end if; end $p$;

-- 7. Vistas (security_invoker)
create or replace view public.payroll_income_items with (security_invoker=true) as
 SELECT id,
    user_id,
    payslip_id,
    category,
    code,
    label_original,
    quantity,
    rate,
    amount,
    period_ref,
    sort_order,
    created_at
   FROM payroll_line_items
  WHERE category = 'income'::text;

create or replace view public.payroll_deductions with (security_invoker=true) as
 SELECT id,
    user_id,
    payslip_id,
    category,
    code,
    label_original,
    quantity,
    rate,
    amount,
    period_ref,
    sort_order,
    created_at
   FROM payroll_line_items
  WHERE category = 'deduction'::text;

create or replace view public.payroll_hours with (security_invoker=true) as
 SELECT id,
    user_id,
    payslip_id,
    category,
    code,
    label_original,
    quantity,
    rate,
    amount,
    period_ref,
    sort_order,
    created_at
   FROM payroll_line_items
  WHERE category = 'hours'::text;

create or replace view public.payroll_v_confirmed with (security_invoker=true) as
 SELECT p.id,
    p.user_id,
    p.document_id,
    p.employer_id,
    p.employee_name,
    p.employee_number,
    p.payslip_number,
    p.period_type,
    p.period_year,
    p.period_number,
    p.period_label,
    p.period_start,
    p.period_end,
    p.payment_date,
    p.document_date,
    p.currency,
    p.contract_type,
    p.hourly_rate,
    p.salary_rate,
    p.contracted_hours,
    p.worked_hours,
    p.regular_hours,
    p.overtime_hours,
    p.holiday_hours,
    p.sick_hours,
    p.unpaid_hours,
    p.paid_leave_hours,
    p.gross_salary,
    p.regular_pay,
    p.overtime_pay,
    p.holiday_pay,
    p.vakantiegeld,
    p.bonuses,
    p.allowances,
    p.shift_allowance,
    p.travel_allowance,
    p.expense_reimbursements,
    p.other_income,
    p.taxable_income,
    p.loonheffing,
    p.wage_tax,
    p.social_contributions,
    p.pension_contribution,
    p.insurance_deductions,
    p.employee_contributions,
    p.corrections,
    p.garnishments,
    p.other_deductions,
    p.total_deductions,
    p.net_salary,
    p.net_payment,
    p.bank_payment,
    p.total_employer_cost,
    p.loon_voor_loonheffing,
    p.sv_loon,
    p.arbeidskorting,
    p.loonheffingskorting_applied,
    p.bijzonder_tarief_pct,
    p.tabel_type,
    p.vakantiegeld_basis,
    p.vakantiegeld_reserved,
    p.reserveringen,
    p.pensioenbasis,
    p.jaarloon_bijzonder_tarief,
    p.cumulative_gross,
    p.cumulative_tax,
    p.cumulative_net,
    p.cumulative_hours,
    p.cumulative_holiday_pay,
    p.cumulative_taxable_income,
    p.is_correction,
    p.corrected_period_ref,
    p.confidence_overall,
    p.field_confidence,
    p.validation_status,
    p.review_status,
    p.reviewed_at,
    p.extraction_version,
    p.model_name,
    p.prompt_version,
    p.text_method,
    p.raw_extraction,
    p.summary,
    p.created_at,
    p.updated_at,
    e.name AS employer_name,
    e.normalized_code AS employer_code,
        CASE
            WHEN p.period_type = 'weekly'::text AND NOT COALESCE(p.is_correction, false) AND p.period_year IS NOT NULL AND p.period_number >= 1 AND p.period_number <= 53 THEN to_date(p.period_year::text || lpad(p.period_number::text, 2, '0'::text), 'IYYYIW'::text) + 9
            ELSE COALESCE(p.payment_date,
            CASE
                WHEN p.period_type = 'weekly'::text AND p.period_year IS NOT NULL AND p.period_number >= 1 AND p.period_number <= 53 THEN to_date(p.period_year::text || lpad(p.period_number::text, 2, '0'::text), 'IYYYIW'::text) + 9
                ELSE NULL::date
            END, p.period_end, p.document_date)
        END AS ref_date,
        CASE
            WHEN p.worked_hours > 0::numeric THEN round(p.gross_salary / p.worked_hours, 2)
            ELSE NULL::numeric
        END AS effective_gross_hourly,
        CASE
            WHEN p.worked_hours > 0::numeric THEN round(p.net_salary / p.worked_hours, 2)
            ELSE NULL::numeric
        END AS effective_net_hourly,
        CASE
            WHEN COALESCE(p.loon_voor_loonheffing, p.taxable_income, p.gross_salary) > 0::numeric THEN round(p.loonheffing / COALESCE(p.loon_voor_loonheffing, p.taxable_income, p.gross_salary), 4)
            ELSE NULL::numeric
        END AS tax_rate
   FROM payroll_payslips p
     JOIN payroll_employers e ON e.id = p.employer_id
  WHERE (p.review_status = ANY (ARRAY['approved'::text, 'not_required'::text])) AND p.validation_status <> 'failed'::text;

create or replace view public.payroll_v_monthly with (security_invoker=true) as
 SELECT user_id,
    date_trunc('month'::text, ref_date::timestamp with time zone)::date AS month,
    count(*) AS payslips,
    sum(gross_salary) AS gross,
    sum(net_salary) AS net,
    sum(loonheffing) AS tax,
    sum(worked_hours) AS hours,
    sum(overtime_hours) AS overtime_hours,
    sum(overtime_pay) AS overtime_pay,
    sum(vakantiegeld) AS vakantiegeld_paid,
    sum(vakantiegeld_reserved) AS vakantiegeld_reserved,
        CASE
            WHEN sum(worked_hours) > 0::numeric THEN round(sum(net_salary) / sum(worked_hours), 2)
            ELSE NULL::numeric
        END AS net_per_hour,
        CASE
            WHEN sum(gross_salary) > 0::numeric THEN round(sum(loonheffing) / sum(gross_salary), 4)
            ELSE NULL::numeric
        END AS tax_share
   FROM payroll_v_confirmed
  GROUP BY user_id, (date_trunc('month'::text, ref_date::timestamp with time zone));

create or replace view public.payroll_v_ytd with (security_invoker=true) as
 SELECT user_id,
    period_year AS year,
    count(*) AS payslips,
    sum(gross_salary) AS gross_ytd,
    sum(net_salary) AS net_ytd,
    sum(loonheffing) AS tax_ytd,
    sum(worked_hours) AS hours_ytd,
    sum(overtime_hours) AS overtime_hours_ytd,
    sum(vakantiegeld) AS vakantiegeld_paid_ytd,
    max(vakantiegeld_reserved) FILTER (WHERE vakantiegeld_reserved IS NOT NULL) AS vakantiegeld_reserved_max,
    round(avg(gross_salary), 2) AS avg_gross,
    round(avg(net_salary), 2) AS avg_net,
        CASE
            WHEN sum(worked_hours) > 0::numeric THEN round(sum(net_salary) / sum(worked_hours), 2)
            ELSE NULL::numeric
        END AS effective_net_hourly,
        CASE
            WHEN sum(gross_salary) > 0::numeric THEN round(sum(loonheffing) / sum(gross_salary), 4)
            ELSE NULL::numeric
        END AS tax_share,
    round(stddev_samp(net_salary) / NULLIF(avg(net_salary), 0::numeric), 4) AS net_volatility_cv,
    sum(loon_voor_loonheffing) AS jaaropgave_loon_lh_sum,
    (array_agg(cumulative_taxable_income ORDER BY period_number DESC) FILTER (WHERE cumulative_taxable_income IS NOT NULL))[1] AS jaaropgave_loon_lh_cumulative,
    (array_agg(cumulative_tax ORDER BY period_number DESC) FILTER (WHERE cumulative_tax IS NOT NULL))[1] AS jaaropgave_lh_cumulative
   FROM payroll_v_confirmed
  GROUP BY user_id, period_year;

create or replace view public.payroll_v_rate_history with (security_invoker=true) as
 SELECT user_id,
    employer_code,
    hourly_rate,
    min(period_label) AS from_period,
    max(period_label) AS to_period,
    count(*) AS payslips
   FROM payroll_v_confirmed
  WHERE hourly_rate IS NOT NULL
  GROUP BY user_id, employer_code, hourly_rate;

create or replace view public.payroll_v_queue with (security_invoker=true) as
 SELECT user_id,
    status,
    count(*) AS documents,
    max(updated_at) AS last_change
   FROM payroll_documents
  GROUP BY user_id, status;

create or replace view public.payroll_v_monthly_nl with (security_invoker=true) as
 WITH base AS (
         SELECT p.id,
            p.user_id,
            p.document_id,
            p.employer_id,
            p.employee_name,
            p.employee_number,
            p.payslip_number,
            p.period_type,
            p.period_year,
            p.period_number,
            p.period_label,
            p.period_start,
            p.period_end,
            p.payment_date,
            p.document_date,
            p.currency,
            p.contract_type,
            p.hourly_rate,
            p.salary_rate,
            p.contracted_hours,
            p.worked_hours,
            p.regular_hours,
            p.overtime_hours,
            p.holiday_hours,
            p.sick_hours,
            p.unpaid_hours,
            p.paid_leave_hours,
            p.gross_salary,
            p.regular_pay,
            p.overtime_pay,
            p.holiday_pay,
            p.vakantiegeld,
            p.bonuses,
            p.allowances,
            p.shift_allowance,
            p.travel_allowance,
            p.expense_reimbursements,
            p.other_income,
            p.taxable_income,
            p.loonheffing,
            p.wage_tax,
            p.social_contributions,
            p.pension_contribution,
            p.insurance_deductions,
            p.employee_contributions,
            p.corrections,
            p.garnishments,
            p.other_deductions,
            p.total_deductions,
            p.net_salary,
            p.net_payment,
            p.bank_payment,
            p.total_employer_cost,
            p.loon_voor_loonheffing,
            p.sv_loon,
            p.arbeidskorting,
            p.loonheffingskorting_applied,
            p.bijzonder_tarief_pct,
            p.tabel_type,
            p.vakantiegeld_basis,
            p.vakantiegeld_reserved,
            p.reserveringen,
            p.pensioenbasis,
            p.jaarloon_bijzonder_tarief,
            p.cumulative_gross,
            p.cumulative_tax,
            p.cumulative_net,
            p.cumulative_hours,
            p.cumulative_holiday_pay,
            p.cumulative_taxable_income,
            p.is_correction,
            p.corrected_period_ref,
            p.confidence_overall,
            p.field_confidence,
            p.validation_status,
            p.review_status,
            p.reviewed_at,
            p.extraction_version,
            p.model_name,
            p.prompt_version,
            p.text_method,
            p.raw_extraction,
            p.summary,
            p.created_at,
            p.updated_at,
                CASE
                    WHEN p.period_type = 'weekly'::text AND NOT COALESCE(p.is_correction, false) AND p.period_year IS NOT NULL AND p.period_number >= 1 AND p.period_number <= 53 THEN to_date(p.period_year::text || lpad(p.period_number::text, 2, '0'::text), 'IYYYIW'::text) + 9
                    ELSE COALESCE(p.payment_date,
                    CASE
                        WHEN p.period_type = 'weekly'::text AND p.period_year IS NOT NULL AND p.period_number >= 1 AND p.period_number <= 53 THEN to_date(p.period_year::text || lpad(p.period_number::text, 2, '0'::text), 'IYYYIW'::text) + 9
                        ELSE NULL::date
                    END, p.period_end, p.document_date)
                END AS ref_date,
            ( SELECT (r.value ->> 'balance'::text)::numeric AS "numeric"
                   FROM jsonb_array_elements(COALESCE(p.reserveringen, '[]'::jsonb)) r(value)
                  WHERE (r.value ->> 'name'::text) ~~* 'vakantiedagen%'::text
                 LIMIT 1) AS vd,
            ( SELECT (r.value ->> 'balance'::text)::numeric AS "numeric"
                   FROM jsonb_array_elements(COALESCE(p.reserveringen, '[]'::jsonb)) r(value)
                  WHERE (r.value ->> 'name'::text) ~~* 'keuzebudget%'::text
                 LIMIT 1) AS kb,
            ( SELECT sum(l.amount) AS sum
                   FROM payroll_line_items l
                  WHERE l.payslip_id = p.id AND l.code = 'paid_leave'::text) AS verlof,
            ( SELECT sum(l.amount) AS sum
                   FROM payroll_line_items l
                  WHERE l.payslip_id = p.id AND l.code = 'sick_pay'::text) AS ziekte
           FROM payroll_payslips p
          WHERE p.validation_status <> 'failed'::text
        )
 SELECT user_id,
    date_trunc('month'::text, ref_date::timestamp with time zone)::date AS mes,
    to_char(ref_date::timestamp with time zone, 'YYYY-MM'::text) AS mes_label,
    count(*) AS pagos,
    string_agg(period_label, ', '::text ORDER BY ref_date) AS semanas,
    min(ref_date) AS primer_pago,
    max(ref_date) AS ultimo_pago,
    count(*) FILTER (WHERE review_status = 'pending'::text) AS pendientes_revision,
    sum(worked_hours) AS horas_trabajadas,
    sum(regular_hours) AS horas_normales,
    COALESCE(sum(overtime_hours), 0::numeric) AS horas_extra,
    sum(gross_salary) AS bruto,
    sum(regular_pay) AS salario_base,
    COALESCE(sum(overtime_pay), 0::numeric) AS pago_horas_extra,
    COALESCE(sum(holiday_pay), 0::numeric) AS feestdagen,
    COALESCE(sum(shift_allowance), 0::numeric) AS toeslagen,
    COALESCE(sum(vakantiegeld), 0::numeric) AS vakantiegeld_pagado,
    COALESCE(sum(bonuses), 0::numeric) + COALESCE(sum(other_income), 0::numeric) AS otros_ingresos,
    COALESCE(sum(loonheffing), 0::numeric) AS loonheffing,
    COALESCE(sum(pension_contribution), 0::numeric) AS pensioen,
    COALESCE(sum(insurance_deductions), 0::numeric) + COALESCE(sum(social_contributions), 0::numeric) AS premies,
    COALESCE(sum(total_deductions), 0::numeric) AS total_retenciones,
    sum(net_salary) AS neto,
    COALESCE(sum(travel_allowance), 0::numeric) + COALESCE(sum(expense_reimbursements), 0::numeric) AS allowances_netas,
    sum(COALESCE(net_payment, net_salary + COALESCE(travel_allowance, 0::numeric))) AS cobrado_banco,
    round(sum(net_salary) FILTER (WHERE NOT is_correction) / NULLIF(sum(worked_hours) FILTER (WHERE NOT is_correction), 0::numeric), 2) AS neto_por_hora,
    round(sum(gross_salary) FILTER (WHERE NOT is_correction) / NULLIF(sum(worked_hours) FILTER (WHERE NOT is_correction), 0::numeric), 2) AS bruto_por_hora,
    round(sum(loonheffing) / NULLIF(sum(gross_salary), 0::numeric), 4) AS tipo_retencion,
    round(avg(gross_salary) FILTER (WHERE NOT is_correction) * 13::numeric / 3::numeric, 2) AS bruto_mensual_equivalente,
    round(avg(net_salary) FILTER (WHERE NOT is_correction) * 13::numeric / 3::numeric, 2) AS neto_mensual_equivalente,
    (array_agg(vakantiegeld_reserved ORDER BY ref_date DESC) FILTER (WHERE vakantiegeld_reserved IS NOT NULL))[1] AS vakantiegeld_reservado,
    (array_agg(vd ORDER BY ref_date DESC) FILTER (WHERE vd IS NOT NULL))[1] AS vakantiedagen_uren,
    (array_agg(kb ORDER BY ref_date DESC) FILTER (WHERE kb IS NOT NULL))[1] AS keuzebudget_saldo,
    (array_agg(cumulative_gross ORDER BY ref_date DESC) FILTER (WHERE cumulative_gross IS NOT NULL))[1] AS bruto_acumulado_anual,
    count(*) FILTER (WHERE is_correction) AS correcciones,
    COALESCE(sum(worked_hours - COALESCE(regular_hours, 0::numeric) - COALESCE(overtime_hours, 0::numeric)) FILTER (WHERE NOT is_correction), 0::numeric) AS horas_ort,
    COALESCE(sum(verlof), 0::numeric) AS verlof_pagado,
    COALESCE(sum(ziekte), 0::numeric) AS ziekte_pagado,
    max(hourly_rate) AS tarifa_hora
   FROM base
  GROUP BY user_id, (date_trunc('month'::text, ref_date::timestamp with time zone)), (to_char(ref_date::timestamp with time zone, 'YYYY-MM'::text));

create or replace view public.payroll_v_jaaropgave_nl with (security_invoker=true) as
 WITH base AS (
         SELECT p.id,
            p.user_id,
            p.document_id,
            p.employer_id,
            p.employee_name,
            p.employee_number,
            p.payslip_number,
            p.period_type,
            p.period_year,
            p.period_number,
            p.period_label,
            p.period_start,
            p.period_end,
            p.payment_date,
            p.document_date,
            p.currency,
            p.contract_type,
            p.hourly_rate,
            p.salary_rate,
            p.contracted_hours,
            p.worked_hours,
            p.regular_hours,
            p.overtime_hours,
            p.holiday_hours,
            p.sick_hours,
            p.unpaid_hours,
            p.paid_leave_hours,
            p.gross_salary,
            p.regular_pay,
            p.overtime_pay,
            p.holiday_pay,
            p.vakantiegeld,
            p.bonuses,
            p.allowances,
            p.shift_allowance,
            p.travel_allowance,
            p.expense_reimbursements,
            p.other_income,
            p.taxable_income,
            p.loonheffing,
            p.wage_tax,
            p.social_contributions,
            p.pension_contribution,
            p.insurance_deductions,
            p.employee_contributions,
            p.corrections,
            p.garnishments,
            p.other_deductions,
            p.total_deductions,
            p.net_salary,
            p.net_payment,
            p.bank_payment,
            p.total_employer_cost,
            p.loon_voor_loonheffing,
            p.sv_loon,
            p.arbeidskorting,
            p.loonheffingskorting_applied,
            p.bijzonder_tarief_pct,
            p.tabel_type,
            p.vakantiegeld_basis,
            p.vakantiegeld_reserved,
            p.reserveringen,
            p.pensioenbasis,
            p.jaarloon_bijzonder_tarief,
            p.cumulative_gross,
            p.cumulative_tax,
            p.cumulative_net,
            p.cumulative_hours,
            p.cumulative_holiday_pay,
            p.cumulative_taxable_income,
            p.is_correction,
            p.corrected_period_ref,
            p.confidence_overall,
            p.field_confidence,
            p.validation_status,
            p.review_status,
            p.reviewed_at,
            p.extraction_version,
            p.model_name,
            p.prompt_version,
            p.text_method,
            p.raw_extraction,
            p.summary,
            p.created_at,
            p.updated_at,
                CASE
                    WHEN p.period_type = 'weekly'::text AND NOT COALESCE(p.is_correction, false) AND p.period_year IS NOT NULL AND p.period_number >= 1 AND p.period_number <= 53 THEN to_date(p.period_year::text || lpad(p.period_number::text, 2, '0'::text), 'IYYYIW'::text) + 9
                    ELSE COALESCE(p.payment_date,
                    CASE
                        WHEN p.period_type = 'weekly'::text AND p.period_year IS NOT NULL AND p.period_number >= 1 AND p.period_number <= 53 THEN to_date(p.period_year::text || lpad(p.period_number::text, 2, '0'::text), 'IYYYIW'::text) + 9
                        ELSE NULL::date
                    END, p.period_end, p.document_date)
                END AS ref_date
           FROM payroll_payslips p
          WHERE p.validation_status <> 'failed'::text
        ), y AS (
         SELECT EXTRACT(year FROM base.ref_date)::integer AS jaar,
                CASE
                    WHEN base.payslip_number ~ '^[0-9]+$'::text THEN base.payslip_number::integer
                    ELSE NULL::integer
                END AS pnum,
            base.id,
            base.user_id,
            base.document_id,
            base.employer_id,
            base.employee_name,
            base.employee_number,
            base.payslip_number,
            base.period_type,
            base.period_year,
            base.period_number,
            base.period_label,
            base.period_start,
            base.period_end,
            base.payment_date,
            base.document_date,
            base.currency,
            base.contract_type,
            base.hourly_rate,
            base.salary_rate,
            base.contracted_hours,
            base.worked_hours,
            base.regular_hours,
            base.overtime_hours,
            base.holiday_hours,
            base.sick_hours,
            base.unpaid_hours,
            base.paid_leave_hours,
            base.gross_salary,
            base.regular_pay,
            base.overtime_pay,
            base.holiday_pay,
            base.vakantiegeld,
            base.bonuses,
            base.allowances,
            base.shift_allowance,
            base.travel_allowance,
            base.expense_reimbursements,
            base.other_income,
            base.taxable_income,
            base.loonheffing,
            base.wage_tax,
            base.social_contributions,
            base.pension_contribution,
            base.insurance_deductions,
            base.employee_contributions,
            base.corrections,
            base.garnishments,
            base.other_deductions,
            base.total_deductions,
            base.net_salary,
            base.net_payment,
            base.bank_payment,
            base.total_employer_cost,
            base.loon_voor_loonheffing,
            base.sv_loon,
            base.arbeidskorting,
            base.loonheffingskorting_applied,
            base.bijzonder_tarief_pct,
            base.tabel_type,
            base.vakantiegeld_basis,
            base.vakantiegeld_reserved,
            base.reserveringen,
            base.pensioenbasis,
            base.jaarloon_bijzonder_tarief,
            base.cumulative_gross,
            base.cumulative_tax,
            base.cumulative_net,
            base.cumulative_hours,
            base.cumulative_holiday_pay,
            base.cumulative_taxable_income,
            base.is_correction,
            base.corrected_period_ref,
            base.confidence_overall,
            base.field_confidence,
            base.validation_status,
            base.review_status,
            base.reviewed_at,
            base.extraction_version,
            base.model_name,
            base.prompt_version,
            base.text_method,
            base.raw_extraction,
            base.summary,
            base.created_at,
            base.updated_at,
            base.ref_date
           FROM base
        )
 SELECT user_id,
    jaar,
    count(*) AS nominas,
    count(*) FILTER (WHERE is_correction) AS correcciones,
    count(*) FILTER (WHERE review_status = 'pending'::text) AS pendientes_revision,
    min(ref_date) AS primer_pago,
    max(ref_date) AS ultimo_pago,
    sum(gross_salary) AS bruto_registrado,
    sum(loon_voor_loonheffing) AS loon_lh_registrado,
    COALESCE(sum(loonheffing), 0::numeric) AS loonheffing_registrada,
    (array_agg(cumulative_gross ORDER BY ref_date DESC, pnum DESC NULLS LAST) FILTER (WHERE cumulative_gross IS NOT NULL))[1] AS bruto_acumulado_oficial,
    (array_agg(cumulative_taxable_income ORDER BY ref_date DESC, pnum DESC NULLS LAST) FILTER (WHERE cumulative_taxable_income IS NOT NULL))[1] AS loon_lh_acumulado_oficial,
    (array_agg(cumulative_tax ORDER BY ref_date DESC, pnum DESC NULLS LAST) FILTER (WHERE cumulative_tax IS NOT NULL))[1] AS loonheffing_acumulada_oficial,
    round(COALESCE((array_agg(cumulative_gross ORDER BY ref_date DESC, pnum DESC NULLS LAST) FILTER (WHERE cumulative_gross IS NOT NULL))[1], 0::numeric) - COALESCE(sum(gross_salary), 0::numeric), 2) AS diferencia_bruto,
    sum(net_salary) AS neto,
    sum(COALESCE(net_payment, net_salary + COALESCE(travel_allowance, 0::numeric))) AS cobrado_banco,
    COALESCE(sum(travel_allowance), 0::numeric) AS reiskosten_onbelast,
    COALESCE(sum(pension_contribution), 0::numeric) AS pensioen,
    COALESCE(sum(insurance_deductions), 0::numeric) + COALESCE(sum(social_contributions), 0::numeric) AS premies,
    sum(worked_hours) AS horas,
    COALESCE(sum(overtime_hours), 0::numeric) AS horas_extra,
    COALESCE(sum(overtime_pay), 0::numeric) AS pago_horas_extra,
    COALESCE(sum(shift_allowance), 0::numeric) AS toeslagen,
    COALESCE(sum(vakantiegeld), 0::numeric) AS vakantiegeld_pagado,
    (array_agg(vakantiegeld_reserved ORDER BY ref_date DESC) FILTER (WHERE vakantiegeld_reserved IS NOT NULL))[1] AS vakantiegeld_reservado,
    abs(COALESCE((array_agg(cumulative_gross ORDER BY ref_date DESC, pnum DESC NULLS LAST) FILTER (WHERE cumulative_gross IS NOT NULL))[1], 0::numeric) - COALESCE(sum(gross_salary), 0::numeric)) < 1::numeric AS completo
   FROM y
  GROUP BY user_id, jaar;

-- 8. Permisos
revoke all on table public.payroll_anomalies from anon, authenticated;
revoke all on table public.payroll_corrections from anon, authenticated;
revoke all on table public.payroll_deductions from anon, authenticated;
revoke all on table public.payroll_documents from anon, authenticated;
revoke all on table public.payroll_employers from anon, authenticated;
revoke all on table public.payroll_events from anon, authenticated;
revoke all on table public.payroll_events_id_seq from anon, authenticated;
revoke all on table public.payroll_hours from anon, authenticated;
revoke all on table public.payroll_income_items from anon, authenticated;
revoke all on table public.payroll_line_items from anon, authenticated;
revoke all on table public.payroll_payslip_versions from anon, authenticated;
revoke all on table public.payroll_payslip_versions_id_seq from anon, authenticated;
revoke all on table public.payroll_payslips from anon, authenticated;
revoke all on table public.payroll_v_confirmed from anon, authenticated;
revoke all on table public.payroll_v_jaaropgave_nl from anon, authenticated;
revoke all on table public.payroll_v_monthly from anon, authenticated;
revoke all on table public.payroll_v_monthly_nl from anon, authenticated;
revoke all on table public.payroll_v_queue from anon, authenticated;
revoke all on table public.payroll_v_rate_history from anon, authenticated;
revoke all on table public.payroll_v_ytd from anon, authenticated;
revoke all on table public.payroll_validations from anon, authenticated;
grant delete, insert, maintain, references, select, trigger, truncate, update on table public.payroll_anomalies to service_role;
grant delete, insert, maintain, references, select, trigger, truncate, update on table public.payroll_corrections to service_role;
grant delete, insert, maintain, references, select, trigger, truncate, update on table public.payroll_deductions to service_role;
grant delete, insert, maintain, references, select, trigger, truncate, update on table public.payroll_documents to service_role;
grant delete, insert, maintain, references, select, trigger, truncate, update on table public.payroll_employers to service_role;
grant delete, insert, maintain, references, select, trigger, truncate, update on table public.payroll_events to service_role;
grant delete, insert, maintain, references, select, trigger, truncate, update on table public.payroll_hours to service_role;
grant delete, insert, maintain, references, select, trigger, truncate, update on table public.payroll_income_items to service_role;
grant delete, insert, maintain, references, select, trigger, truncate, update on table public.payroll_line_items to service_role;
grant delete, insert, maintain, references, select, trigger, truncate, update on table public.payroll_payslip_versions to service_role;
grant delete, insert, maintain, references, select, trigger, truncate, update on table public.payroll_payslips to service_role;
grant delete, insert, maintain, references, select, trigger, truncate, update on table public.payroll_v_confirmed to service_role;
grant delete, insert, maintain, references, select, trigger, truncate, update on table public.payroll_v_jaaropgave_nl to service_role;
grant delete, insert, maintain, references, select, trigger, truncate, update on table public.payroll_v_monthly to service_role;
grant delete, insert, maintain, references, select, trigger, truncate, update on table public.payroll_v_monthly_nl to service_role;
grant delete, insert, maintain, references, select, trigger, truncate, update on table public.payroll_v_queue to service_role;
grant delete, insert, maintain, references, select, trigger, truncate, update on table public.payroll_v_rate_history to service_role;
grant delete, insert, maintain, references, select, trigger, truncate, update on table public.payroll_v_ytd to service_role;
grant delete, insert, maintain, references, select, trigger, truncate, update on table public.payroll_validations to service_role;
grant delete, insert, select, update on table public.payroll_anomalies to authenticated;
grant delete, insert, select, update on table public.payroll_corrections to authenticated;
grant delete, insert, select, update on table public.payroll_documents to authenticated;
grant delete, insert, select, update on table public.payroll_employers to authenticated;
grant delete, insert, select, update on table public.payroll_events to authenticated;
grant delete, insert, select, update on table public.payroll_line_items to authenticated;
grant delete, insert, select, update on table public.payroll_payslip_versions to authenticated;
grant delete, insert, select, update on table public.payroll_payslips to authenticated;
grant delete, insert, select, update on table public.payroll_validations to authenticated;
grant select on table public.payroll_deductions to authenticated;
grant select on table public.payroll_hours to authenticated;
grant select on table public.payroll_income_items to authenticated;
grant select on table public.payroll_v_confirmed to authenticated;
grant select on table public.payroll_v_jaaropgave_nl to authenticated;
grant select on table public.payroll_v_monthly to authenticated;
grant select on table public.payroll_v_monthly_nl to authenticated;
grant select on table public.payroll_v_queue to authenticated;
grant select on table public.payroll_v_rate_history to authenticated;
grant select on table public.payroll_v_ytd to authenticated;
grant select, update, usage on sequence public.payroll_events_id_seq to anon;
grant select, update, usage on sequence public.payroll_events_id_seq to authenticated;
grant select, update, usage on sequence public.payroll_events_id_seq to service_role;
grant select, update, usage on sequence public.payroll_payslip_versions_id_seq to anon;
grant select, update, usage on sequence public.payroll_payslip_versions_id_seq to authenticated;
grant select, update, usage on sequence public.payroll_payslip_versions_id_seq to service_role;
revoke all on function public.payroll_apply_review(p_payslip_id uuid, p_changes jsonb, p_decision text, p_error_types jsonb, p_note text) from public, anon, authenticated;
revoke all on function public.payroll_ingest(p_document_id uuid, p_payload jsonb) from public, anon, authenticated;
revoke all on function public.payroll_mark_failed(p_document_id uuid, p_error_code text, p_error_message text, p_step text) from public, anon, authenticated;
revoke all on function public.payroll_num(p jsonb, k text) from public, anon, authenticated;
revoke all on function public.payroll_period_key(p_type text, p_year integer, p_num integer) from public, anon, authenticated;
revoke all on function public.payroll_periods_per_year(p_type text, p_year integer) from public, anon, authenticated;
revoke all on function public.payroll_register_document(p_user_id uuid, p_sha256 text, p_file_name text, p_source text, p_source_ref text, p_mime text, p_size bigint, p_storage_path_raw text) from public, anon, authenticated;
revoke all on function public.payroll_retry_queue(p_max_attempts integer) from public, anon, authenticated;
revoke all on function public.payroll_set_classification(p_document_id uuid, p_doc_class text, p_confidence numeric, p_text_method text) from public, anon, authenticated;
revoke all on function public.payroll_snapshot_payslip() from public, anon, authenticated;
revoke all on function public.payroll_touch_updated_at() from public, anon, authenticated;
grant execute on function public.payroll_apply_review(p_payslip_id uuid, p_changes jsonb, p_decision text, p_error_types jsonb, p_note text) to authenticated;
grant execute on function public.payroll_apply_review(p_payslip_id uuid, p_changes jsonb, p_decision text, p_error_types jsonb, p_note text) to service_role;
grant execute on function public.payroll_ingest(p_document_id uuid, p_payload jsonb) to service_role;
grant execute on function public.payroll_mark_failed(p_document_id uuid, p_error_code text, p_error_message text, p_step text) to service_role;
grant execute on function public.payroll_num(p jsonb, k text) to anon;
grant execute on function public.payroll_num(p jsonb, k text) to authenticated;
grant execute on function public.payroll_num(p jsonb, k text) to public;
grant execute on function public.payroll_num(p jsonb, k text) to service_role;
grant execute on function public.payroll_period_key(p_type text, p_year integer, p_num integer) to anon;
grant execute on function public.payroll_period_key(p_type text, p_year integer, p_num integer) to authenticated;
grant execute on function public.payroll_period_key(p_type text, p_year integer, p_num integer) to public;
grant execute on function public.payroll_period_key(p_type text, p_year integer, p_num integer) to service_role;
grant execute on function public.payroll_periods_per_year(p_type text, p_year integer) to anon;
grant execute on function public.payroll_periods_per_year(p_type text, p_year integer) to authenticated;
grant execute on function public.payroll_periods_per_year(p_type text, p_year integer) to public;
grant execute on function public.payroll_periods_per_year(p_type text, p_year integer) to service_role;
grant execute on function public.payroll_register_document(p_user_id uuid, p_sha256 text, p_file_name text, p_source text, p_source_ref text, p_mime text, p_size bigint, p_storage_path_raw text) to service_role;
grant execute on function public.payroll_retry_queue(p_max_attempts integer) to service_role;
grant execute on function public.payroll_set_classification(p_document_id uuid, p_doc_class text, p_confidence numeric, p_text_method text) to service_role;
grant execute on function public.payroll_snapshot_payslip() to service_role;
grant execute on function public.payroll_touch_updated_at() to service_role;

-- 9. Bucket privado de Storage
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values ('payroll', 'payroll', false, 20971520, '{application/pdf,image/jpeg,image/png,image/heic}'::text[]) on conflict (id) do nothing;

-- 10. Realtime
do $r$ begin if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='payroll_anomalies') then alter publication supabase_realtime add table public.payroll_anomalies; end if; end $r$;
do $r$ begin if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='payroll_documents') then alter publication supabase_realtime add table public.payroll_documents; end if; end $r$;
do $r$ begin if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='payroll_events') then alter publication supabase_realtime add table public.payroll_events; end if; end $r$;
do $r$ begin if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='payroll_payslips') then alter publication supabase_realtime add table public.payroll_payslips; end if; end $r$;

commit;
