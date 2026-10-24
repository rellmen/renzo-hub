-- Rollback de 20261024090000_academy_foundation.sql: elimina SOLO objetos academy_*.
-- ATENCIÓN: borra el progreso de estudio guardado en esas tablas. Exportarlo antes si existe.
begin;
drop function if exists public.academy_finish_quiz(text,uuid,text);
drop function if exists public.academy_grade(uuid,text,jsonb,text,uuid);
drop function if exists public.academy_norm_text(text,boolean);
drop function if exists public.academy_parse_number(text);
drop table if exists public.academy_editorial_reviews;
drop table if exists public.academy_exam_sessions;
drop function if exists public.academy_guard_exam();
drop table if exists public.academy_preferences;
drop table if exists public.academy_reviews;
drop table if exists public.academy_lesson_progress;
drop function if exists public.academy_touch_progress();
drop table if exists public.academy_attempts;
drop table if exists public.academy_question_keys;
commit;
