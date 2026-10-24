-- RISE HUB Academia +25 · fundación de datos (aditiva).
-- Estado 24-10-2026: aplicada en staging y en producción (mgncykyrhavpepfggmng) con autorización de Renzo. No reaplicar.
-- Autorizado por Renzo el 24-10-2026 SOLO para Supabase staging (zpueziugbezqxompwsol). NO aplicar en producción sin autorización aparte.
-- Rollback: 20261024090000_academy_foundation.rollback.sql (elimina únicamente objetos academy_*).
-- Contenido didáctico: en el repositorio (apps/rise-react/src/content/academia, sin claves).
-- Claves de corrección: public.academy_question_keys, sin políticas para anon/authenticated; solo academy_grade las lee.
begin;

create table public.academy_question_keys(
  question_id text primary key check (question_id ~ '^[a-z0-9-]{3,64}$'),
  lesson_id text not null check (lesson_id ~ '^[a-z0-9-]{3,64}$'),
  course text not null check (course in ('matematicas','economia','castellano','comentario','ingles','fisica')),
  kind text not null check (kind in ('multiple_choice','numeric','short_text')),
  role text not null default 'bank' check (role in ('exit','bank')),
  key jsonb not null check (jsonb_typeof(key)='object'),
  explanation_md text not null default '' check (length(explanation_md)<=4000),
  skill_ids text[] not null default '{}',
  points numeric not null default 1 check (points>0 and points<=10),
  content_version integer not null default 1 check (content_version>=1),
  updated_at timestamptz not null default now()
);
create index academy_question_keys_lesson on public.academy_question_keys(lesson_id,role);
alter table public.academy_question_keys enable row level security;
revoke all on public.academy_question_keys from public, anon, authenticated;

create table public.academy_attempts(
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  client_attempt_id uuid not null,
  session_id uuid,
  question_id text not null references public.academy_question_keys(question_id) on delete cascade,
  lesson_id text not null,
  course text not null,
  context text not null check (context in ('practice','exit','review','diagnostic')),
  answer jsonb not null check (pg_column_size(answer)<=4000),
  is_correct boolean not null,
  score numeric not null default 0,
  max_score numeric not null default 1,
  skill_ids text[] not null default '{}',
  created_at timestamptz not null default now(),
  unique(user_id,client_attempt_id)
);
create index academy_attempts_user_time on public.academy_attempts(user_id,created_at desc);
create index academy_attempts_session on public.academy_attempts(user_id,session_id) where session_id is not null;
alter table public.academy_attempts enable row level security;
revoke all on public.academy_attempts from public, anon, authenticated;
grant select on public.academy_attempts to authenticated;
create policy academy_attempts_own_select on public.academy_attempts for select to authenticated using (user_id=(select auth.uid()));

create table public.academy_lesson_progress(
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  lesson_id text not null check (lesson_id ~ '^[a-z0-9-]{3,64}$'),
  status text not null default 'in_progress' check (status in ('in_progress','completed','mastered')),
  last_section text check (length(last_section)<=80),
  draft jsonb not null default '{}'::jsonb check (jsonb_typeof(draft)='object' and pg_column_size(draft)<=60000),
  revision integer not null default 1 check (revision>=1),
  best_exit_pct numeric check (best_exit_pct between 0 and 100),
  last_finished_session uuid,
  last_result jsonb,
  completed_at timestamptz,
  opened_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key(user_id,lesson_id)
);
alter table public.academy_lesson_progress enable row level security;
revoke all on public.academy_lesson_progress from public, anon, authenticated;
grant select on public.academy_lesson_progress to authenticated;
-- Abrir y autoguardar: solo columnas de borrador. Estado/notas solo cambian vía academy_finish_quiz.
grant insert(lesson_id,last_section,draft) on public.academy_lesson_progress to authenticated;
grant update(last_section,draft,revision) on public.academy_lesson_progress to authenticated;
create policy academy_progress_own_select on public.academy_lesson_progress for select to authenticated using (user_id=(select auth.uid()));
create policy academy_progress_own_insert on public.academy_lesson_progress for insert to authenticated with check (user_id=(select auth.uid()));
create policy academy_progress_own_update on public.academy_lesson_progress for update to authenticated using (user_id=(select auth.uid())) with check (user_id=(select auth.uid()));

