-- RISE HUB Academia +25 · simulacros originales con cronómetro y corrección en servidor (aditiva).
-- Requiere 20261024090000_academy_foundation.sql. Aplicar primero en staging; producción solo con autorización expresa de Renzo.
-- Rollback: 20261024200000_academy_mocks.rollback.sql (elimina solo objetos academy_mock_* y restaura el valor por defecto de elective).
-- Claves, soluciones y rúbricas: public.academy_mock_items, sin acceso para anon/authenticated. Se devuelven solo tras entregar.
begin;

create table public.academy_mock_defs(
  mock_id text primary key check (mock_id ~ '^[a-z0-9-]{3,64}$'),
  course text not null check (course in ('matematicas','economia','castellano','comentario','ingles','fisica')),
  title text not null check (length(title)<=200),
  duration_minutes integer not null check (duration_minutes between 10 and 240),
  structure jsonb not null check (jsonb_typeof(structure)='object' and jsonb_typeof(structure->'sections')='array'),
  content_version integer not null default 1 check (content_version>=1),
  updated_at timestamptz not null default now()
);
alter table public.academy_mock_defs enable row level security;
revoke all on public.academy_mock_defs from public, anon, authenticated;

create table public.academy_mock_items(
  mock_id text not null references public.academy_mock_defs(mock_id) on delete cascade,
  item_id text not null check (item_id ~ '^[a-z0-9-]{1,40}$'),
  kind text not null check (kind in ('multiple_choice','numeric','short_text','open')),
  key jsonb not null default '{}'::jsonb check (jsonb_typeof(key)='object'),
  points numeric not null check (points>0 and points<=10),
  wrong_penalty numeric not null default 0 check (wrong_penalty>=0 and wrong_penalty<=10),
  solution_md text not null default '' check (length(solution_md)<=6000),
  rubric_md text not null default '' check (length(rubric_md)<=6000),
  primary key(mock_id,item_id)
);
alter table public.academy_mock_items enable row level security;
revoke all on public.academy_mock_items from public, anon, authenticated;

create table public.academy_mock_sessions(
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  client_session_id uuid not null,
  mock_id text not null references public.academy_mock_defs(mock_id) on delete cascade,
  course text not null,
  content_version integer not null,
  duration_minutes integer not null,
  started_at timestamptz not null default now(),
  deadline_at timestamptz not null,
  status text not null default 'in_progress' check (status in ('in_progress','submitted','graded')),
  answers jsonb not null default '{}'::jsonb check (jsonb_typeof(answers)='object' and pg_column_size(answers)<=60000),
  chosen jsonb not null default '{}'::jsonb check (jsonb_typeof(chosen)='object' and pg_column_size(chosen)<=4000),
  revision integer not null default 1 check (revision>=1),
  submitted_at timestamptz,
  late_answers_ignored boolean not null default false,
  auto_score numeric,
  result jsonb,
  self_scores jsonb,
  total_score numeric check (total_score between 0 and 10),
  graded_at timestamptz,
  updated_at timestamptz not null default now(),
  unique(user_id,client_session_id)
);
create unique index academy_mock_one_active on public.academy_mock_sessions(user_id) where status='in_progress';
create index academy_mock_sessions_user_time on public.academy_mock_sessions(user_id,started_at desc);
alter table public.academy_mock_sessions enable row level security;
revoke all on public.academy_mock_sessions from public, anon, authenticated;
grant select on public.academy_mock_sessions to authenticated;
create policy academy_mock_sessions_own_select on public.academy_mock_sessions for select to authenticated using (user_id=(select auth.uid()));
-- Sin insert/update para el cliente: todo cambio pasa por las funciones de abajo.

