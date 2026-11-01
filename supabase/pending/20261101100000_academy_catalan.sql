-- RISE · Academia +25 · Llengua catalana y ruta Matemáticas + Economía (aditiva, 01-11-2026).
-- Motivo: Renzo eligió la prueba +25 común de Cataluña (fase general con Llengua catalana; específica Matemáticas + Economía).
-- Cambios: admite el curso 'catalan' en claves de lecciones, simulacros y exámenes; la segunda específica por defecto vuelve a Economía.
-- No toca filas existentes. Estado: SIN APLICAR. Primero staging; producción solo con autorización expresa de Renzo.
-- Rollback: 20261101100000_academy_catalan.rollback.sql (borra solo claves/simulacros/exámenes de catalán).
begin;
alter table public.academy_question_keys drop constraint academy_question_keys_course_check;
alter table public.academy_question_keys add constraint academy_question_keys_course_check
  check (course in ('matematicas','economia','castellano','comentario','ingles','fisica','catalan'));
alter table public.academy_mock_defs drop constraint academy_mock_defs_course_check;
alter table public.academy_mock_defs add constraint academy_mock_defs_course_check
  check (course in ('matematicas','economia','castellano','comentario','ingles','fisica','catalan'));
alter table public.academy_exam_sessions drop constraint academy_exam_sessions_course_check;
alter table public.academy_exam_sessions add constraint academy_exam_sessions_course_check
  check (course in ('matematicas','economia','castellano','comentario','ingles','fisica','catalan'));
alter table public.academy_preferences alter column elective set default 'economia';
commit;
