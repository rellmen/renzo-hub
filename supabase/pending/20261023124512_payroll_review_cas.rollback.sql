-- Disable the Nocturne review flag before rollback. No data is removed.
begin;
drop function if exists public.payroll_apply_review_cas(uuid,timestamptz,jsonb,text,jsonb,text);
commit;
