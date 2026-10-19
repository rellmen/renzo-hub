-- Rollback de 20261019030000_selflearn_tutor_quota.sql (pendiente: no aplicada en ningún entorno).
-- Solo borra la cuota diaria del tutor IA de SelfLearn; no toca datos de aprendizaje.
drop function if exists public.selflearn_tutor_take_quota();
drop table if exists public.selflearn_tutor_quota;
