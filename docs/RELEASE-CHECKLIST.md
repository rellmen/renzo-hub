# Checklist de release · Renzo HUB

Flujo único: `feature/*` → PR a `staging` → validar → PR `staging` → `main` → producción (Vercel publica `main` automáticamente).
Nada se publica por CLI. Renzo fusiona los PR; Claude prepara y verifica.

## Reglas de publicación (decisión de Renzo, 16 oct 2026: `main` sin protección en GitHub)
`main` no tiene protección de rama; estas reglas la sustituyen y son obligatorias:
1. **Nunca** se fusiona a `main` una rama `feature/*` ni nada que no sea `staging`. Motivo: el PR #58 llegó a producción sin pasar por staging.
2. Antes de abrir o fusionar `staging` → `main`, todo lo pendiente hacia `staging` debe estar fusionado y desplegado en staging. Motivo: el #57 entró antes que el #60 y producción quedó con la caché vieja (hizo falta el #61).
3. Solo se fusiona con CI en verde (`test` y `db-migrations`) sobre el **último** commit del PR.
4. Si cambia cualquier fichero de la PWA, se renombra la caché de `sw.js` en el mismo PR; si no, los dispositivos instalados no reciben el cambio.
5. Tras publicar: `/api/deployment-info` con el commit esperado, `release.json`, caché nueva y smoke contra producción.

## 1. Antes de abrir el PR a staging
- [ ] Rama `feature/<tarea>` desde `staging` actualizado.
- [ ] `release.json` incrementado; caché de `sw.js` renombrada.
- [ ] `RENZO-HUB-CURRENT.md`: fila en la tabla de progreso.
- [ ] `npm run check` · `npm test` · `node tests/deploy-surface.test.mjs`.
- [ ] Servidor local (`npm run dev` con `SUPABASE_URL`/`SUPABASE_PUBLISHABLE_KEY` de **staging**): `node tests/e2e/smoke.mjs` 15/15 y `node tests/e2e/authenticated.mjs` 22/22.
- [ ] Nóminas: `node tests/e2e/payroll.mjs` (Chromium y WebKit).
- [ ] Migraciones: `sudo -E bash tools/db-replica/run.sh`, `pay_date_test.sh`, `payroll_schema_test.sh` en verde.

## 2. Después de fusionar en staging
- [ ] Deployment de `renzo-hub-2-1-staging` en verde para el commit del merge.
- [ ] `/release.json` = versión nueva; `/api/deployment-info` = preview / staging.
- [ ] Smoke y E2E contra la URL de staging (cookie de bypass por variable de entorno, nunca en el repo).
- [ ] Migración en staging (SQL Editor, proyecto **Renzo Hub Staging**) y verificación por SQL.

## 3. Producción (solo con OK explícito de Renzo)
- [ ] PR `staging` → `main` con resumen de la validación.
- [ ] Renzo fusiona. **No borrar la rama `staging`.**
- [ ] Deployment de `renzo-hub` en verde; `/release.json` = versión nueva; `/api/deployment-info` = production / main.
- [ ] Smoke 15/15 contra `https://renzo-hub.vercel.app` (el E2E con sesión no se ejecuta en producción).
- [ ] Migración de producción: Renzo la pega en el SQL Editor del proyecto de producción; verificación con la consulta de comprobación del archivo.
- [ ] Mover la migración de `supabase/pending/` a `supabase/migrations/` (rollback a `supabase/rollbacks/`) y actualizar `docs/SUPABASE-SCHEMA.md`.

## Rollback
- App: Vercel → Deployments → deployment anterior → **Instant Rollback**.
- Base de datos: archivo correspondiente de `supabase/rollbacks/` en el SQL Editor (staging primero).
