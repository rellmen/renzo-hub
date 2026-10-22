-- PENDING: approval + authenticated staging QA required. Never apply to production.
-- Invoker functions retain existing owner RLS. No history rewrite or new tables.
begin;
create function public.selflearn_course(p jsonb) returns text language sql immutable set search_path='' as $$
 select case when p->>'course' in ('nl','en') then p->>'course'
 when p->>'area'='English' or p->>'courseLessonId' like 'en-%' then 'en' else 'nl' end
$$;
create function public.selflearn_unit(p jsonb) returns text language sql immutable set search_path='' as $$
 select case when p->>'practice'='Study path' and p->>'passed' is distinct from 'false' and p->>'courseLessonId' is not null then p->>'courseLessonId'
 when p->>'practice' in ('Daily lesson','Study path') and p->>'courseLessonId' is null and p->>'lessonDay' ~ '^[0-9]+$'
 then 'a1-legacy-'||(p->>'lessonDay')::int::text end
$$;
create function public.selflearn_word(p text) returns text language sql immutable set search_path='' as $$
 select trim(regexp_replace(regexp_replace(lower(translate(regexp_replace(normalize(p,NFD),U&'[\0300-\036f]','','g'),'’`´', repeat(chr(39),3))), '[^[:alnum:]'' ]',' ','g'),' +',' ','g'))
$$;
-- Serializes both old random-ID clients and the React RPC, including new checkpoints.
-- This is not an anti-cheat system: existing clients own their private learning data.
create function public.selflearn_guard_records() returns trigger language plpgsql security invoker set search_path='' as $$
declare u text; c text; prior jsonb;
begin
 if tg_op='UPDATE' and old.record_type='renzo_event' and old.payload->>'kind'='learning' and public.selflearn_unit(old.payload) is not null then
  if (new.id,new.owner_id,new.record_type,new.payload->>'kind',public.selflearn_unit(new.payload),public.selflearn_course(new.payload),new.payload->'xp') is distinct from
     (old.id,old.owner_id,old.record_type,old.payload->>'kind',public.selflearn_unit(old.payload),public.selflearn_course(old.payload),old.payload->'xp') then
   raise exception 'La acreditación existente es inmutable';end if;
 end if;
 if new.record_type not in ('learning_run','renzo_event','renzo_vocabulary') then return new; end if;
 if current_setting('transaction_isolation')<>'read committed' then raise exception 'SelfLearn requiere READ COMMITTED';end if;
 if new.owner_id is distinct from auth.uid() then raise exception 'Propietario inválido'; end if;
 perform pg_advisory_xact_lock(hashtextextended('selflearn:'||new.owner_id::text,0));
 if new.record_type='renzo_event' and new.payload->>'kind'='learning' then
  u:=public.selflearn_unit(new.payload);c:=public.selflearn_course(new.payload);
  if tg_op='UPDATE' and public.selflearn_unit(old.payload) is not null then
   if (new.owner_id,new.record_type,u,c,new.payload->'xp') is distinct from
      (old.owner_id,old.record_type,public.selflearn_unit(old.payload),public.selflearn_course(old.payload),old.payload->'xp') then
    raise exception 'La acreditación existente es inmutable';
   end if;
  elsif tg_op='INSERT' and u is not null and exists(select 1 from public.hub_records where id=new.id and owner_id=new.owner_id) then
   select payload into prior from public.hub_records where id=new.id and owner_id=new.owner_id;
   if (public.selflearn_unit(prior),public.selflearn_course(prior)) is distinct from (u,c) then raise exception 'La acreditación existente es inmutable';end if;
   if prior ? 'xp' then new.payload:=jsonb_set(new.payload,'{xp}',prior->'xp');else new.payload:=new.payload-'xp';end if;
  elsif u is not null and exists(select 1 from public.hub_records r where r.owner_id=new.owner_id
   and r.id<>new.id and r.record_type='renzo_event' and r.payload->>'kind'='learning'
   and public.selflearn_course(r.payload)=c and public.selflearn_unit(r.payload)=u) then
   new.payload:=jsonb_set(new.payload,'{xp}','0'::jsonb);
  end if;
 elsif new.record_type='renzo_vocabulary' then
  if tg_op='INSERT' and not exists(select 1 from public.hub_records where id=new.id and owner_id=new.owner_id) and exists(select 1 from public.hub_records r where r.owner_id=new.owner_id and r.id<>new.id
    and r.record_type='renzo_vocabulary' and public.selflearn_course(r.payload)=public.selflearn_course(new.payload)
    and public.selflearn_word(r.payload->>'front')=public.selflearn_word(new.payload->>'front')) then
   return null; -- old offline clients may replay random IDs; keep the existing FSRS row.
  end if;
  if tg_op='UPDATE' and coalesce((new.payload->>'repetitions')::int,0)<coalesce((old.payload->>'repetitions')::int,0) then
   raise exception 'La tarjeta cambió en otro dispositivo';end if;
  if tg_op='UPDATE' and old.payload->'fsrsCard' is distinct from new.payload->'fsrsCard' and
    coalesce((new.payload->>'repetitions')::int,0)<=coalesce((old.payload->>'repetitions')::int,0) and not coalesce((
      -- Classic lesson mistakes may only bring an existing due date forward.
      new.payload->'fsrsCard' is not null and new.payload->'fsrsCard'<>'null'::jsonb
      and (new.payload->'fsrsCard')-'due'=(old.payload->'fsrsCard')-'due'
      and (new.payload->'fsrsCard'->>'due')::timestamptz <= (old.payload->'fsrsCard'->>'due')::timestamptz
      and new.payload-array['fsrsCard','nextReview','updatedAt']=old.payload-array['fsrsCard','nextReview','updatedAt']
    ),false) then
   raise exception 'La tarjeta cambió en otro dispositivo';
  end if;
 end if;
 return new;
