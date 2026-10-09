-- Rollback EXACTO de 20261008120000 en STAGING (zpueziugbezqxompwsol), desde la instantánea 2026-10-09T19:28:48Z.
-- En staging, antes de aplicar: solo las vistas payroll_v_monthly_nl y payroll_v_jaaropgave_nl tenían privilegios
-- para anon (arwdDxtm) y authenticated (arwdDxtm); las tablas ya estaban en CRUD; las funciones ya tenían
-- search_path y las de trigger ya no eran invocables. Privilegios por defecto de postgres: todo a anon.
begin;
grant select, insert, update, delete, truncate, references, trigger, maintain on table public.payroll_v_monthly_nl to anon, authenticated;
grant select, insert, update, delete, truncate, references, trigger, maintain on table public.payroll_v_jaaropgave_nl to anon, authenticated;
alter default privileges for role postgres in schema public grant all on tables to anon;
alter default privileges for role postgres in schema public grant all on sequences to anon;
alter default privileges for role postgres in schema public grant execute on functions to anon;
commit;
