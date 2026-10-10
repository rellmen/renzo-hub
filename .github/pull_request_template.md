## Qué cambia
<!-- Una o dos frases. Qué verá Renzo en la app. -->

## Tipo
- [ ] `feature/*` → `staging` (pruebas)
- [ ] `staging` → `main` (producción, solo con OK explícito de Renzo)

## Checklist (ver `docs/RELEASE-CHECKLIST.md`)
- [ ] `release.json` incrementado y caché de `sw.js` cambiada
- [ ] `RENZO-HUB-CURRENT.md` actualizado
- [ ] `npm run check` y `npm test` en verde
- [ ] Smoke 15/15 y E2E con sesión 22/22 (servidor local + Supabase staging)
- [ ] Si toca Nóminas: E2E de Nóminas (Chromium y WebKit)
- [ ] Si hay migración: probada en réplica (`tools/db-replica/*.sh`), con rollback en `supabase/rollbacks/`, idempotente
- [ ] Sin claves, tokens ni datos personales en el diff
- [ ] **No borrar la rama `staging` al fusionar**

## Migraciones
<!-- Ninguna / nombre del archivo, entorno y orden de aplicación (staging primero). -->

## Rollback
<!-- App: Instant Rollback en Vercel al deployment anterior. BD: archivo de supabase/rollbacks/. -->
