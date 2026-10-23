-- Removes ONLY the Nocturne Gym CAS function. Sessions and their data are untouched.
drop function if exists public.gym_save_session_cas(uuid,jsonb,jsonb,boolean,integer);