create function public.academy_touch_progress() returns trigger language plpgsql security invoker set search_path='' as $$
begin
  if tg_op='UPDATE' and new.revision<>old.revision+1 and current_setting('academy.internal',true) is distinct from 'on' then
    raise exception 'El progreso cambió en otro dispositivo' using errcode='40001';
  end if;
  new.updated_at:=now();
  return new;
end;$$;
create trigger academy_touch_progress before update on public.academy_lesson_progress for each row execute function public.academy_touch_progress();
revoke all on function public.academy_touch_progress() from public, anon, authenticated;

create table public.academy_reviews(
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id text not null,
  step smallint not null default 0 check (step between 0 and 5),
  due_on date not null,
  last_pct numeric,
  updated_at timestamptz not null default now(),
  primary key(user_id,lesson_id)
);
alter table public.academy_reviews enable row level security;
revoke all on public.academy_reviews from public, anon, authenticated;
grant select on public.academy_reviews to authenticated;
create policy academy_reviews_own_select on public.academy_reviews for select to authenticated using (user_id=(select auth.uid()));

create table public.academy_preferences(
  user_id uuid primary key default auth.uid() references auth.users(id) on delete cascade,
  weekly_minutes integer not null default 600 check (weekly_minutes between 30 and 4000),
  session_minutes integer not null default 25 check (session_minutes in (15,25,45,60)),
  elective text not null default 'economia' check (elective in ('economia','fisica')),
  show_drafts boolean not null default true,
  revision integer not null default 1,
  updated_at timestamptz not null default now()
);
alter table public.academy_preferences enable row level security;
revoke all on public.academy_preferences from public, anon, authenticated;
grant select on public.academy_preferences to authenticated;
grant insert(weekly_minutes,session_minutes,elective,show_drafts) on public.academy_preferences to authenticated;
grant update(weekly_minutes,session_minutes,elective,show_drafts,revision) on public.academy_preferences to authenticated;
create policy academy_prefs_own_select on public.academy_preferences for select to authenticated using (user_id=(select auth.uid()));
create policy academy_prefs_own_insert on public.academy_preferences for insert to authenticated with check (user_id=(select auth.uid()));
create policy academy_prefs_own_update on public.academy_preferences for update to authenticated using (user_id=(select auth.uid())) with check (user_id=(select auth.uid()));
create trigger academy_touch_preferences before update on public.academy_preferences for each row execute function public.academy_touch_progress();

-- Simulacros con examen oficial enlazado: autocorrección con la rúbrica del perfil. No es nota oficial.
create table public.academy_exam_sessions(
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  client_session_id uuid not null,
  profile_id text not null check (profile_id ~ '^[a-z0-9_]{3,64}$'),
  course text not null check (course in ('matematicas','economia','castellano','comentario','ingles','fisica')),
  source_url text check (source_url is null or source_url ~ '^https://'),
  source_label text check (length(source_label)<=200),
  duration_minutes integer not null default 90 check (duration_minutes between 10 and 240),
  status text not null default 'in_progress' check (status in ('in_progress','submitted')),
  scores jsonb not null default '{}'::jsonb check (jsonb_typeof(scores)='object' and pg_column_size(scores)<=20000),
  notes text not null default '' check (length(notes)<=20000),
  total_score numeric check (total_score between 0 and 10),
  revision integer not null default 1,
  started_at timestamptz not null default now(),
  submitted_at timestamptz,
  updated_at timestamptz not null default now(),
  unique(user_id,client_session_id)
);
alter table public.academy_exam_sessions enable row level security;
revoke all on public.academy_exam_sessions from public, anon, authenticated;
grant select on public.academy_exam_sessions to authenticated;
grant insert(client_session_id,profile_id,course,source_url,source_label,duration_minutes,scores,notes) on public.academy_exam_sessions to authenticated;
grant update(scores,notes,total_score,status,submitted_at,revision) on public.academy_exam_sessions to authenticated;
create policy academy_exams_own_select on public.academy_exam_sessions for select to authenticated using (user_id=(select auth.uid()));
create policy academy_exams_own_insert on public.academy_exam_sessions for insert to authenticated with check (user_id=(select auth.uid()));
create policy academy_exams_own_update on public.academy_exam_sessions for update to authenticated using (user_id=(select auth.uid()) and status='in_progress') with check (user_id=(select auth.uid()));
create function public.academy_guard_exam() returns trigger language plpgsql security invoker set search_path='' as $$
begin
  if new.revision<>old.revision+1 then raise exception 'El simulacro cambió en otro dispositivo' using errcode='40001'; end if;
  if old.status='submitted' then raise exception 'Un simulacro entregado no se modifica' using errcode='22023'; end if;
  if new.status='submitted' then
    if new.total_score is null then raise exception 'Falta la puntuación total' using errcode='22023'; end if;
    new.submitted_at:=now();
  else new.submitted_at:=null; end if;
  new.updated_at:=now();
  return new;
