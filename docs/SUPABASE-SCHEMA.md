# Supabase · esquema reproducible (Bloque 2)

## Estado (2026-10-08)
| Objeto | Producción `mgncykyrhavpepfggmng` | Staging `zpueziugbezqxompwsol` | En el repo |
|---|---|---|---|
| Tablas base (profiles, skin_*, gym_*, news_briefs, system_*, user_settings) | 3 migraciones iniciales (20261005…) | baseline 20261006234511 | `supabase/migrations/20261006234511_baseline…` |
| hub_records, hub_user_state, bucket hub-private | ✔ | ✔ | ✔ |
| `hub_financial_ingest` | ✔ 20261007111819 | ✔ 20261007111619 | ✔ `supabase/migrations/20261007111619_jarvis_financial_ingest.sql` (md5 del cuerpo idéntico en ambos entornos: `14f7a531…`) |
| `payroll_*` (9 tablas, 8 vistas, 11 funciones), buckets `payroll`, `portfolio-files`, `progress-photos` | ✔ sin migración | ✔ sin migración | **falta** (solo stubs de privilegios en `tools/db-replica/payroll_stub.sql`) |
| `harden_grants_and_functions` | **no aplicada** | ✔ 20261008022540 (versión sin MAINTAIN) | `supabase/pending/` |

## Procedimiento para T2.1 (dump exacto, solo esquema, sin datos)
Requiere la contraseña de la base de datos de **staging** (la introduce Renzo; nunca va al repo):

```sh
npx supabase@latest login                      # abre el navegador
npx supabase@latest link --project-ref zpueziugbezqxompwsol
npx supabase@latest db dump --schema public,storage -f /tmp/staging-schema.sql
```

Después se extraen los objetos `payroll_*` y los buckets a
`supabase/migrations/20261008110000_payroll_schema_baseline.sql`, convertidos a `create … if not exists`,
y se comprueba en un **branch de Supabase o proyecto vacío** que la migración se aplica sin errores.

## Migraciones pendientes de autorización
| Archivo | Entorno | Qué hace | Datos | Rollback |
|---|---|---|---|---|
| `20261008120000_harden_grants_and_functions.sql` | Producción | Quita a `anon` todos los privilegios en 4 tablas heredadas; quita TRUNCATE/REFERENCES/TRIGGER/MAINTAIN a `authenticated`; vistas payroll de solo lectura; `search_path` fijo en 4 funciones; funciones de trigger no invocables por API | No toca filas: solo GRANT/REVOKE y ALTER FUNCTION ... SET | `…rollback.sql`, **exacto**: generado desde los privilegios reales de producción leídos el 2026-10-08 |
| `20261008130000_staging_revoke_maintain.sql` | Solo staging | Iguala staging con la versión final (añade MAINTAIN) | No toca filas | `grant maintain … to authenticated` |
| `20261008140000_financial_ingest_always_review.sql` | Staging y después producción | `hub_financial_ingest` deja de escribir directo en Money: todo va a AI Inbox `needs_review` (regla de Fase 1). Hoy ningún workflow activo la llama | No toca filas existentes | `…rollback.sql` (función original, md5 `14f7a531…`) |

### Verificación sin tocar Supabase: réplica local
`tools/db-replica/run.sh` (también en GitHub Actions, job `db-migrations`) levanta PostgreSQL 17, carga las migraciones del repo,
stubs de `payroll_*` y **los privilegios exactos de producción** (`tests/db/fixtures/prod_acl_2026-10-08.*`), y comprueba:
1. Migración de endurecimiento: anon sin acceso, authenticated solo CRUD, vistas payroll de solo lectura, `search_path` fijo,
   triggers no invocables, `gym_*`/`hub_*` sin cambios, idempotente.
2. La app sigue funcionando con los permisos nuevos (`tests/db/staging_authenticated_rls.sql`): comidas, peso (upsert sin duplicar),
   hábitos, XP sin duplicados, lectura de progreso, ajustes, CHECK de `source`, RLS entre usuarios, sin TRUNCATE, anon denegado.
3. El trigger SECURITY DEFINER de nóminas sigue disparando tras revocar EXECUTE.
4. El rollback deja los privilegios **idénticos** al estado inicial de producción.
5. `hub_financial_ingest` con confianza 0.99 → `needs_review`; reenvío → `duplicate`; rollback restaura la función original.

Resultado 2026-10-08: **todo OK** en local.

### Orden de aplicación
1. Staging: `20261008130000` y `20261008140000` (requiere OK: cambia permisos y una función).
2. `tests/db/staging_authenticated_rls.sql` en staging (se deshace solo) + `npm run test:e2e`.
3. Copia de seguridad de producción (abajo) y OK explícito de Renzo.
4. Producción: `20261008120000` y `20261008140000`; después `get_advisors(security)` y smoke test.
5. Si algo falla: aplicar el `*.rollback.sql` correspondiente (solo privilegios o la función; no hay datos que restaurar).

## Copia de seguridad antes de cambios estructurales
- Supabase hace copias diarias automáticas (plan del proyecto: comprobar en Dashboard → Database → Backups).
- Antes de una migración de producción: `npx supabase db dump --data-only -f backup-AAAAMMDD.sql` con el proyecto de producción enlazado, guardado en `~/Projects/RENZO-HUB/backups/` (fuera del repo, contiene datos personales).

## Procedimiento de recuperación
| Situación | Acción | Tiempo |
|---|---|---|
| La app pierde acceso a datos tras la migración de permisos | Ejecutar `20261008120000_…rollback.sql` en el SQL Editor del entorno afectado | < 1 min |
| Jarvis/n8n falla al registrar gastos tras `20261008140000` | Ejecutar `20261008140000_…rollback.sql` | < 1 min |
| Pérdida o corrupción de datos | Dashboard → Database → Backups → restaurar la copia diaria (o PITR si el plan lo incluye); o reimportar `backup-AAAAMMDD.sql` | según tamaño |
| Esquema de staging roto | Recrear staging aplicando `supabase/migrations/` en orden (falta `payroll_*`, ver T2.1) | ~10 min |
