-- DESHACER 20261011120000_storage_portfolio_progress_buckets · SOLO STAGING.
-- NO ejecutar en producción: allí los buckets y políticas existían antes de la migración (portfolio-files tiene archivos).
-- Quita las políticas; los buckets vacíos se borran desde el panel (Storage), porque Supabase no permite borrarlos por SQL.
drop policy if exists portfolio_files_owner on storage.objects;
drop policy if exists progress_photos_owner on storage.objects;
