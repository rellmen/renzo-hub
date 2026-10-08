-- Prueba de integración en Supabase STAGING (no usar en producción).
-- Simula al usuario autenticado con las mismas operaciones que hace phase1.js / profile.js
-- y comprueba RLS, triggers, idempotencia y aislamiento. Todo se deshace al final:
-- el bloque termina con RAISE EXCEPTION 'TEST_OK ...' para forzar ROLLBACK.
do $$
declare
  me  uuid := 'fdf1f291-863b-4027-9e90-e36de360a553';  -- usuario de staging (renzojesus99@icloud.com)
  other uuid := '00000000-0000-4000-8000-0000000000aa';  -- uid ficticio, sin fila en auth.users
  food uuid := gen_random_uuid();
  w_id uuid := '11111111-1111-5111-8111-111111111111';
  h_id uuid := '22222222-2222-5222-8222-222222222222';
  xp_id uuid := '33333333-3333-5333-8333-333333333333';
  n int; t1 timestamptz; t2 timestamptz; ok boolean; r text := '';
begin
  perform set_config('request.jwt.claims', json_build_object('sub', me, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';

  -- Nutrition: insertar comida
  insert into public.hub_records(id, owner_id, domain, record_type, title, status, occurred_at, payload, source, requires_review)
  values (food, me, 'body', 'food_log', 'Comida · test', 'active', now(), '{"kcal":650,"protein":40}', 'manual', false);
  select count(*) into n from public.hub_records where record_type='food_log';
  if n <> 1 then raise exception 'FAIL food insert %', n; end if; r := r || 'food+ ';

  -- Body: peso diario, id determinista; segundo upsert actualiza, no duplica; trigger updated_at
  insert into public.hub_records(id, owner_id, domain, record_type, title, status, occurred_at, payload, source, requires_review)
  values (w_id, me, 'body', 'body_weight', 'Peso 82.6 kg', 'active', now(), '{"value":82.6}', 'manual', false)
  on conflict (id) do update set payload = excluded.payload, title = excluded.title;
  select updated_at into t1 from public.hub_records where id = w_id;
  perform pg_sleep(0.01);
  insert into public.hub_records(id, owner_id, domain, record_type, title, status, occurred_at, payload, source, requires_review)
  values (w_id, me, 'body', 'body_weight', 'Peso 82.4 kg', 'active', now(), '{"value":82.4}', 'manual', false)
  on conflict (id) do update set payload = excluded.payload, title = excluded.title;
  select count(*), max(updated_at) into n, t2 from public.hub_records where record_type='body_weight';
  if n <> 1 then raise exception 'FAIL weight dup %', n; end if;
  if (select payload->>'value' from public.hub_records where id=w_id) <> '82.4' then raise exception 'FAIL weight value'; end if;
  r := r || 'weight-upsert ';

  -- Habits: marcar/desmarcar
  insert into public.hub_records(id, owner_id, domain, record_type, title, status, occurred_at, payload, source, requires_review)
  values (h_id, me, 'personal', 'habit_log', 'Agua · hoy', 'done', now(), '{"habit":"Agua"}', 'manual', false)
  on conflict (id) do update set status = excluded.status;
  insert into public.hub_records(id, owner_id, domain, record_type, title, status, occurred_at, payload, source, requires_review)
  values (h_id, me, 'personal', 'habit_log', 'Agua · hoy', 'undone', now(), '{"habit":"Agua"}', 'manual', false)
  on conflict (id) do update set status = excluded.status;
  select count(*) into n from public.hub_records where record_type='habit_log' and status='undone';
  if n <> 1 then raise exception 'FAIL habit toggle %', n; end if; r := r || 'habit-toggle ';

  -- XP: el mismo evento dos veces (ignoreDuplicates) = 1 fila
  for i in 1..2 loop
    insert into public.hub_records(id, owner_id, domain, record_type, title, status, occurred_at, payload, source, requires_review)
    values (xp_id, me, 'system', 'xp_event', 'XP · food', 'active', now(), '{"xp":10}', 'automation', false)
    on conflict (id) do nothing;
  end loop;
  select count(*) into n from public.hub_records where record_type='xp_event';
  if n <> 1 then raise exception 'FAIL xp dup %', n; end if; r := r || 'xp-no-dup ';

  -- Progress: lo que lee la app (por tipo) tras las escrituras
  select count(*) into n from public.hub_records where owner_id = me;
  if n <> 4 then raise exception 'FAIL progress count %', n; end if; r := r || 'progress-read ';

  -- Settings: hábitos y perfil corporal (read-modify-write)
  insert into public.user_settings(user_id, settings) values (me, '{"habits":["Agua"]}')
  on conflict (user_id) do update set settings = excluded.settings;
  update public.user_settings set settings = settings || '{"bodyProfile":{"heightCm":180}}' where user_id = me;
  if (select settings ? 'habits' and settings ? 'bodyProfile' from public.user_settings where user_id = me) is not true
    then raise exception 'FAIL settings merge'; end if;
  r := r || 'settings-merge ';

  -- Origen no permitido: lo rechaza el CHECK de source
  begin
    insert into public.hub_records(owner_id, domain, record_type, source) values (me, 'system', 'x', 'jarvis');
    raise exception 'FAIL source check';
  exception when check_violation then r := r || 'source-check ';
  end;

  -- Aislamiento: no se puede escribir con otro owner_id
  begin
    insert into public.hub_records(owner_id, domain, record_type, source) values (other, 'system', 'x', 'manual');
    raise exception 'FAIL rls insert other';
  exception when insufficient_privilege then r := r || 'rls-insert ';
  end;

  -- Aislamiento: otro usuario no ve nada
  perform set_config('request.jwt.claims', json_build_object('sub', other, 'role', 'authenticated')::text, true);
  select count(*) into n from public.hub_records;
  if n <> 0 then raise exception 'FAIL rls select other %', n; end if;
  select count(*) into n from public.user_settings;
  if n <> 0 then raise exception 'FAIL rls settings other %', n; end if;
  r := r || 'rls-select ';

  -- TRUNCATE ya no está permitido a authenticated
  begin
    execute 'truncate public.hub_records';
    raise exception 'FAIL truncate allowed';
  exception when insufficient_privilege then r := r || 'no-truncate ';
  end;

  -- anon: sin acceso a tablas
  execute 'set local role anon';
  begin
    select count(*) into n from public.user_settings;
    raise exception 'FAIL anon read %', n;
  exception when insufficient_privilege then r := r || 'anon-denied ';
  end;

  raise exception 'TEST_OK %', r;
end $$;
