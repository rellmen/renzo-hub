-- STAGING ONLY. Existing staging owner, synthetic request, complete rollback.
begin;
do $test$
declare
 me uuid; foreign_owner uuid := gen_random_uuid();
 request_id uuid := gen_random_uuid();
 original_stamp timestamptz; changed integer;
begin
 select owner_id into me from public.hub_user_state order by owner_id limit 1;
 if me is null then raise exception 'No existing staging owner'; end if;
 perform set_config('request.jwt.claims',json_build_object('sub',me,'role','authenticated')::text,true);
 execute 'set local role authenticated';
 insert into public.hub_records(id,owner_id,domain,record_type,title,status,payload,source,requires_review)
 values(request_id,me,'system','ares_operation','Migration isolated transaction test','pending_approval',
 '{"agent":"Jarvis","details":"synthetic staging fixture","executed":false}'::jsonb,'manual',true);
 select updated_at into original_stamp from public.hub_records where id=request_id;
 update public.hub_records set status='approved',requires_review=false,
 payload=payload||'{"executed":false,"executionStatus":"not_connected","approvedBy":"owner"}'::jsonb
 where id=request_id and owner_id=me and record_type='ares_operation' and domain='system'
 and status='pending_approval' and updated_at=original_stamp;
 get diagnostics changed=row_count;
 if changed<>1 then raise exception 'Owner review failed'; end if;
 update public.hub_records set status='rejected' where id=request_id and owner_id=me
 and status='pending_approval' and updated_at=original_stamp;
 get diagnostics changed=row_count;
 if changed<>0 then raise exception 'Stale review unexpectedly succeeded'; end if;
 perform set_config('request.jwt.claims',json_build_object('sub',foreign_owner,'role','authenticated')::text,true);
 if exists(select 1 from public.hub_records where id=request_id) then raise exception 'RLS exposed another owner'; end if;
 update public.hub_records set status='rejected' where id=request_id;
 get diagnostics changed=row_count;
 if changed<>0 then raise exception 'RLS allowed another owner write'; end if;
end $test$;
rollback;
select 'PASS staging DB role test: owner review, stale guard, other-owner read/write denied; transaction rolled back' as result;
