-- Rollback de 20261101100000_academy_catalan.sql. ATENCIÓN: borra las claves, simulacros y exámenes de catalán.
begin;
delete from public.academy_exam_sessions where course='catalan';
delete from public.academy_mock_defs where course='catalan';
delete from public.academy_question_keys where course='catalan';
alter table public.academy_question_keys drop constraint academy_question_keys_course_check;
alter table public.academy_question_keys add constraint academy_question_keys_course_check
  check (course in ('matematicas','economia','castellano','comentario','ingles','fisica'));
alter table public.academy_mock_defs drop constraint academy_mock_defs_course_check;
alter table public.academy_mock_defs add constraint academy_mock_defs_course_check
  check (course in ('matematicas','economia','castellano','comentario','ingles','fisica'));
alter table public.academy_exam_sessions drop constraint academy_exam_sessions_course_check;
alter table public.academy_exam_sessions add constraint academy_exam_sessions_course_check
  check (course in ('matematicas','economia','castellano','comentario','ingles','fisica'));
alter table public.academy_preferences alter column elective set default 'fisica';
commit;
