# Renzo Hub · versión vigente

- **Producción (uso diario):** [renzo-hub.vercel.app](https://renzo-hub.vercel.app/) · release **2.4.1** · `dpl_HBnDnZqawHuTC9nUFcCsxoLnDeTs` · rama de producción actual `renzo-hub-2-1-production` (pasará a `main` al promocionar 2.6.0)
- **Staging (revisión aislada):** [renzo-hub-2-1-staging.vercel.app](https://renzo-hub-2-1-staging.vercel.app/) · release **2.6.0** (`dpl_DqxmaXsHC6tKFqCqQ9AWAibcZkx7`, commit `2becc17`); despliegue Git desde la rama `staging` (hoy 2.5.0 hasta fusionar el PR #2)
- **Experimental:** 2.6.0 Microapp OS Core · rama `experimental/os-core` (no se despliega)
- **Fuente canónica:** `github.com/rellmen/renzo-hub` (privado). `main` = 2.4.1, `staging` = 2.5.0, `feature/fase1` = Bloques 0 a 4. PR #1 (`sync/main-2.4.1` → `main`) y PR #2 (`feature/fase1` → `staging`) con CI en verde, pendientes de que Renzo los fusione
- **Copias de seguridad:** `~/Projects/RENZO-HUB/backups/` y versiones verificadas en `~/Projects/RENZO-HUB/releases/`
- **Proyectos Vercel:** `renzo-hub` (producción) y `renzo-hub-2-1-staging` (staging)
- **Supabase:** "Renzo Hub" `mgncykyrhavpepfggmng` (producción) y "Renzo Hub Staging" `zpueziugbezqxompwsol`
- **Referencias:** `RENZO_HUB_TECHNICAL_AUDIT.md` y `PHASE_1_EXECUTION_PLAN.md` (bóveda del proyecto y `~/Documents/HUB`)

> La carpeta `~/.codex/.chatgpt-projects/.../renzo-hub-news` queda como espejo histórico de solo lectura. No editar ni desplegar desde ella.

## Progreso Fase 1

| Fecha | Tarea | Resultado | Archivos | Pruebas | Commit / PR |
|---|---|---|---|---|---|
| 2026-10-08 | T0.1 Backup | Copias tar.gz de `renzo-hub-news` y `renzo-microapp-os-core-v1` + manifiestos SHA-256; config local separada (700/600) | n/a (fuera del repo) | Extracción y `shasum -c` OK (142 y 72 archivos); sin secretos en archivos | n/a |
| 2026-10-08 | T0.2 Recuperar versiones | 2.4.1 reconstruida desde Vercel; 2.5.0 y 2.6.0 desde local | `releases/` | 2.4.1: 35/35 SHA-1 = uid Vercel. 2.5.0: 37/38 (excepción doc `RENZO-HUB-CURRENT.md`) | n/a |
| 2026-10-08 | T0.5 Historia limpia (local) | Historia original conservada (7 commits); `main`=2.4.1, `staging`=2.5.0, `experimental/os-core`=2.6.0 | todo el árbol | Verificación de hashes en cada commit; `npm test` os-core 6/6 | `d7cdf75` v2.4.1 · `6c45462` v2.5.0 · `a05849b` v2.6.0-experimental |
| 2026-10-08 | T0.9 Script status | `scripts/renzo-hub` usa curl; detecta staging protegido por SSO | `scripts/renzo-hub` | Ejecutado: producción 2.4.1 detectada | rama `feature/block0-tooling` |
| 2026-10-08 | T0.3/T0.4/T0.7/T0.8 | Resuelto tras conectar GitHub (ver Bloque 0 · GitHub y Vercel). Protección de `main` no disponible en el plan gratuito (requiere GitHub Pro) | n/a | n/a | n/a |
| 2026-10-08 | Bloque 1 · fixes críticos (2.5.1) | `dbSource` + sync tolerante (B-01, B-02); Jarvis siempre a revisión (B-06); script externo `app.js` + CSP y cabeceras (S-07); sin registro público en la UI (S-02 código); `.vercelignore` (S-01); perfil corporal en `user_settings` (F-06) | `world.js`, `world-extensions.js`, `api/jarvis.js`, `index.html`, `app.js`, `profile.js`, `vercel.json`, `.vercelignore`, `sw.js`, `release.json` | `npm test` 8/8; smoke navegador 15/15 (móvil y escritorio, sin errores CSP); hashes del deployment = commit | `ecbdb2e` · staging preview `dpl_25mHhkFSz6FzqLU9of7GskmPpZWH` |
| 2026-10-08 | Tests y CI | Smoke Playwright, e2e con sesión (solo staging), servidor local con cabeceras Vercel, GitHub Actions | `tests/`, `tools/dev-server.mjs`, `.github/workflows/ci.yml`, `package.json` | Smoke 15/15 local y con valores ficticios de CI | rama `feature/block1-critical-fixes` |
| 2026-10-08 | Bloque 2 (preparación) | Migración de endurecimiento de permisos + rollback (**no aplicada**, requiere autorización); procedimiento de dump de `payroll_*` | `supabase/pending/`, `docs/SUPABASE-SCHEMA.md` | Revisión de firmas de funciones en staging | `5986a42` |
| 2026-10-08 | Bloque 3 · microapps Fase 1 (2.6.0) | Nutrición (comidas, kcal, proteína), Peso (registro diario + evolución), Hábitos (checklist en Home, configurable en Ajustes), Progreso 7 días con datos reales, XP con libro `xp_event` de ids deterministas | `phase1.js`, `index.html`, `app.js`, `profile.js`, `sw.js`, `release.json`, `tests/phase1.test.mjs`, `tests/e2e/authenticated.mjs` | `npm test` 12/12; smoke 15/15; e2e con sesión pendiente de usuario de staging | rama `feature/block3-microapps` |
| 2026-10-08 | Bloque 4 · diseño Jarvis | Separación Renzo HUB/Nodalys y autorización técnica con `request_approval` (botones Telegram + nonce + chat id verificado en código). **No aplicado**: no se edita el borrador activo de Jarvis | `docs/JARVIS-SEPARATION.md` | n/a | rama `feature/block3-microapps` |
| 2026-10-08 | Bloque 0 · GitHub y Vercel | Historial de GitHub integrado sin reescribir (merge `-s ours`, árbol = 2.4.1); ramas `staging`, `feature/fase1`, `experimental/os-core`, `legacy/chatgpt-local-main`; Vercel: staging construye solo `staging`, producción solo `main` | `.github/workflows/ci.yml` | CI en verde en PR #1 y PR #2 (check + 12 unit + smoke) | `d622776`, `6ae2bf2`, PR #1, PR #2 |
| 2026-10-08 | Bloque 2 · staging | Migración `harden_grants_and_functions` aplicada en Supabase staging | `supabase/pending/` | Privilegios extra 51 → 0; advisors: solo queda "leaked password protection" | n/a |
| 2026-10-08 | Bloque 4 · Jarvis/Nodalys implementado | Jarvis personal sin herramientas Nodalys + aprobación técnica + gastos a revisión; agente Nodalys en el flujo del bot Nodalys con aprobación por botones (CAS de un solo uso). Todo en borrador o inactivo | `docs/JARVIS-SEPARATION.md` | Ver checklist en `docs/JARVIS-SEPARATION.md`; respuestas del modelo bloqueadas por créditos de IA agotados | n8n `WH0kGpw0dg83yvdM`, `CHOL3mZnIrtM3rPy`, `v9C8W9OtTw1bSzFJ` (borradores) |

**Problemas encontrados:**
- Vercel (plan Hobby) bloquea despliegues con commits cuyo autor no es la cuenta de Renzo. Solución: commits con autor `rellmen` y coautor Claude.
- El proxy de esta sesión no permite push a `main` ni de tags, y las fusiones las hace Renzo.
- n8n: créditos de IA agotados ("Payment required"); afecta también a los flujos activos.
- Staging está protegido por Vercel SSO; la verificación se hace por hashes del deployment y con el servidor local que replica las cabeceras.
- El e2e con sesión necesita confirmar el usuario de pruebas de staging (email enviado a `renzojesus99+rhstaging@icloud.com`).
- En el Mac `NODE_ENV=production` hace que `npm install` omita devDependencies; para pruebas locales se usa `~/Projects/RENZO-HUB/tools/e2e-runner`.

**Pendiente de Renzo:** fusionar PR #1 y PR #2; confirmar el usuario de pruebas de staging (email); recargar créditos de IA de n8n; en Supabase (ambos entornos) desactivar registros y activar "leaked password protection"; OK para publicar los workflows de Jarvis/Nodalys.

**Siguiente tarea:** tras fusionar el PR #2, comprobar que staging (Git) sirve 2.6.0 y ejecutar `npm run test:e2e`; con tests en verde y autorización: migración de permisos en producción y promoción de 2.6.0 (PR `staging` → `main`).


## Cambios del release 2.5.0
- Las herramientas finales funcionan como microapps enfocadas: ocultan la navegación global mientras están abiertas.
- Gym · Ascend mantiene navegación interna exclusiva para Entrenar, Historial, Progreso y Coach.
- Gym, Food y Skin regresan a Body; News y Ajustes regresan a System; Car vuelve a Home.
- El layout de escritorio se expande al abrir una microapp y conserva el comportamiento móvil/PWA.
- Se preservan autenticación, Supabase y los cambios locales de integración Jarvis del release anterior.

## Cambios del release 2.4.1
- La API de Jarvis acepta la clave Supabase `SUPABASE_SECRET_KEY` y conserva compatibilidad con `SUPABASE_SERVICE_ROLE_KEY`.
- Gasto y nómina requieren un identificador estable para evitar duplicados al reintentar.
- Los reintentos no sobrescriben un movimiento ya registrado.
- API de Jarvis verificada en Producción con entrada configurada; salida Hub → Jarvis sigue desactivada.

## Cambios del release 2.4.0
- Ilustraciones vectoriales originales y a color para Study · Dutch, Work, Gym, Food, Skin, Car y News.
- Las ilustraciones responden al hover, foco de teclado y toque con movimiento sutil; se respeta reducir movimiento.
- Iconos de navegación con colores propios y brillo al seleccionar.
- Caché PWA renovada para que los móviles reciban los nuevos iconos.

## Comprobación rápida
Ejecutar `./scripts/renzo-hub status` desde el repositorio. Ninguna IA debe editar otra copia como si fuera la vigente.
