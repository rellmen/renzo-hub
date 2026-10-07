revoke all privileges on table public.hub_records from anon, public, authenticated;
grant select, insert, update, delete on table public.hub_records to authenticated;
