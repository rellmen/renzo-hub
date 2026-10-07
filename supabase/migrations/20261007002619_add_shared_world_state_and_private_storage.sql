create table if not exists public.hub_user_state (
  owner_id uuid primary key references auth.users(id) on delete cascade,
  state jsonb not null default '{}'::jsonb check (jsonb_typeof(state) = 'object'),
  updated_at timestamptz not null default now()
);

alter table public.hub_user_state enable row level security;
revoke all privileges on table public.hub_user_state from anon, public, authenticated;
grant select, insert, update, delete on table public.hub_user_state to authenticated;

create policy hub_user_state_select_own
  on public.hub_user_state for select to authenticated
  using (owner_id = (select auth.uid()));
create policy hub_user_state_insert_own
  on public.hub_user_state for insert to authenticated
  with check (owner_id = (select auth.uid()));
create policy hub_user_state_update_own
  on public.hub_user_state for update to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));
create policy hub_user_state_delete_own
  on public.hub_user_state for delete to authenticated
  using (owner_id = (select auth.uid()));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'hub-private',
  'hub-private',
  false,
  10485760,
  array['image/jpeg','image/png','image/webp','application/pdf','text/plain',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
)
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create policy hub_private_select_own
  on storage.objects for select to authenticated
  using (bucket_id = 'hub-private' and (storage.foldername(name))[1] = (select auth.uid()::text));
create policy hub_private_insert_own
  on storage.objects for insert to authenticated
  with check (bucket_id = 'hub-private' and (storage.foldername(name))[1] = (select auth.uid()::text));
create policy hub_private_update_own
  on storage.objects for update to authenticated
  using (bucket_id = 'hub-private' and (storage.foldername(name))[1] = (select auth.uid()::text))
  with check (bucket_id = 'hub-private' and (storage.foldername(name))[1] = (select auth.uid()::text));
create policy hub_private_delete_own
  on storage.objects for delete to authenticated
  using (bucket_id = 'hub-private' and (storage.foldername(name))[1] = (select auth.uid()::text));
