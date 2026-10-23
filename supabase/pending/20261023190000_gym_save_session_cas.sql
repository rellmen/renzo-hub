-- Pending (Nocturne): atomic save of an open Gym session. Additive function only; no table change.
-- SECURITY INVOKER keeps gym_sessions RLS. The expected exercises snapshot is compared AFTER
-- taking the row lock, so two devices editing the same draft cannot silently overwrite each other.
create or replace function public.gym_save_session_cas(
 p_id uuid, p_expected jsonb, p_exercises jsonb, p_finish boolean default false, p_duration integer default null
) returns jsonb language plpgsql security invoker set search_path = '' as $$
declare s public.gym_sessions;
begin
 if auth.uid() is null then raise exception 'Authentication required' using errcode='42501'; end if;
 if jsonb_typeof(p_expected) is distinct from 'array' or jsonb_typeof(p_exercises) is distinct from 'array'
    or jsonb_array_length(p_exercises) <> jsonb_array_length(p_expected) or jsonb_array_length(p_exercises) > 40 then
  raise exception 'Invalid exercises payload' using errcode='22023';
 end if;
 if p_duration is not null and (p_duration < 0 or p_duration > 600) then raise exception 'Invalid duration' using errcode='22023'; end if;
 select * into s from public.gym_sessions where id=p_id and user_id=auth.uid() for update;
 if s.id is null then raise exception 'Session not found' using errcode='42501'; end if;
 if s.completed_at is not null then raise exception 'Session already closed' using errcode='22023'; end if;
 if s.exercises is distinct from p_expected then
  raise exception 'Gym session changed on another device; reload' using errcode='40001';
 end if;
 update public.gym_sessions set exercises=p_exercises,
  completed_at=case when p_finish then now() else null end,
  duration_minutes=case when p_finish then p_duration else duration_minutes end
 where id=p_id and user_id=auth.uid() returning * into s;
 return to_jsonb(s);
end;
$$;
revoke all on function public.gym_save_session_cas(uuid,jsonb,jsonb,boolean,integer) from public, anon;
grant execute on function public.gym_save_session_cas(uuid,jsonb,jsonb,boolean,integer) to authenticated;
