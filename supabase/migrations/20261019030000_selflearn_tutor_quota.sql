-- Apply to preview Supabase only after review. Not executed by this PR.
-- Atomic quota, one authenticated user per row, 12 AI requests/day UTC.
create table if not exists public.selflearn_tutor_quota (
  owner_id uuid not null references auth.users(id) on delete cascade,
  quota_day date not null,
  requests integer not null default 0 check (requests between 0 and 12),
  primary key (owner_id, quota_day)
);
alter table public.selflearn_tutor_quota enable row level security;
revoke all on public.selflearn_tutor_quota from anon, authenticated;
create or replace function public.selflearn_tutor_take_quota()
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller uuid := auth.uid();
  taken integer;
begin
  if caller is null then return false; end if;
  insert into public.selflearn_tutor_quota(owner_id,quota_day,requests)
  values(caller,(now() at time zone 'utc')::date,1)
  on conflict(owner_id,quota_day) do update
  set requests = public.selflearn_tutor_quota.requests + 1
  where public.selflearn_tutor_quota.requests < 12
  returning requests into taken;
  return taken is not null;
end;
$$;
revoke all on function public.selflearn_tutor_take_quota() from public, anon;
grant execute on function public.selflearn_tutor_take_quota() to authenticated;
comment on function public.selflearn_tutor_take_quota() is 'Atomically consumes one of 12 daily AI tutor requests for auth.uid(); no client-supplied owner.';