-- Números con notación científica: 1,6e-13 · 1,6·10^-13 · 1,6x10-13 · 1,6·10⁻¹³ (y todo lo que acepta academy_parse_number).
create function public.academy_parse_sci(t text) returns numeric language plpgsql immutable set search_path='' as $$
declare s text; m text[]; base numeric; ex int;
begin
  s:=translate(coalesce(t,''),'⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺−','0123456789-+-');
  s:=regexp_replace(s,'[[:space:]]','','g');
  s:=replace(replace(replace(replace(s,'·','*'),'×','*'),'x','*'),'X','*');
  m:=regexp_match(s,'^(-?[0-9.,]+)\*10\^?([-+]?[0-9]{1,2})$');
  if m is null then m:=regexp_match(s,'^(-?[0-9.,]+)[eE]([-+]?[0-9]{1,2})$'); end if;
  if m is null then return public.academy_parse_number(t); end if;
  base:=public.academy_parse_number(m[1]);
  if base is null then return null; end if;
  ex:=m[2]::int;
  return base*power(10::numeric,ex);
end;$$;

create function public.academy_norm_unit(t text) returns text language sql immutable set search_path='' as $$
  select lower(replace(replace(replace(replace(replace(replace(replace(replace(replace(replace(replace(replace(replace(replace(
    regexp_replace(coalesce(t,''),'[[:space:]]','','g'),
    'Ω','ohm'),'ω','ohm'),'ohmios','ohm'),'Ohmios','ohm'),'ohms','ohm'),'º','°'),'grados','°'),'²','2'),'³','3'),'·','.'),'*','.'),'^',''),'⁻','-'),'−','-'))
$$;

create function public.academy_word_count(t text) returns integer language sql immutable set search_path='' as $$
  select count(*)::int from regexp_split_to_table(trim(coalesce(t,'')),'[[:space:]]+') w where w ~ '[[:alnum:]]'
$$;

-- Valida respuestas y elección de preguntas contra la estructura del simulacro.
create function public.academy_mock_check(p_mock_id text,p_answers jsonb,p_chosen jsonb) returns void language plpgsql stable set search_path='' as $$
declare d public.academy_mock_defs; sec jsonb; ids jsonb; n int;
begin
  select * into d from public.academy_mock_defs where mock_id=p_mock_id;
  if not found then raise exception 'Simulacro no disponible' using errcode='P0002'; end if;
  if p_answers is null or jsonb_typeof(p_answers)<>'object' or pg_column_size(p_answers)>60000 then raise exception 'Respuestas inválidas' using errcode='22023'; end if;
  if p_chosen is null or jsonb_typeof(p_chosen)<>'object' or pg_column_size(p_chosen)>4000 then raise exception 'Elección inválida' using errcode='22023'; end if;
  if exists(select 1 from jsonb_object_keys(p_answers) k where not exists(select 1 from public.academy_mock_items i where i.mock_id=p_mock_id and i.item_id=k)) then
    raise exception 'Respuesta a una pregunta que no existe' using errcode='22023'; end if;
  if exists(select 1 from jsonb_each(p_answers) e where jsonb_typeof(e.value)<>'object' or length(coalesce(e.value->>'text',''))>8000
      or length(coalesce(e.value->>'value',''))>60 or length(coalesce(e.value->>'unit',''))>30 or length(coalesce(e.value->>'choice',''))>20) then
    raise exception 'Formato de respuesta inválido' using errcode='22023'; end if;
  for sec in select value from jsonb_array_elements(d.structure->'sections') loop
    ids:=p_chosen->(sec->>'id');
    if ids is null then continue; end if;
    if jsonb_typeof(ids)<>'array' then raise exception 'Elección inválida' using errcode='22023'; end if;
    n:=jsonb_array_length(ids);
    if jsonb_typeof(sec->'choose')='number' and n>(sec->>'choose')::int then
      raise exception 'En «%» solo puedes elegir %',sec->>'label',sec->>'choose' using errcode='22023'; end if;
    if exists(select 1 from jsonb_array_elements_text(ids) g where not exists(select 1 from jsonb_array_elements(sec->'groups') x where x->>'id'=g)) then
      raise exception 'Elección de una pregunta inexistente' using errcode='22023'; end if;
    if n<>(select count(distinct g) from jsonb_array_elements_text(ids) g) then raise exception 'Elección repetida' using errcode='22023'; end if;
  end loop;
  if exists(select 1 from jsonb_object_keys(p_chosen) k where not exists(select 1 from jsonb_array_elements(d.structure->'sections') s where s->>'id'=k)) then
    raise exception 'Elección de una parte inexistente' using errcode='22023'; end if;