end;
$$;
create trigger selflearn_guard_records before insert or update on public.hub_records
 for each row execute function public.selflearn_guard_records();

create function public.selflearn_finalize_lesson(p_checkpoint uuid,p_event jsonb,p_cards jsonb)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare me uuid:=auth.uid(); cp jsonb; r jsonb; s jsonb; card jsonb; unit text; course text;
 n int:=0; correct int:=0; added int:=0; wrote int; eid uuid; awarded int; existing uuid;
begin
 if me is null then raise exception 'Inicia sesión'; end if;
 perform pg_advisory_xact_lock(hashtextextended('selflearn:'||me::text,0));
 select payload into cp from public.hub_records where id=p_checkpoint and owner_id=me and domain='learning' and record_type='learning_run';
 if cp is null then raise exception 'Checkpoint no disponible para este propietario'; end if;
 r:=cp->'run';unit:=r->>'unitId';course:=r->>'course';
 if r->>'version'<>'2' or r->>'mode'<>'lesson' or course not in ('nl','en') or unit is null
  or jsonb_typeof(r->'steps')<>'array' or jsonb_typeof(r->'queue')<>'array'
  or jsonb_array_length(r->'steps') not between 1 and 250
  or (r->>'index')::int<>jsonb_array_length(r->'queue') then raise exception 'Lección incompleta'; end if;
 if exists(select 1 from public.hub_records newer join public.hub_records saved on saved.id=p_checkpoint
  where newer.owner_id=me and newer.record_type='learning_run' and newer.domain='learning'
  and newer.payload->>'sessionId'=cp->>'sessionId' and newer.id<>p_checkpoint
  and (newer.created_at,newer.id)>(saved.created_at,saved.id)) then raise exception 'El checkpoint ha cambiado'; end if;
 if exists(select 1 from public.hub_user_state where owner_id=me and state->'learningRuns'->course is not null
  and state->'learningRuns'->course<>'null'::jsonb) then raise exception 'Hay una sesión clásica activa'; end if;
 for s in select value from jsonb_array_elements(r->'steps') loop
  if s->>'type' in ('choice','listen','gap','build','type','dialogue','match') then
   if jsonb_typeof(r->'firstTry'->(s->>'id')) is distinct from 'boolean'
     or coalesce((r->'attempts'->>(s->>'id'))::int,0)<1 then raise exception 'Faltan respuestas'; end if;
   n:=n+1;if r->'firstTry'->(s->>'id')='true'::jsonb then correct:=correct+1;end if;
  end if;
 end loop;
 if n=0 or p_event->>'owner_id' is distinct from me::text or jsonb_typeof(p_cards)<>'array'
  or jsonb_array_length(p_cards)>100 or p_event->'payload'->>'kind' is distinct from 'learning'
  or p_event->'payload'->>'practice' is distinct from 'Study path'
  or p_event->'payload'->>'passed' is distinct from 'true'
  or p_event->'payload'->>'course' is distinct from course
  or p_event->'payload'->>'courseLessonId' is distinct from unit
  or (p_event->'payload'->>'score')::int is distinct from correct
  or (p_event->'payload'->>'totalQuestions')::int is distinct from n
  or (p_event->'payload'->>'xp')::int is distinct from correct*10 then raise exception 'Acreditación inválida'; end if;
 select id into existing from public.hub_records where owner_id=me and record_type='renzo_event'
  and payload->>'kind'='learning' and public.selflearn_course(payload)=course and public.selflearn_unit(payload)=unit limit 1;
 if existing is not null then return jsonb_build_object('already',true,'xp',0,'addedCards',0,'unitId',unit); end if;
 eid:=(p_event->>'id')::uuid;
 insert into public.hub_records(id,owner_id,domain,record_type,title,status,payload)
 values(eid,me,'system','renzo_event',p_event->'payload'->>'title','active',p_event->'payload') returning (payload->>'xp')::int into awarded;
 for card in select value from jsonb_array_elements(p_cards) loop
  if card->>'owner_id' is distinct from me::text or card->'payload'->>'course' is distinct from course
    or card->'payload'->>'unitId' is distinct from unit or nullif(card->'payload'->>'front','') is null
    or nullif(card->'payload'->>'back','') is null or card->'payload' ? 'fsrsCard' then raise exception 'Tarjeta inválida';end if;
  insert into public.hub_records(id,owner_id,domain,record_type,title,status,payload)
   values((card->>'id')::uuid,me,'learning','renzo_vocabulary',card->'payload'->>'front','active',card->'payload') on conflict(id) do nothing;
  get diagnostics wrote=row_count;added:=added+wrote;
 end loop;
 return jsonb_build_object('already',false,'xp',awarded,'addedCards',added,'unitId',unit);