end;$$;
create trigger academy_guard_exam before update on public.academy_exam_sessions for each row execute function public.academy_guard_exam();
revoke all on function public.academy_guard_exam() from public, anon, authenticated;

-- Registro editorial: quién revisó qué versión y cuándo (traza de auditoría).
create table public.academy_editorial_reviews(
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  lesson_id text not null check (lesson_id ~ '^[a-z0-9-]{3,64}$'),
  content_version integer not null check (content_version>=1),
  decision text not null check (decision in ('reviewed','changes_requested')),
  comment text not null default '' check (length(comment)<=4000),
  created_at timestamptz not null default now()
);
alter table public.academy_editorial_reviews enable row level security;
revoke all on public.academy_editorial_reviews from public, anon, authenticated;
grant select on public.academy_editorial_reviews to authenticated;
grant insert(lesson_id,content_version,decision,comment) on public.academy_editorial_reviews to authenticated;
create policy academy_editorial_own_select on public.academy_editorial_reviews for select to authenticated using (user_id=(select auth.uid()));
create policy academy_editorial_own_insert on public.academy_editorial_reviews for insert to authenticated with check (user_id=(select auth.uid()));

create function public.academy_parse_number(t text) returns numeric language plpgsql immutable set search_path='' as $$
declare s text:=regexp_replace(coalesce(t,''),'[[:space:]€%]','','g'); n numeric; d numeric;
begin
  if s ~ '^-?[0-9]{1,3}(\.[0-9]{3})+(,[0-9]+)?$' then s:=replace(replace(s,'.',''),',','.');
  elsif s ~ '^-?[0-9]+,[0-9]+$' then s:=replace(s,',','.'); end if;
  if s ~ '^-?[0-9]+(\.[0-9]+)?$' then return s::numeric; end if;
  if s ~ '^-?[0-9]+/[0-9]+$' then
    n:=split_part(s,'/',1)::numeric; d:=split_part(s,'/',2)::numeric;
    if d=0 then return null; end if; return n/d;
  end if;
  return null;
end;$$;

create function public.academy_norm_text(t text,accents boolean) returns text language sql immutable set search_path='' as $$
  select regexp_replace(lower(trim(case when accents then coalesce(t,'') else translate(coalesce(t,''),'áéíóúüÁÉÍÓÚÜ','aeiouuAEIOUU') end)),'[[:space:]]+',' ','g')
$$;

