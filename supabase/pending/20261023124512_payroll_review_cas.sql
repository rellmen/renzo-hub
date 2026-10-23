-- Pending: additive Nocturne entry point. Classic keeps its existing RPC.
-- SECURITY INVOKER preserves table RLS and the original correction/event triggers.
begin;
create or replace function public.payroll_apply_review_cas(
 p_payslip_id uuid,
 p_expected_updated_at timestamptz,
 p_changes jsonb default '{}'::jsonb,
 p_decision text default 'approved',
 p_error_types jsonb default '{}'::jsonb,
 p_note text default null
) returns jsonb language plpgsql security invoker set search_path = '' as $$
declare
 ps public.payroll_payslips;
 result jsonb;
begin
 if auth.uid() is null then raise exception 'Authentication required' using errcode='42501'; end if;
 if p_expected_updated_at is null then raise exception 'Expected version required' using errcode='22023'; end if;
 if p_decision is null or p_decision not in ('approved','rejected') then
  raise exception 'Invalid review decision' using errcode='22023';
 end if;
 if jsonb_typeof(p_changes) is distinct from 'object' or jsonb_typeof(p_error_types) is distinct from 'object'
    or length(coalesce(p_note,'')) > 4000 then
  raise exception 'Invalid review payload' using errcode='22023';
 end if;
 if p_decision='rejected' and p_changes <> '{}'::jsonb then
  raise exception 'Rejection cannot change fields' using errcode='22023';
 end if;
 select * into ps from public.payroll_payslips
 where id=p_payslip_id and user_id=auth.uid() for update;
 if ps.id is null then raise exception 'Payslip not found' using errcode='42501'; end if;
 -- Check AFTER acquiring the lock, in the SAME transaction as all writes.
 if ps.updated_at is distinct from p_expected_updated_at or ps.review_status is distinct from 'pending' then
  raise exception 'Payroll changed; reload before reviewing' using errcode='40001';
 end if;
 result := public.payroll_apply_review(p_payslip_id,p_changes,p_decision,p_error_types,p_note);
 return result;
end;
$$;
revoke all on function public.payroll_apply_review_cas(uuid,timestamptz,jsonb,text,jsonb,text) from public,anon;
grant execute on function public.payroll_apply_review_cas(uuid,timestamptz,jsonb,text,jsonb,text) to authenticated;
commit;
