# Supabase · esquema reproducible (Bloque 2)

## Estado (2026-10-08)
| Objeto | Producción `mgncykyrhavpepfggmng` | Staging `zpueziugbezqxompwsol` | En el repo |
|---|---|---|---|
| Tablas base (profiles, skin_*, gym_*, news_briefs, system_*, user_settings) | 3 migraciones iniciales (20261005…) | baseline 20261006234511 | `supabase/migrations/20261006234511_baseline…` |
| hub_records, hub_user_state, bucket hub-private | ✔ | ✔ | ✔ |
| `hub_financial_ingest` | ✔ 20261007111819 | ✔ 20261007111619 | solo `integrations/jarvis/financial-ingest.sql` |
| `payroll_*` (9 tablas, 8 vistas, 11 funciones), buckets `payroll`, `portfolio-files`, `progress-photos` | ✔ sin migración | ✔ sin migración | **falta** |

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
| Archivo | Qué hace | Riesgo | Rollback |
|---|---|---|---|
| `supabase/pending/20261008120000_harden_grants_and_functions.sql` | Quita privilegios de `anon` en 4 tablas heredadas; quita TRUNCATE/REFERENCES/TRIGGER a `authenticated`; vistas de payroll de solo lectura; `search_path` fijo; funciones trigger no invocables por API | Bajo: el frontend solo usa select/insert/update/delete y no llama a esas funciones; n8n usa service role | `…rollback.sql` |

Orden: staging → `get_advisors(security)` + `npm run test:e2e` → autorización de Renzo → producción.

## Copia de seguridad antes de cambios estructurales
- Supabase hace copias diarias automáticas (plan del proyecto: comprobar en Dashboard → Database → Backups).
- Antes de una migración de producción: `npx supabase db dump --data-only -f backup-AAAAMMDD.sql` con el proyecto de producción enlazado, guardado en `~/Projects/RENZO-HUB/backups/` (fuera del repo, contiene datos personales).
