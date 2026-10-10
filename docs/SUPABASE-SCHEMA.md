# Supabase · esquema reproducible (Bloque 2)

## Estado (2026-10-10)
| Objeto | Producción `mgncykyrhavpepfggmng` | Staging `zpueziugbezqxompwsol` | En el repo |
|---|---|---|---|
| Tablas base (profiles, skin_*, gym_*, news_briefs, system_*, user_settings) | 3 migraciones iniciales (20261005…) | baseline 20261006234511 | `supabase/migrations/20261006234511_baseline…` |
| hub_records, hub_user_state, bucket hub-private | ✔ | ✔ | ✔ `20261007002619_…` |
| `hub_financial_ingest` | ✔ | ✔ | ✔ `20261007111619_jarvis_financial_ingest.sql` + `20261008140000_financial_ingest_always_review.sql` |
| `payroll_*`: 9 tablas, 10 vistas, 11 funciones, 4 triggers, 14 políticas, bucket `payroll`, Realtime | ✔ | ✔ | ✔ **`20261007200000_payroll_schema_baseline.sql`** (2026-10-10). Idéntico a staging elemento a elemento (`tools/db-replica/payroll_schema_test.sh`, huella en `tests/db/fixtures/payroll_schema_staging_2026-10-10.json`, md5 `793af6d3d9e56b3fe6ead9389f27ffd2`) |
| `harden_grants_and_functions` | ✔ aplicada 2026-10-10 02:20 (verificada 0/0/0) | ✔ 2026-10-08 y 2026-10-10 01:06 | ✔ `migrations/20261008120000_…` · rollback en `supabase/rollbacks/` |
| `financial_ingest_always_review` | ✔ aplicada 2026-10-10 02:20 (md5 `6756a66a…`) | ✔ 2026-10-08 | ✔ `migrations/20261008140000_…` |
| `payroll_pay_date_rule` (mes por fecha de cobro) | ✔ aplicada 2026-10-10 12:10 (verificada) | ✔ 2026-10-10 12:02 | ✔ `migrations/20261010030000_…` |
| `staging_revoke_maintain` | n/a | ✔ 2026-10-08 | `supabase/pending/` (solo staging) |
| Buckets `portfolio-files`, `progress-photos` | según auditoría del 8 oct, solo en producción | no existen | **falta**: requiere leer producción (bloqueado para Claude); pendiente |

**Estructura:** `supabase/migrations/` = aplicado en ambos entornos, en orden; una base vacía + todas las migraciones reproduce el esquema (probado). `supabase/rollbacks/` = deshacer (nunca se ejecutan automáticamente). `supabase/pending/` = no aplicado en producción.
**Comprobar producción:** ejecutar `para-produccion/9_comprobar_esquema_nominas.sql` (solo lectura) y comparar el md5 con el de staging.

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
| `20261008130000_staging_revoke_maintain.sql` | Solo staging | Iguala staging con la versión final (añade MAINTAIN). **Aplicada en staging 2026-10-08 08:47 UTC** | No toca filas | `…rollback.sql` (exacto, probado en réplica) |
| `20261008140000_financial_ingest_always_review.sql` | Staging (**aplicada 2026-10-08 08:47 UTC**) y después producción (no autorizado) | `hub_financial_ingest` deja de escribir directo en Money: todo va a AI Inbox `needs_review` (regla de Fase 1). Hoy ningún workflow activo la llama | No toca filas existentes | `…rollback.sql` (función original, md5 `14f7a531…`) |

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

## Aplicación en staging 2026-10-08 (autorizada por Renzo, solo staging)
1. Proyecto confirmado: `zpueziugbezqxompwsol` "Renzo Hub Staging" (PostgreSQL 17.11).
2. Copia previa (08:45 UTC) en `RENZO-HUB/backups/supabase-staging-2026-10-08T0845Z/`: privilegios de todas las tablas y vistas,
   md5 de las 15 funciones, definición completa de `hub_financial_ingest`, conteo de filas, datos de `profiles` (2) y `hub_user_state` (1)
   con su md5 calculado en el servidor, `restore.sql` y `SHA256SUMS`.
3. Revisión: ninguna sentencia borra o modifica filas (el `insert` de `hub_financial_ingest` solo se ejecuta cuando alguien llama a la función).
4. Rollback probado en réplica PG17 con los privilegios exactos de staging: vuelve al estado previo idéntico.
5. Después de aplicar (comprobado en el servidor):
   - `hub_financial_ingest` md5 `6756a66a…` = el calculado en local para el archivo del repo; resto de funciones idénticas a la copia.
   - authenticated: solo SELECT/INSERT/UPDATE/DELETE; sin TRUNCATE ni MAINTAIN; vistas payroll sin escritura; anon sin acceso.
   - Datos: conteos idénticos y md5 de `profiles` y `hub_user_state` idénticos a la copia.
6. Prueba funcional en staging (transacción revertida al final, `TEST_OK`): comida, peso sin duplicar, hábito, XP sin duplicar,
   progreso, ajustes, CHECK de `source`, RLS de escritura y lectura entre usuarios, anon denegado, gasto con confianza 0,99 → `needs_review`,
   reenvío → `duplicate`, nada en Money. Tras la prueba: 0 filas en `hub_records` y `user_settings` (no quedó nada).
7. Advisors de seguridad de staging: solo "leaked password protection" (se activa en el Dashboard).