-- Corrige en servidor e inserta el intento de forma idempotente (mismo client_attempt_id ⇒ mismo resultado, sin duplicar).
create function public.academy_grade(p_client_attempt_id uuid,p_question_id text,p_answer jsonb,p_context text,p_session_id uuid default null)
returns jsonb language plpgsql security definer set search_path='' as $$
declare me uuid:=auth.uid(); k public.academy_question_keys; a public.academy_attempts; ok boolean; v numeric; given text; disp text; dup boolean:=false;
begin
  if me is null then raise exception 'Inicia sesión' using errcode='42501'; end if;
  if p_client_attempt_id is null or p_answer is null or jsonb_typeof(p_answer)<>'object' or pg_column_size(p_answer)>4000 then raise exception 'Respuesta inválida' using errcode='22023'; end if;
  if p_context not in ('practice','exit','review','diagnostic') then raise exception 'Contexto inválido' using errcode='22023'; end if;
  if p_context in ('exit','review') and p_session_id is null then raise exception 'Falta la sesión de evaluación' using errcode='22023'; end if;
  select * into k from public.academy_question_keys where question_id=p_question_id;
  if not found then raise exception 'Pregunta no disponible' using errcode='P0002'; end if;
  -- Las preguntas de salida solo se usan en evaluación/repaso: practicarlas antes vaciaría la evaluación.
  if (k.role='exit')<>(p_context in ('exit','review')) then raise exception 'Pregunta no válida en este modo' using errcode='22023'; end if;
  select * into a from public.academy_attempts where user_id=me and client_attempt_id=p_client_attempt_id;
  if found then
    if a.question_id<>p_question_id then raise exception 'Identificador de intento reutilizado' using errcode='22023'; end if;
    dup:=true;
  else
    if coalesce(p_answer->>'dont_know','')='true' then ok:=false;
    elsif k.kind='multiple_choice' then ok:=(p_answer->>'choice') is not distinct from (k.key->>'correct_choice_id');
    elsif k.kind='numeric' then
      v:=public.academy_parse_number(p_answer->>'value');
      ok:=v is not null and abs(v-(k.key->>'value')::numeric)<=greatest(coalesce((k.key->>'tolerance')::numeric,0),0.000001);
    else
      given:=public.academy_norm_text(left(p_answer->>'text',300),coalesce((k.key->>'accent_sensitive')::boolean,true));
      ok:=exists(select 1 from jsonb_array_elements_text(k.key->'accepted') x
        where public.academy_norm_text(x,coalesce((k.key->>'accent_sensitive')::boolean,true))=given);
    end if;
    insert into public.academy_attempts(user_id,client_attempt_id,session_id,question_id,lesson_id,course,context,answer,is_correct,score,max_score,skill_ids)
    values(me,p_client_attempt_id,p_session_id,k.question_id,k.lesson_id,k.course,p_context,p_answer,ok,case when ok then k.points else 0 end,k.points,k.skill_ids)
    on conflict(user_id,client_attempt_id) do nothing returning * into a;
    if a.id is null then
      select * into a from public.academy_attempts where user_id=me and client_attempt_id=p_client_attempt_id;
      if a.question_id<>p_question_id then raise exception 'Identificador de intento reutilizado' using errcode='22023'; end if;
      dup:=true;
    end if;
  end if;
  disp:=case k.kind when 'multiple_choice' then k.key->>'correct_choice_id' when 'numeric' then k.key->>'value' else k.key->'accepted'->>0 end;
  return jsonb_build_object('attempt_id',a.id,'question_id',a.question_id,'is_correct',a.is_correct,'score',a.score,'max_score',a.max_score,
    'correct',disp,'explanation_md',k.explanation_md,'duplicate',dup,'session_id',a.session_id);
end;$$;