end;$$;

create function public.academy_mock_view(s public.academy_mock_sessions) returns jsonb language sql stable set search_path='' as $$
  select jsonb_build_object('id',s.id,'client_session_id',s.client_session_id,'mock_id',s.mock_id,'course',s.course,'content_version',s.content_version,
    'duration_minutes',s.duration_minutes,'started_at',s.started_at,'deadline_at',s.deadline_at,'server_now',now(),'status',s.status,
    'answers',s.answers,'chosen',s.chosen,'revision',s.revision,'submitted_at',s.submitted_at,'late_answers_ignored',s.late_answers_ignored,
    'auto_score',s.auto_score,'result',s.result,'self_scores',s.self_scores,'total_score',s.total_score,'graded_at',s.graded_at)
$$;

create function public.academy_mock_start(p_client_session_id uuid,p_mock_id text) returns jsonb language plpgsql security definer set search_path='' as $$
declare me uuid:=auth.uid(); d public.academy_mock_defs; s public.academy_mock_sessions;
begin
  if me is null then raise exception 'Inicia sesión' using errcode='42501'; end if;
  if p_client_session_id is null then raise exception 'Falta el identificador' using errcode='22023'; end if;
  perform pg_advisory_xact_lock(hashtextextended('academy-mock:'||me::text,0));
  select * into s from public.academy_mock_sessions where user_id=me and client_session_id=p_client_session_id;
  if found then
    if s.mock_id<>p_mock_id then raise exception 'Identificador de simulacro reutilizado' using errcode='22023'; end if;
    return public.academy_mock_view(s)||jsonb_build_object('duplicate',true);
  end if;
  if exists(select 1 from public.academy_mock_sessions where user_id=me and status='in_progress') then
    raise exception 'Ya tienes un simulacro en curso: entrégalo antes de empezar otro' using errcode='22023'; end if;
  select * into d from public.academy_mock_defs where mock_id=p_mock_id;
  if not found then raise exception 'Simulacro no disponible' using errcode='P0002'; end if;
  insert into public.academy_mock_sessions(user_id,client_session_id,mock_id,course,content_version,duration_minutes,deadline_at)
  values(me,p_client_session_id,d.mock_id,d.course,d.content_version,d.duration_minutes,now()+make_interval(mins=>d.duration_minutes))
  returning * into s;
  return public.academy_mock_view(s)||jsonb_build_object('duplicate',false);
end;$$;

