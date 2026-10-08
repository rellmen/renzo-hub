-- Called only by the existing server-side n8n Supabase credential.
create or replace function public.hub_financial_ingest(p_owner_id uuid, p_event jsonb)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare
 v_id uuid; v_existing public.hub_records; v_x jsonb; v_payload jsonb;
 v_type text; v_title text; v_date date; v_amount numeric; v_conf numeric;
 v_review boolean := false; v_reasons text[] := '{}'; v_key text; v_value numeric;
 v_week text; v_employer text; v_category text; v_record_type text; v_status text; v_inserted integer;
begin
 if jsonb_typeof(p_event) <> 'object' or length(p_event::text)>30000 then raise exception 'Invalid financial event'; end if;
 if coalesce(p_event->>'eventId','')='' then raise exception 'Stable eventId required'; end if;
 v_id := md5(p_owner_id::text || ':jarvis-finance:' || (p_event->>'eventId'))::uuid;
 select * into v_existing from public.hub_records where id=v_id and owner_id=p_owner_id;
 if found then return jsonb_build_object('ok',true,'id',v_id,'status','duplicate','originalStatus',v_existing.status,'message','Este documento ya estaba guardado. No se ha vuelto a sumar.'); end if;
 v_type := p_event->>'type';
 if v_type not in ('payslip','expense','receipt') or v_type is null then raise exception 'Not a supported financial document'; end if;
 v_x := coalesce(p_event->'extracted','{}'::jsonb);
 if jsonb_typeof(v_x)<>'object' then raise exception 'Extracted fields must be an object'; end if;
 v_title := left(coalesce(nullif(p_event->>'title',''),'Documento de Jarvis'),180);
 begin v_date := nullif(p_event->>'date','')::date; exception when others then v_date := null; end;
 if v_date is null then v_review:=true; v_reasons:=array_append(v_reasons,'Falta una fecha válida'); v_date:=(now() at time zone 'Europe/Amsterdam')::date; end if;
 begin v_conf := (p_event->>'confidence')::numeric; exception when others then v_conf:=null; end;
 if v_conf is null or v_conf<0.90 or v_conf>1 then v_review:=true; v_reasons:=array_append(v_reasons,'Extracción con confianza insuficiente'); end if;
 v_conf:=greatest(0,least(1,coalesce(v_conf,0)));
 if coalesce(v_x->>'currency','EUR')<>'EUR' then v_review:=true; v_reasons:=array_append(v_reasons,'Moneda distinta de EUR'); end if;
 -- Preserve null instead of inventing zero for missing values.
 foreach v_key in array array['amount','net','gross','baseHours','overtimeHours','overtimeIncome','allowances','shiftAllowance','travelAllowance','bonus','holidayPay','deductions','tax','pension','fuel','litres','pricePerLitre'] loop
  begin v_value:=nullif(v_x->>v_key,'')::numeric; exception when others then v_value:=null; end;
  if v_value is not null and abs(v_value)>1000000 then v_review:=true; v_reasons:=array_append(v_reasons,'Importe fuera de rango: '||v_key); v_value:=null; end if;
  v_x:=jsonb_set(v_x,array[v_key],coalesce(to_jsonb(round(v_value,2)),'null'::jsonb));
 end loop;
 v_amount:=(v_x->>(case when v_type='payslip' then 'net' else 'amount' end))::numeric;
 if v_amount is null or v_amount<=0 then v_review:=true; v_reasons:=array_append(v_reasons,'Falta un importe positivo'); end if;
 v_category:=case when v_type='payslip' then 'Salary' when lower(coalesce(v_x->>'expenseCategory','')) in ('car','fuel','gasolina') or lower(coalesce(v_x->>'category','')) in ('car','fuel','gasolina') then 'Car' else coalesce(nullif(v_x->>'category',''),'Other') end;
 if v_type='payslip' then
  v_week:=v_x->>'payWeek'; v_employer:=lower(trim(v_x->>'employer'));
  if v_week is null or v_week !~ '^20[0-9]{2}-W(0[1-9]|[1-4][0-9]|5[0-3])$' or coalesce(v_employer,'')='' or (v_x->>'gross')::numeric is null then
   v_review:=true; v_reasons:=array_append(v_reasons,'Falta bruto, empresa o semana de nómina');
  end if;
  select * into v_existing from public.hub_records where owner_id=p_owner_id and record_type='renzo_money' and payload->>'kind'='payslip' and payload->>'payWeek'=v_week and lower(trim(payload->>'employer'))=v_employer limit 1;
  if found then
   if v_existing.payload->>'gross'=v_x->>'gross' and (v_existing.payload->>'net')::numeric=v_amount then
    return jsonb_build_object('ok',true,'id',v_existing.id,'status','duplicate','message','Esa nómina semanal ya estaba registrada. No se ha vuelto a sumar.');
   end if;
   v_review:=true; v_reasons:=array_append(v_reasons,'Ya hay una nómina de esta empresa y semana con otros importes: revisar posible corrección');
  end if;
 end if;
 if coalesce(p_event->>'needsReview','false')='true' then v_review:=true; v_reasons:=array_append(v_reasons,'El documento necesita revisión'); end if;
 v_payload:=v_x || jsonb_build_object('id',v_id,'kind',case when v_type='payslip' then 'payslip' else 'expense' end,'title',v_title,'amount',v_amount,'date',v_date,'period',to_char(v_date,'YYYY-MM'),'category',v_category,'expenseCategory',case when v_category='Car' then 'car' else v_x->>'expenseCategory' end,'note',left(coalesce(p_event->>'note',''),2000),'source','jarvis','reviewed',not v_review,'importedConfidence',v_conf,'eventId',p_event->>'eventId','attachment',p_event->'attachment','dateBasis',p_event->>'dateBasis');
 if v_review then
  v_record_type:='renzo_inbox'; v_status:='needs_review';
  v_payload:=jsonb_build_object('id',v_id,'title',v_title,'category',v_type,'date',v_date,'source','jarvis','note',left(coalesce(p_event->>'note',''),2000),'status',v_status,'requiresReview',true,'confidence',v_conf,'reviewReason',array_to_string(v_reasons,' · '),'extracted',v_payload,'attachment',p_event->'attachment');
 else v_record_type:='renzo_money'; v_status:='active'; end if;
 insert into public.hub_records(id,owner_id,domain,record_type,title,status,occurred_at,payload,source,confidence,requires_review)
 values(v_id,p_owner_id,'money',v_record_type,v_title,v_status,v_date::timestamp at time zone 'Europe/Amsterdam',v_payload,'automation',v_conf,v_review)
 on conflict(id) do nothing;
 get diagnostics v_inserted=row_count;
 return jsonb_build_object('ok',true,'id',v_id,'status',case when v_inserted=0 then 'duplicate' when v_review then 'needs_review' else 'saved_to_money' end,'type',v_type,'title',v_title,'amount',v_amount,'payWeek',v_week,'reasons',v_reasons,'message',case when v_inserted=0 then 'Ya guardado; no se ha duplicado.' when v_review then 'Guardado en Renzo Hub, Money → Pendientes. Aún no suma a los totales: '||array_to_string(v_reasons,' · ') else 'Guardado en Renzo Hub → Money'||case when v_category='Car' then ' y Car.' else '.' end end);
end; $$;
revoke all on function public.hub_financial_ingest(uuid,jsonb) from public,anon,authenticated;
grant execute on function public.hub_financial_ingest(uuid,jsonb) to service_role;
