-- RISE HUB Nocturne cutover readiness · SAFE read-only metadata only.
-- Run against both staging and production, never copy rows/users between projects.
-- A single false value blocks the SelfLearn write-feature cutover.
with status as (
 select
  coalesce((select c.relrowsecurity from pg_class c where c.oid=to_regclass('public.hub_records')),false) as records_rls,
  coalesce((select c.relrowsecurity from pg_class c where c.oid=to_regclass('public.hub_user_state')),false) as state_rls,
  (select count(*)=4 from pg_policies where schemaname='public' and tablename='hub_records'
   and policyname in ('hub_records_select_own','hub_records_insert_own','hub_records_update_own','hub_records_delete_own')) as owner_policies,
  (to_regprocedure('public.selflearn_capabilities()') is not null) as capabilities_rpc,
  (to_regprocedure('public.selflearn_finalize_lesson(uuid,jsonb,jsonb)') is not null) as lesson_rpc,
  (to_regprocedure('public.selflearn_review_vocabulary(uuid,timestamptz,uuid,jsonb,text)') is not null) as review_rpc,
  (select exists(select 1 from pg_trigger where tgrelid=to_regclass('public.hub_records')
   and tgname='selflearn_guard_records' and tgenabled='O')) as immutable_trigger
)
select 'hub_records row-level security' as prerequisite,records_rls as ready from status
union all select 'hub_user_state row-level security',state_rls from status
union all select 'hub_records four owner policies',owner_policies from status
union all select 'SelfLearn capability contract exists',capabilities_rpc from status
union all select 'SelfLearn lesson RPC exists',lesson_rpc from status
union all select 'SelfLearn review RPC exists',review_rpc from status
union all select 'SelfLearn guard trigger enabled',immutable_trigger from status
order by prerequisite;
