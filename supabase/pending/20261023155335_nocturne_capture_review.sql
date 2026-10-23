-- Nocturne-only, staged before production. Capture review is one RLS transaction.
create or replace function public.nocturne_review_capture(p_capture uuid,p_expected_updated_at timestamptz)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare
 v_uid uuid := auth.uid(); v_row public.hub_records; v_status text; v_category text;
 v_event uuid; v_existing uuid; v_now timestamptz := clock_timestamp();
 v_money uuid; v_x jsonb; v_amount numeric; v_date date; v_money_category text;
begin
 if v_uid is null then raise exception 'Authentication required' using errcode='42501'; end if;
 if p_expected_updated_at is null then raise exception 'Capture version required' using errcode='22023'; end if;
 select * into v_row from public.hub_records where id=p_capture and owner_id=v_uid and record_type='renzo_inbox' for update;
 if not found then raise exception 'Capture not found' using errcode='42501'; end if;
 if v_row.updated_at<>p_expected_updated_at then raise exception 'Capture changed in another session. Refresh before reviewing.' using errcode='40001'; end if;
 v_status:=coalesce(v_row.payload->>'status',v_row.status,'needs_review');
 if v_status<>'needs_review' then raise exception 'Capture is not pending' using errcode='22023'; end if;
 v_category:=lower(coalesce(v_row.payload->>'category',''));
 -- Monetary extraction needs its own reviewed ledger flow. In particular never
 -- create salary from a capture in parallel with payroll PDF/bank salary.
 if v_category in ('expense','receipt','payslip','income','invoice','money') then
  if v_category not in ('expense','receipt') or coalesce(v_row.payload->>'source','')<>'jarvis' then
   raise exception 'Financial document requires Money or Payroll review' using errcode='22023';
  end if;
  v_x:=v_row.payload->'extracted';
  if jsonb_typeof(v_x) is distinct from 'object' or coalesce(v_x->>'currency','EUR')<>'EUR' then
   raise exception 'Expense requires valid extracted EUR fields' using errcode='22023';
  end if;
  begin
   v_amount:=(v_x->>'amount')::numeric;
   v_date:=(v_row.payload->>'date')::date;
  exception when others then raise exception 'Expense requires valid amount and date' using errcode='22023'; end;
  if v_amount is null or v_amount<=0 or v_amount>1000000 or v_amount='NaN'::numeric or v_date is null then
   raise exception 'Expense requires valid amount and date' using errcode='22023';
  end if;
  v_money_category:=case when lower(coalesce(v_x->>'expenseCategory',''))='car' or v_x->>'category'='Car' then 'Car' else coalesce(nullif(v_x->>'category',''),'Other') end;
  v_money:=md5(v_uid::text||':nocturne-capture-expense:'||p_capture::text)::uuid;
  select id into v_existing from public.hub_records where owner_id=v_uid and record_type='renzo_money'
   and payload->>'sourceInboxId'=p_capture::text limit 1;
  if v_existing is null then
   insert into public.hub_records(id,owner_id,domain,record_type,title,status,occurred_at,payload,source,requires_review)
   values(v_money,v_uid,'money','renzo_money',v_row.title,'active',v_date::timestamp at time zone 'Europe/Amsterdam',
    jsonb_build_object('id',v_money,'kind','expense','title',v_row.title,'amount',round(v_amount,2),'date',v_date,
     'category',v_money_category,'expenseCategory',case when v_money_category='Car' then 'car' else v_x->>'expenseCategory' end,
     'note',v_row.payload->>'note','source','jarvis','reviewed',true,'sourceInboxId',p_capture,
     'attachment',v_row.payload->'attachment'),'manual',false);
  end if;
 end if;
 v_event:=md5(v_uid::text||':nocturne-capture-review:'||p_capture::text)::uuid;
 -- Preserve an event already emitted by Classic before an archived item was restored.
 select id into v_existing from public.hub_records where owner_id=v_uid and record_type='renzo_event'
  and payload->>'sourceInboxId'=p_capture::text limit 1;
 if v_existing is null then
  insert into public.hub_records(id,owner_id,domain,record_type,title,status,occurred_at,payload,source,requires_review)
  values(v_event,v_uid,'system','renzo_event',v_row.title,'active',v_now,
   jsonb_build_object('id',v_event,'kind','capture','title',v_row.title,'category',v_row.payload->>'category',
    'date',(v_now at time zone 'Europe/Amsterdam')::date,'source','capture','sourceInboxId',p_capture,
    'attachment',v_row.payload->'attachment'),'capture',false);
 end if;
 update public.hub_records set status='reviewed',requires_review=false,
  payload=v_row.payload||jsonb_build_object('status','reviewed','requiresReview',false,'reviewedAt',v_now)
  where id=p_capture and owner_id=v_uid;
 return jsonb_build_object('ok',true,'id',p_capture,'status','reviewed');
end;
$$;
revoke all on function public.nocturne_review_capture(uuid,timestamptz) from public,anon;
grant execute on function public.nocturne_review_capture(uuid,timestamptz) to authenticated;
