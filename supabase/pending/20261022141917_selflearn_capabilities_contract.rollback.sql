-- Removes only the read-only probe. Does not alter any user records.
begin;
drop function if exists public.selflearn_capabilities();
commit;
