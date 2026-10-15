-- STAGING QA rollback only, after removing the exact QA imports. Never discard real imports.
begin;
do $$ begin
 if exists(select 1 from public.payroll_balance_imports) then raise exception 'Rollback bloqueado: conserva los saldos importados; elimina solo QA autorizada antes.'; end if;
end $$;
drop trigger payroll_leave_cutoff_guard on public.hub_records;
drop function public.payroll_leave_cutoff_guard();
drop function public.payroll_import_balances(uuid,timestamptz,integer,integer,boolean,text);
drop table public.payroll_balance_imports;
drop function public.payroll_balance_import_guard();
commit;