end;
$$;

create function public.selflearn_review_vocabulary(p_card uuid,p_expected_updated_at timestamptz,p_review uuid,p_payload jsonb,p_grade text)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare me uuid:=auth.uid(); old public.hub_records; previous jsonb;
begin
 if me is null then raise exception 'Inicia sesión';end if;
 perform pg_advisory_xact_lock(hashtextextended('selflearn:'||me::text,0));
 select * into old from public.hub_records where id=p_card and owner_id=me and record_type='renzo_vocabulary' for update;
 if old.id is null then raise exception 'Tarjeta no disponible para este propietario';end if;
 select payload into previous from public.hub_records where id=p_review and owner_id=me;
 if previous is not null then
  if previous->>'practice' is distinct from 'Vocabulary FSRS' or previous->>'cardId' is distinct from p_card::text then raise exception 'Identificador de repaso utilizado';end if;
  return jsonb_build_object('id',p_card,'reviewId',p_review,'repetitions',(previous->>'repetitions')::int);
 end if;
 if old.updated_at is distinct from p_expected_updated_at then raise exception 'La versión de la tarjeta ha cambiado';end if;
 if exists(select 1 from public.hub_user_state where owner_id=me and state->'learningRuns'->public.selflearn_course(old.payload) is not null
  and state->'learningRuns'->public.selflearn_course(old.payload)<>'null'::jsonb) then raise exception 'Hay una sesión clásica activa';end if;
 if p_grade not in ('again','hard','good','easy') or p_grade is null
  or (p_payload->>'repetitions')::int is distinct from coalesce((old.payload->>'repetitions')::int,0)+1
  or (p_payload - array['fsrsCard','nextReview','intervalDays','repetitions','lastReviewed','reviewHistory','updatedAt'])
   is distinct from (old.payload - array['fsrsCard','nextReview','intervalDays','repetitions','lastReviewed','reviewHistory','updatedAt'])
  or jsonb_typeof(p_payload->'fsrsCard') is distinct from 'object' then raise exception 'Repaso inválido';end if;
 update public.hub_records set payload=p_payload where id=p_card and owner_id=me;
 insert into public.hub_records(id,owner_id,domain,record_type,title,payload) values(p_review,me,'system','renzo_event','Repaso FSRS',
 jsonb_build_object('id',p_review,'kind','learning','practice','Vocabulary FSRS','stage','Review','cardId',p_card,
  'course',public.selflearn_course(old.payload),'area',old.payload->>'area','date',p_payload->>'lastReviewed',
  'grade',p_grade,'xp',0,'repetitions',(p_payload->>'repetitions')::int));
 return jsonb_build_object('id',p_card,'reviewId',p_review,'repetitions',(p_payload->>'repetitions')::int);
end;
$$;
revoke all on function public.selflearn_guard_records() from public,anon,authenticated;
revoke all on function public.selflearn_finalize_lesson(uuid,jsonb,jsonb) from public,anon;
revoke all on function public.selflearn_review_vocabulary(uuid,timestamptz,uuid,jsonb,text) from public,anon;
grant execute on function public.selflearn_finalize_lesson(uuid,jsonb,jsonb) to authenticated;
grant execute on function public.selflearn_review_vocabulary(uuid,timestamptz,uuid,jsonb,text) to authenticated;
commit;
