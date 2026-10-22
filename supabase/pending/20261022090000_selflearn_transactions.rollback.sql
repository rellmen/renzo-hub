-- Removes only this migration's behavior. Existing records/reviews remain intact.
begin;
drop trigger if exists selflearn_guard_records on public.hub_records;
drop function if exists public.selflearn_review_vocabulary(uuid,timestamptz,uuid,jsonb,text);
drop function if exists public.selflearn_finalize_lesson(uuid,jsonb,jsonb);
drop function if exists public.selflearn_guard_records();
drop function if exists public.selflearn_word(text);
drop function if exists public.selflearn_unit(jsonb);
drop function if exists public.selflearn_course(jsonb);
commit;