-- Cierra una evaluación de salida o de repaso: calcula % con los intentos de esa sesión, actualiza estado y repaso espaciado.
create function public.academy_finish_quiz(p_lesson_id text,p_session_id uuid,p_context text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare me uuid:=auth.uid(); total int; answered int; correct int; pct numeric; band text; prog public.academy_lesson_progress;
  rev public.academy_reviews; new_status text; next_step smallint; next_due date; res jsonb;
  intervals int[]:=array[1,3,7,14,30,60];
begin
  if me is null then raise exception 'Inicia sesión' using errcode='42501'; end if;
  if p_context not in ('exit','review') or p_session_id is null or p_lesson_id !~ '^[a-z0-9-]{3,64}$' then raise exception 'Parámetros inválidos' using errcode='22023'; end if;
  perform pg_advisory_xact_lock(hashtextextended('academy:'||me::text||':'||p_lesson_id,0));
  select * into prog from public.academy_lesson_progress where user_id=me and lesson_id=p_lesson_id;
  if found and prog.last_finished_session=p_session_id then return prog.last_result||jsonb_build_object('duplicate',true); end if;
  select count(*) into total from public.academy_question_keys where lesson_id=p_lesson_id and role='exit';
  if total=0 then raise exception 'Esta lección no tiene evaluación de salida' using errcode='P0002'; end if;
  select count(distinct t.question_id), count(distinct t.question_id) filter (where t.is_correct)
    into answered, correct
    from (select distinct on (x.question_id) x.question_id,x.is_correct from public.academy_attempts x
          join public.academy_question_keys q on q.question_id=x.question_id and q.lesson_id=p_lesson_id and q.role='exit'
          where x.user_id=me and x.session_id=p_session_id and x.context=p_context
          order by x.question_id,x.created_at asc) t;
  if answered<total then raise exception 'Faltan % de % preguntas por responder',total-answered,total using errcode='22023'; end if;
  pct:=round(correct*100.0/total,1);
  band:=case when pct>=80 then 'dominio' when pct>=60 then 'practica' else 'rescate' end;
  perform set_config('academy.internal','on',true);
  insert into public.academy_lesson_progress(user_id,lesson_id) values(me,p_lesson_id) on conflict do nothing;
  select * into prog from public.academy_lesson_progress where user_id=me and lesson_id=p_lesson_id for update;
  select * into rev from public.academy_reviews where user_id=me and lesson_id=p_lesson_id for update;
  new_status:=prog.status;
  if p_context='exit' then
    if pct>=80 then
      if new_status='in_progress' then new_status:='completed'; end if;
      if rev.user_id is null then
        insert into public.academy_reviews(user_id,lesson_id,step,due_on,last_pct) values(me,p_lesson_id,0,current_date+1,pct);
        next_due:=current_date+1;
      else next_due:=rev.due_on; end if;
    end if;
  else
    if rev.user_id is null then raise exception 'No hay repaso programado para esta lección' using errcode='22023'; end if;
    if pct>=80 then
      next_step:=least(rev.step+1,5);
      if next_step>=2 then new_status:='mastered'; end if;
    else next_step:=0; end if;
    next_due:=current_date+intervals[next_step+1];
    update public.academy_reviews set step=next_step,due_on=next_due,last_pct=pct,updated_at=now() where user_id=me and lesson_id=p_lesson_id;
  end if;
  res:=jsonb_build_object('lesson_id',p_lesson_id,'context',p_context,'pct',pct,'correct',correct,'total',total,'band',band,'status',new_status,'next_review',next_due);
  update public.academy_lesson_progress set status=new_status,
    best_exit_pct=greatest(coalesce(best_exit_pct,0),case when p_context='exit' then pct else 0 end),
    completed_at=case when new_status<>'in_progress' then coalesce(completed_at,now()) else completed_at end,
    last_finished_session=p_session_id,last_result=res,revision=revision+1
    where user_id=me and lesson_id=p_lesson_id;
  return res||jsonb_build_object('duplicate',false);
end;$$;

revoke all on function public.academy_grade(uuid,text,jsonb,text,uuid) from public, anon;
revoke all on function public.academy_finish_quiz(text,uuid,text) from public, anon;
revoke all on function public.academy_parse_number(text) from public, anon;
revoke all on function public.academy_norm_text(text,boolean) from public, anon;
grant execute on function public.academy_grade(uuid,text,jsonb,text,uuid) to authenticated;
grant execute on function public.academy_finish_quiz(text,uuid,text) to authenticated;
grant execute on function public.academy_parse_number(text) to authenticated;
grant execute on function public.academy_norm_text(text,boolean) to authenticated;
commit;
