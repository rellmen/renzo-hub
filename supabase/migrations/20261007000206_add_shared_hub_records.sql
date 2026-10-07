create table public.hub_records (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  domain text not null check (domain in ('personal', 'work', 'body', 'money', 'learning', 'news', 'system')),
  record_type text not null check (record_type ~ '^[a-z][a-z0-9_]{0,63}$'),
  title text,
  status text,
  occurred_at timestamptz not null default now(),
  payload jsonb not null default '{}'::jsonb check (jsonb_typeof(payload) = 'object'),
  source text not null default 'manual' check (source in ('manual', 'capture', 'import', 'automation', 'ai_draft')),
  confidence numeric(4,3) check (confidence is null or (confidence >= 0 and confidence <= 1)),
  requires_review boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index hub_records_owner_domain_occurred_idx on public.hub_records (owner_id, domain, occurred_at desc);
create index hub_records_owner_type_occurred_idx on public.hub_records (owner_id, record_type, occurred_at desc);
alter table public.hub_records enable row level security;
revoke all on table public.hub_records from anon, public;
grant select, insert, update, delete on table public.hub_records to authenticated;
create policy hub_records_select_own on public.hub_records for select to authenticated using (owner_id = (select auth.uid()));
create policy hub_records_insert_own on public.hub_records for insert to authenticated with check (owner_id = (select auth.uid()));
create policy hub_records_update_own on public.hub_records for update to authenticated using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
create policy hub_records_delete_own on public.hub_records for delete to authenticated using (owner_id = (select auth.uid()));
create function public.set_hub_records_updated_at() returns trigger language plpgsql set search_path = '' as $$ begin new.updated_at := now(); return new; end; $$;
create trigger hub_records_set_updated_at before update on public.hub_records for each row execute function public.set_hub_records_updated_at();
