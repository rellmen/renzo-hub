-- Buckets de Storage que producción tiene y que no estaban en ninguna migración (criterio 4 de la Fase 1: esquema reproducible).
-- Definición copiada de producción (consulta 10_buckets_produccion.sql, 2026-10-11): privados, 10 MB, carpeta propia por usuario.
-- Solo aditiva e idempotente: en producción no cambia nada (los buckets y políticas ya existen, sus archivos no se tocan);
-- en staging y en una base vacía los crea igual que en producción.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('portfolio-files', 'portfolio-files', false, 10485760, null),
  ('progress-photos', 'progress-photos', false, 10485760, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

do $p$ begin
  if not exists (select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'portfolio_files_owner') then
    create policy portfolio_files_owner on storage.objects as permissive for all to authenticated
      using (bucket_id = 'portfolio-files' and (storage.foldername(name))[1] = ((select auth.uid()))::text)
      with check (bucket_id = 'portfolio-files' and (storage.foldername(name))[1] = ((select auth.uid()))::text);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'progress_photos_owner') then
    create policy progress_photos_owner on storage.objects as permissive for all to authenticated
      using (bucket_id = 'progress-photos' and (storage.foldername(name))[1] = ((select auth.uid()))::text)
      with check (bucket_id = 'progress-photos' and (storage.foldername(name))[1] = ((select auth.uid()))::text);
  end if;
end $p$;
