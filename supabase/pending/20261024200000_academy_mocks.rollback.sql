-- Rollback de 20261024200000_academy_mocks.sql: elimina SOLO objetos academy_mock_* y funciones auxiliares nuevas.
-- ATENCIÓN: borra los simulacros hechos en la app. Exportarlos antes si existen.
begin;
drop function if exists public.academy_mock_self_score(uuid,jsonb);
drop function if exists public.academy_mock_submit(uuid,jsonb,jsonb);
drop function if exists public.academy_mock_save(uuid,integer,jsonb,jsonb);
drop function if exists public.academy_mock_start(uuid,text);
drop function if exists public.academy_mock_view(public.academy_mock_sessions);
drop function if exists public.academy_mock_check(text,jsonb,jsonb);
drop function if exists public.academy_word_count(text);
drop function if exists public.academy_norm_unit(text);
drop function if exists public.academy_parse_sci(text);
drop table if exists public.academy_mock_sessions;
drop table if exists public.academy_mock_items;
drop table if exists public.academy_mock_defs;
alter table public.academy_preferences alter column elective set default 'economia';
commit;
