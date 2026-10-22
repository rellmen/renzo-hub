-- Applied staging MCP 20261022141917 and production MCP 20261022143229; authorized 22 Oct 2026.
begin;
-- Read-only contract probe. No user records or identifiers leave this function.
create function public.selflearn_capabilities() returns jsonb language sql stable security invoker set search_path='' as $$
 select jsonb_build_object('version',1,'ready',
  auth.uid() is not null
  and to_regprocedure('public.selflearn_finalize_lesson(uuid,jsonb,jsonb)') is not null
  and to_regprocedure('public.selflearn_review_vocabulary(uuid,timestamptz,uuid,jsonb,text)') is not null
  and exists(select 1 from pg_catalog.pg_trigger where tgrelid=to_regclass('public.hub_records')
    and tgname='selflearn_guard_records' and tgenabled='O')
  and (select relrowsecurity from pg_catalog.pg_class where oid=to_regclass('public.hub_records'))
  and (select relrowsecurity from pg_catalog.pg_class where oid=to_regclass('public.hub_user_state')))
$$;
revoke all on function public.selflearn_capabilities() from public,anon;
grant execute on function public.selflearn_capabilities() to authenticated;
commit;