-- Autoguardado con CAS. Tras el límite (+2 min de margen) ya no se aceptan cambios.
create function public.academy_mock_save(p_session_id uuid,p_revision integer,p_answers jsonb,p_chosen jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare me uuid:=auth.uid(); s public.academy_mock_sessions;
begin
  if me is null then raise exception 'Inicia sesión' using errcode='42501'; end if;
  select * into s from public.academy_mock_sessions where id=p_session_id and user_id=me for update;
  if not found then raise exception 'Simulacro no encontrado' using errcode='P0002'; end if;
  if s.status<>'in_progress' then raise exception 'El simulacro ya está entregado' using errcode='22023'; end if;
  if now()>s.deadline_at+interval '2 minutes' then raise exception 'Tiempo agotado: entrega el simulacro' using errcode='22023'; end if;
  if p_revision is distinct from s.revision then raise exception 'El simulacro cambió en otro dispositivo' using errcode='40001'; end if;
  perform public.academy_mock_check(s.mock_id,p_answers,p_chosen);
  update public.academy_mock_sessions set answers=p_answers,chosen=p_chosen,revision=revision+1,updated_at=now() where id=s.id returning * into s;
  return jsonb_build_object('revision',s.revision,'saved_at',s.updated_at,'server_now',now());
end;$$;

-- Entrega y corrección automática de lo objetivo. Lo abierto queda para la autocorrección con rúbrica.
create function public.academy_mock_submit(p_session_id uuid,p_answers jsonb,p_chosen jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare me uuid:=auth.uid(); s public.academy_mock_sessions; d public.academy_mock_defs; sec jsonb; grp jsonb; it public.academy_mock_items;
  ans jsonb; chosen_ids text[]; is_chosen boolean; late boolean:=false; v_answers jsonb; v_chosen jsonb;
  st text; sc numeric; ok boolean; unit_ok boolean; v numeric; tol numeric; disp text; blank boolean; wc int; rule jsonb;
  g_sum numeric; g_ded numeric; g_auto numeric; g_auto_max numeric; g_open_max numeric; auto_total numeric:=0; open_total numeric:=0;
  items jsonb:='{}'::jsonb; groups jsonb:='[]'::jsonb; res jsonb;
begin
  if me is null then raise exception 'Inicia sesión' using errcode='42501'; end if;
  select * into s from public.academy_mock_sessions where id=p_session_id and user_id=me for update;
  if not found then raise exception 'Simulacro no encontrado' using errcode='P0002'; end if;
  if s.status<>'in_progress' then return s.result||jsonb_build_object('duplicate',true); end if;
  if now()<=s.deadline_at+interval '2 minutes' then
    perform public.academy_mock_check(s.mock_id,p_answers,p_chosen);
    v_answers:=p_answers; v_chosen:=p_chosen;
  else
    v_answers:=s.answers; v_chosen:=s.chosen; late:=true;
  end if;
  select * into d from public.academy_mock_defs where mock_id=s.mock_id;
  for sec in select value from jsonb_array_elements(d.structure->'sections') loop
    if jsonb_typeof(sec->'choose')='number' then
      chosen_ids:=coalesce(array(select jsonb_array_elements_text(v_chosen->(sec->>'id'))),'{}');
    else
      chosen_ids:=array(select x->>'id' from jsonb_array_elements(sec->'groups') x);
    end if;
    for grp in select value from jsonb_array_elements(sec->'groups') loop
      is_chosen:=(grp->>'id')=any(chosen_ids);
      g_sum:=0; g_ded:=0; g_auto_max:=0; g_open_max:=0;
      for it in select i.* from public.academy_mock_items i join jsonb_array_elements_text(grp->'items') with ordinality o(id,n) on o.id=i.item_id
                where i.mock_id=s.mock_id order by o.n loop
        ans:=v_answers->it.item_id;
        blank:=ans is null or (coalesce(nullif(trim(ans->>'choice'),''),nullif(trim(ans->>'value'),''),nullif(trim(ans->>'text'),'')) is null);
        sc:=0; st:='blank'; disp:=null; wc:=null;
        if it.kind='open' then
          st:='open'; g_open_max:=g_open_max+it.points;
          rule:=d.structure->'word_rules'->it.item_id;
          if rule is not null then wc:=public.academy_word_count(ans->>'text'); end if;
        else
          g_auto_max:=g_auto_max+it.points;
          if it.kind='multiple_choice' then
            disp:=it.key->>'correct';
            ok:=not blank and (ans->>'choice')=disp;
            unit_ok:=true;
          elsif it.kind='numeric' then
            disp:=(it.key->>'display');
            v:=public.academy_parse_sci(ans->>'value');
            tol:=greatest(coalesce((it.key->>'tol_abs')::numeric,0),abs((it.key->>'value')::numeric)*coalesce((it.key->>'tol_rel')::numeric,0),0.000000001);
            ok:=not blank and v is not null and abs(v-(it.key->>'value')::numeric)<=tol;
            unit_ok:=it.key->'units' is null or exists(select 1 from jsonb_array_elements_text(it.key->'units') u
              where public.academy_norm_unit(u)=public.academy_norm_unit(ans->>'unit'));
          else
            disp:=it.key->'accepted'->>0;
            ok:=not blank and exists(select 1 from jsonb_array_elements_text(it.key->'accepted') x
              where public.academy_norm_text(regexp_replace(x,'[.]$',''),coalesce((it.key->>'accent_sensitive')::boolean,true))
                   =public.academy_norm_text(regexp_replace(left(ans->>'text',300),'[.]$',''),coalesce((it.key->>'accent_sensitive')::boolean,true)));
            unit_ok:=true;
          end if;
          if not is_chosen then st:='not_chosen';
          elsif blank then st:='blank';
          elsif ok and unit_ok then st:='correct'; sc:=it.points;
          elsif ok then st:='unit'; sc:=it.points-least(it.points,0.5);
          else st:='wrong'; sc:=-it.wrong_penalty; end if;
          if is_chosen then
            if grp->>'mode'='deduct' then
              if st<>'correct' then g_ded:=g_ded+it.wrong_penalty; end if;
            else g_sum:=g_sum+sc; end if;
          end if;
        end if;
        if not is_chosen and it.kind='open' then st:='not_chosen'; end if;
        items:=items||jsonb_build_object(it.item_id,jsonb_strip_nulls(jsonb_build_object('group_id',grp->>'id','kind',it.kind,'status',st,
          'score',case when it.kind='open' or not is_chosen or grp->>'mode'='deduct' then null else trim_scale(sc) end,'max',it.points,'correct',disp,
          'solution_md',it.solution_md,'rubric_md',nullif(it.rubric_md,''),'word_count',wc,
          'word_min',(rule->>'min')::int,'word_max',(rule->>'max')::int,'word_penalty',(rule->>'penalty')::numeric)));
        rule:=null;
      end loop;
      if grp->>'mode'='deduct' then g_auto:=greatest(0,(grp->>'points')::numeric-g_ded); g_auto_max:=(grp->>'points')::numeric;
      elsif coalesce((grp->>'floor0')::boolean,false) then g_auto:=greatest(0,g_sum);
      else g_auto:=g_sum; end if;
      if not is_chosen then g_auto:=0; end if;
      auto_total:=auto_total+g_auto;
      if is_chosen then open_total:=open_total+g_open_max; end if;
      groups:=groups||jsonb_build_array(jsonb_build_object('section_id',sec->>'id','group_id',grp->>'id','chosen',is_chosen,
        'auto_score',trim_scale(round(g_auto,2)),'auto_max',g_auto_max,'open_max',g_open_max));
    end loop;
  end loop;
  auto_total:=trim_scale(round(auto_total,2));
  res:=jsonb_build_object('session_id',s.id,'mock_id',s.mock_id,'auto_score',auto_total,'open_max',open_total,
    'late_answers_ignored',late,'groups',groups,'items',items,'needs_self_score',open_total>0);
  update public.academy_mock_sessions set answers=v_answers,chosen=v_chosen,status=case when open_total>0 then 'submitted' else 'graded' end,
    submitted_at=now(),late_answers_ignored=late,auto_score=auto_total,result=res,
    total_score=case when open_total>0 then null else least(10,greatest(0,auto_total)) end,
    graded_at=case when open_total>0 then null else now() end,revision=revision+1,updated_at=now()
    where id=s.id;
  return res||jsonb_build_object('duplicate',false);
end;$$;

-- Autocorrección de lo abierto con la rúbrica. Se valida el máximo de cada pregunta y se aplica en servidor
-- la penalización por número de palabras. Una vez calificado, no cambia.
create function public.academy_mock_self_score(p_session_id uuid,p_scores jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare me uuid:=auth.uid(); s public.academy_mock_sessions; k text; it jsonb; given numeric; pen numeric; fin numeric;
  detail jsonb:='{}'::jsonb; open_sum numeric:=0; total numeric;
begin
  if me is null then raise exception 'Inicia sesión' using errcode='42501'; end if;
  select * into s from public.academy_mock_sessions where id=p_session_id and user_id=me for update;
  if not found then raise exception 'Simulacro no encontrado' using errcode='P0002'; end if;
  if s.status='graded' then return jsonb_build_object('total_score',s.total_score,'self_scores',s.self_scores,'duplicate',true); end if;
  if s.status<>'submitted' then raise exception 'Primero entrega el simulacro' using errcode='22023'; end if;
  if p_scores is null or jsonb_typeof(p_scores)<>'object' then raise exception 'Puntuaciones inválidas' using errcode='22023'; end if;
  for k in select jsonb_object_keys(p_scores) loop
    it:=s.result->'items'->k;
    if it is null or it->>'kind'<>'open' or it->>'status'<>'open' then raise exception 'Solo se puntúan preguntas abiertas elegidas' using errcode='22023'; end if;
  end loop;
  for k,it in select key,value from jsonb_each(s.result->'items') loop
    if it->>'kind'<>'open' or it->>'status'<>'open' then continue; end if;
    if p_scores->k is not null and jsonb_typeof(p_scores->k)<>'number' then raise exception 'Puntuación inválida en %',k using errcode='22023'; end if;
    given:=coalesce((p_scores->>k)::numeric,0);
    if given<0 or given>(it->>'max')::numeric then raise exception 'La puntuación de % debe estar entre 0 y %',k,it->>'max' using errcode='22023'; end if;
    given:=round(given,2);
    pen:=case when it ? 'word_penalty' and ((it->>'word_count')::int<(it->>'word_min')::int or (it->>'word_count')::int>(it->>'word_max')::int)
      then (it->>'word_penalty')::numeric else 0 end;
    fin:=greatest(0,given-pen);
    open_sum:=open_sum+fin;
    detail:=detail||jsonb_build_object(k,jsonb_build_object('given',trim_scale(given),'penalty',trim_scale(pen),'final',trim_scale(fin)));
  end loop;
  total:=trim_scale(least(10,greatest(0,round(s.auto_score+open_sum,2))));
  update public.academy_mock_sessions set self_scores=detail,total_score=total,status='graded',graded_at=now(),revision=revision+1,updated_at=now() where id=s.id;
  return jsonb_build_object('total_score',total,'self_scores',detail,'auto_score',s.auto_score,'duplicate',false);
end;$$;

alter table public.academy_preferences alter column elective set default 'fisica';

revoke all on function public.academy_parse_sci(text) from public, anon, authenticated;
revoke all on function public.academy_norm_unit(text) from public, anon, authenticated;
revoke all on function public.academy_word_count(text) from public, anon, authenticated;
revoke all on function public.academy_mock_check(text,jsonb,jsonb) from public, anon, authenticated;
revoke all on function public.academy_mock_view(public.academy_mock_sessions) from public, anon, authenticated;
revoke all on function public.academy_mock_start(uuid,text) from public, anon;
revoke all on function public.academy_mock_save(uuid,integer,jsonb,jsonb) from public, anon;
revoke all on function public.academy_mock_submit(uuid,jsonb,jsonb) from public, anon;
revoke all on function public.academy_mock_self_score(uuid,jsonb) from public, anon;
grant execute on function public.academy_mock_start(uuid,text) to authenticated;
grant execute on function public.academy_mock_save(uuid,integer,jsonb,jsonb) to authenticated;
grant execute on function public.academy_mock_submit(uuid,jsonb,jsonb) to authenticated;
grant execute on function public.academy_mock_self_score(uuid,jsonb) to authenticated;
commit;
