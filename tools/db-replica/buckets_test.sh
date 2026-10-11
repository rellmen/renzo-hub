#!/usr/bin/env bash
# Comprueba la migración de buckets 20261011120000 contra una réplica de PostgreSQL 17:
#  A) base vacía + todas las migraciones -> los 4 buckets y sus políticas quedan IGUAL que en producción (consulta 10, 2026-10-11);
#  B) base con los buckets ya creados y archivos dentro (estado de producción) -> la migración no cambia nada.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
PGBIN=/usr/lib/postgresql/17/bin
WORK="$(mktemp -d)"; PORT=55436; chmod 777 "$WORK"
run_pg(){ if [ "$(id -u)" = 0 ]; then su postgres -s /bin/bash -c "$*"; else bash -c "$*"; fi; }
cleanup(){ run_pg "$PGBIN/pg_ctl -D $WORK/data -m immediate stop" >/dev/null 2>&1 || true; rm -rf "$WORK"; }
trap cleanup EXIT
run_pg "$PGBIN/initdb -D $WORK/data -U postgres -A trust >/dev/null"
run_pg "$PGBIN/pg_ctl -D $WORK/data -o '-p $PORT -k $WORK' -l $WORK/log -w start >/dev/null"
cp "$ROOT"/tools/db-replica/bootstrap.sql "$ROOT"/supabase/migrations/*.sql "$WORK/"; chmod 644 "$WORK"/*.sql
MIG=20261011120000_storage_portfolio_progress_buckets.sql
state(){ $1 -c "select b.id||'|'||b.public||'|'||b.file_size_limit||'|'||coalesce(b.allowed_mime_types::text,'null') from storage.buckets b order by 1;
  select policyname||'|'||cmd||'|'||array_to_string(roles,',')||'|'||coalesce(qual,'')||'|'||coalesce(with_check,'') from pg_policies
  where schemaname='storage' and policyname in ('portfolio_files_owner','progress_photos_owner') order by 1;
  select bucket_id||'|'||name from storage.objects order by 1"; }

echo "A) Base vacía + cadena completa de migraciones"
P="$PGBIN/psql -h $WORK -p $PORT -U postgres -v ON_ERROR_STOP=1 -qtA"
$P -f "$WORK/bootstrap.sql" >/dev/null; $P -c "create publication supabase_realtime;" >/dev/null
for f in "$WORK"/2026*.sql; do $P -f "$f" >/dev/null 2>"$WORK/err" || { cat "$WORK/err"; echo "FALLO en $(basename "$f")"; exit 1; }; done
state "$P" > "$WORK/a.txt"
expected="hub-private|false|10485760|{image/jpeg,image/png,image/webp,application/pdf,text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet}
payroll|false|20971520|{application/pdf,image/jpeg,image/png,image/heic}
portfolio-files|false|10485760|null
progress-photos|false|10485760|{image/jpeg,image/png,image/webp}"
diff <(head -4 "$WORK/a.txt") <(echo "$expected") && echo "  OK  4 buckets privados con tamaño y tipos idénticos a producción" || { echo "FALLO buckets"; exit 1; }
for b in portfolio-files progress-photos; do
  pol=$(grep -c "^$( [ $b = portfolio-files ] && echo portfolio_files_owner || echo progress_photos_owner )|ALL|authenticated|.*bucket_id = '$b'::text.*foldername(name))\[1\] = (( SELECT auth.uid() AS uid))::text.*|.*bucket_id = '$b'" "$WORK/a.txt" || true)
  [ "$pol" = 1 ] && echo "  OK  política de $b: ALL, authenticated, solo su carpeta (lectura y escritura), igual que producción" || { echo "FALLO política $b"; grep "$b" "$WORK/a.txt"; exit 1; }
done
$P -f "$WORK/$MIG" >/dev/null && state "$P" | diff -q - "$WORK/a.txt" >/dev/null && echo "  OK  idempotente"

echo "B) Estado de producción (buckets y políticas ya existen, con archivos) + migración"
$P -c "create database prod;" >/dev/null
Q="$PGBIN/psql -h $WORK -p $PORT -U postgres -d prod -v ON_ERROR_STOP=1 -qtA"
grep -v "^create role" "$WORK/bootstrap.sql" > "$WORK/bootstrap_db.sql"; $Q -f "$WORK/bootstrap_db.sql" >/dev/null
$Q -c "insert into storage.buckets values ('portfolio-files','portfolio-files',false,10485760,null),('progress-photos','progress-photos',false,10485760,'{image/jpeg,image/png,image/webp}');
create policy portfolio_files_owner on storage.objects for all to authenticated using (bucket_id = 'portfolio-files' and (storage.foldername(name))[1] = ((select auth.uid()))::text) with check (bucket_id = 'portfolio-files' and (storage.foldername(name))[1] = ((select auth.uid()))::text);
create policy progress_photos_owner on storage.objects for all to authenticated using (bucket_id = 'progress-photos' and (storage.foldername(name))[1] = ((select auth.uid()))::text) with check (bucket_id = 'progress-photos' and (storage.foldername(name))[1] = ((select auth.uid()))::text);
insert into storage.objects(bucket_id,name) values ('portfolio-files','u/a.pdf'),('portfolio-files','u/b.pdf'),('portfolio-files','u/c.pdf');" >/dev/null
state "$Q" > "$WORK/b0.txt"; $Q -f "$WORK/$MIG" >/dev/null; state "$Q" > "$WORK/b1.txt"
diff -q "$WORK/b0.txt" "$WORK/b1.txt" >/dev/null && echo "  OK  sin cambios: mismos buckets, políticas y los 3 archivos intactos" || { diff "$WORK/b0.txt" "$WORK/b1.txt"; echo "FALLO: cambia producción"; exit 1; }

echo "C) Rollback (solo staging)"
$P -f "$ROOT/supabase/rollbacks/${MIG%.sql}.rollback.sql" >/dev/null
[ "$($P -c "select count(*) from pg_policies where policyname in ('portfolio_files_owner','progress_photos_owner')")" = 0 ] && echo "  OK  quita las 2 políticas" || exit 1
echo "TODO OK"
