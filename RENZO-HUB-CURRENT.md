# Renzo Hub · versión vigente

- **Producción (uso diario):** [renzo-hub.vercel.app](https://renzo-hub.vercel.app/) · release **2.4.1** · `dpl_HBnDnZqawHuTC9nUFcCsxoLnDeTs` · rama de producción actual `renzo-hub-2-1-production` (pasará a `main` al promocionar 2.6.0)
- **Staging (revisión aislada):** [renzo-hub-2-1-staging.vercel.app](https://renzo-hub-2-1-staging.vercel.app/) · release **2.6.0** (`dpl_DqxmaXsHC6tKFqCqQ9AWAibcZkx7`, commit `2becc17`); despliegue Git desde la rama `staging` (hoy 2.5.0 hasta fusionar el PR #2). La rama `feature/fase1` va por **2.6.2** (estabilización y correcciones del E2E, sin funciones nuevas)
- **Experimental:** 2.6.0 Microapp OS Core · rama `experimental/os-core` (no se despliega)
- **Fuente canónica:** `github.com/rellmen/renzo-hub` (privado). `main` = 2.4.1, `staging` = 2.5.0, `feature/fase1` = Bloques 0 a 4. PR #1 (`sync/main-2.4.1` → `main`) y PR #2 (`feature/fase1` → `staging`) con CI en verde, pendientes de que Renzo los fusione
- **Copias de seguridad:** `~/Projects/RENZO-HUB/backups/` y versiones verificadas en `~/Projects/RENZO-HUB/releases/`
- **Proyectos Vercel:** `renzo-hub` (producción) y `renzo-hub-2-1-staging` (staging)
- **Supabase:** "Renzo Hub" `mgncykyrhavpepfggmng` (producción) y "Renzo Hub Staging" `zpueziugbezqxompwsol`
- **Referencias:** `RENZO_HUB_TECHNICAL_AUDIT.md` y `PHASE_1_EXECUTION_PLAN.md` (bóveda del proyecto y `~/Documents/HUB`)

> La carpeta `~/.codex/.chatgpt-projects/.../renzo-hub-news` queda como espejo histórico de solo lectura. No editar ni desplegar desde ella.

## Estado verificable de Fase 1 (2026-10-08, 11:25)

**Fase 1: desarrollo y pruebas completados en staging (E2E autenticado 22/22, dos ejecuciones seguidas). No se declara cerrada** hasta que Renzo complete los controles de seguridad de Supabase Auth (registro público y contraseñas filtradas) y fusione los PR. Producción sigue en 2.4.1.

### Funciona (verificado)
| Qué | Evidencia |
|---|---|
| Producción intacta en 2.4.1 | Ningún cambio en Vercel ni en la base de producción en esta fase (solo lecturas) |
| GitHub `rellmen/renzo-hub` | Acceso admin. Historial comparado: `main` ⊂ `staging` ⊂ `feature/fase1`; ramas antiguas de producción y preview contenidas en `sync/main-2.4.1`. Sin force-push. `feature/fase1` integra `staging` con un merge sin cambios de archivos |
| CI (GitHub Actions) | Verde en `feature/fase1` (check, unit, smoke). Nuevos: `tests/deploy-surface.test.mjs` (15/15 en local) y job `db-migrations` |
| Superficie publicada | Test: según `.vercelignore` no se publica ningún `.md`, `.sql`, script, test, `docs/`, `supabase/`, `.github/` ni `package.json`; tampoco claves secretas. Se añadieron `.gitignore` y `.vercelignore` a la lista (2.6.1) |
| Supabase staging: permisos | Migraciones `staging_revoke_maintain` y `financial_ingest_always_review` **aplicadas en staging** (autorizado) tras copia verificada (`backups/supabase-staging-2026-10-08T0845Z`, SHA-256 OK en el Mac). Datos idénticos antes y después. authenticated solo CRUD, anon sin acceso. Advisors: solo "leaked password protection" |
| Permisos y sincronización en staging real | Prueba en transacción revertida (`TEST_OK`): comida, peso sin duplicar, hábitos, XP sin duplicar, progreso, ajustes, CHECK de `source`, RLS entre usuarios, anon denegado, gasto importado → `needs_review`, reenvío → `duplicate`, nada directo en Money. No quedó ningún dato de prueba |
| Smoke test en el Mac contra Supabase staging | 15/15 (móvil y escritorio, cabeceras, sin registro público, sin errores CSP) |
| Microapps a nivel de base de datos | Réplica local PostgreSQL 17 con los privilegios reales: comidas, peso (sin duplicar), hábitos, XP sin duplicados, progreso, ajustes, RLS entre usuarios, CHECK de `source`, anon denegado (`tools/db-replica/run.sh`, todo OK) |
| Migraciones pendientes | Probadas en réplica: no tocan filas, son idempotentes y el rollback deja los privilegios idénticos a producción |
| Jarvis activo intacto | `WH0kGpw0dg83yvdM` activo = versión `adbc67d5` (7 oct, anterior a esta fase). Nodalys LinkedIn activo = `517bcda9`. Todos los workflows nuevos están inactivos |

### Despliegue de staging 2.6.2 (autorizado, 2026-10-08)
- PR #2 (`feature/fase1` → `staging`) fusionado por Renzo a las 11:48 (merge `cc183cf`, contiene `c25cbda`; árbol idéntico al commit aprobado `5c2df42`).
- Antes del merge: CI verde; Vercel staging usa solo variables *preview* con `SUPABASE_URL` = `zpueziugbezqxompwsol` (staging), sin clave de servicio; staging construye solo `staging`; producción ignora todo salvo `main`. Ninguna migración repetida.
- GitHub: estado "Vercel – renzo-hub-2-1-staging: success" (`dpl_Dq4qcEqQUmNB1WsQEHzSK8A1HibM`); "Vercel – renzo-hub" (producción) marcado success por la regla de ignorar. Actions en `staging`: verde.
- **Pendiente de verificar** (Mac sin conexión desde las 11:50): estado READY y commit del deployment, `release.json` = 2.6.2, pruebas contra la URL desplegada, documentos internos no expuestos, autenticación con Supabase staging. Staging tiene protección de Vercel (302 sin sesión): las pruebas se harán con `vercel curl` desde el Mac.

### Riesgo antes de producción: PR #1
El PR #1 (`sync/main-2.4.1` → `main`) añade `supabase/migrations/` a `main`. Producción tiene activadas las ramas de Supabase (branch `main`). Si el proyecto de producción está conectado al repo por la integración de GitHub de Supabase, fusionar en `main` podría aplicar esas migraciones (baseline de staging) en producción. No hay checks de Supabase en ningún commit, lo que sugiere que no está conectado, pero **hay que comprobarlo** en Supabase → Project Settings → Integrations → GitHub antes de fusionar nada en `main`.

### Diagnóstico del E2E autenticado (2026-10-08 11:05) y corrección (2.6.2, autorizada)
| Fallo | Causa verificada | Tipo | Corrección propuesta |
|---|---|---|---|
| Sincronización con registro de Jarvis | El test pulsa el primer `[data-open="system"]`, que es el botón oculto "← System". Con el botón visible: `Sincronizado con Supabase` con el registro de Jarvis presente | Error del test | Seleccionar el botón de la barra de navegación |
| Hábitos: definir y marcar | Los hábitos **sí se guardan** (Supabase: 2 hábitos y el perfil corporal intacto). El mensaje "Hábitos guardados." se escribe y se borra al instante porque el formulario se vuelve a dibujar | **Error de la app** (feedback invisible) | Mostrar el mensaje después de redibujar |
| Progreso y XP tras recargar | Sin duplicados: 4 eventos con id distinto (comida, 2 pesos, portfolio). El de portfolio se crea al recargar porque el XP solo se recalcula al abrir la app | Comportamiento: XP de Portfolio diferido | Recalcular XP al guardar en Portfolio, o ajustar el test |
| Sin errores JS | Solo `404 /api/jarvis`: el servidor local de pruebas no implementa la función de Vercel | Entorno de prueba | Simular `/api/jarvis` en `tools/dev-server.mjs` |

Hallazgo adicional: el texto de la tarjeta Jarvis en System decía que Jarvis "registra en Money" con confianza alta; corregido en 2.6.2.

Correcciones aplicadas en `feature/fase1` (2.6.2, commits `ae786a8` y `c25cbda`, CI verde): aviso de hábitos visible; evento `renzo:synced` desde world.js y Portfolio para que el XP se registre al guardar; texto de Jarvis; test con el botón visible de System; `GET /api/jarvis` simulado en el servidor local.

### No funciona o no verificado
| Qué | Motivo |
|---|---|
| E2E autenticado (Mac, app 2.6.2 servida en local + Supabase staging real) | 11:03 → 18/22 (diagnóstico abajo). Tras las correcciones: **22/22** a las 11:16 y **22/22** a las 11:20, smoke 15/15. Login, 12 secciones, perfil corporal, Portfolio, Nutrición, Peso, Hábitos, Progreso/XP sin duplicados, sin errores JS. Archivos probados idénticos (hash git) al commit `c25cbda`. En la base: 4 ejecuciones dejan 2 pesos (uno por día), 1 hábito y 8 eventos XP con id distinto (sin duplicados) |
| Inspección de los deployments de Vercel | El conector de Vercel de esta sesión no ve ningún equipo (`list_teams` vacío, `403` en el equipo `renzojesus99-1996`). Staging responde 302 (protección de Vercel activa) |
| Respuestas de IA de Jarvis/Nodalys | n8n sin créditos de IA ("Payment required") |
| Protección de `main` | GitHub exige plan Pro para ramas protegidas o rulesets en repos privados |

### Solo preparado (no aplicado)
- `supabase/pending/20261008120000_harden_grants_and_functions.sql` (producción) con rollback exacto.
- `supabase/pending/20261008140000_financial_ingest_always_review.sql` en **producción** (en staging ya aplicada): en producción `hub_financial_ingest` aún puede escribir directo en Money si la confianza es ≥ 0,90. Ningún workflow activo la llama.
- Workflows nuevos de Jarvis personal y Nodalys (borradores/inactivos, ver `docs/JARVIS-SEPARATION.md`).

### Necesita autorización o acción de Renzo
1. **Confirmar el usuario de pruebas** de staging (o autorizar confirmarlo por SQL) y tener el Mac encendido para el E2E.
2. PR #2 fusionado. **No fusionar PR #1** hasta comprobar la integración GitHub de Supabase en producción (ver riesgo arriba).
3. **Conector de Vercel**: al autorizarlo, incluir el equipo `renzojesus99-1996` (esta sesión no ve ningún equipo).
4. Supabase (ambos entornos): **desactivar registros públicos** y **activar leaked password protection** (Dashboard → Authentication).
5. Producción: no autorizado por ahora (migraciones `20261008120000` y `20261008140000` listas).
6. Créditos de IA en n8n y OK para publicar los workflows nuevos.
7. Opcional: GitHub Pro para proteger `main`. Alternativa sin coste: regla de trabajo "solo Renzo fusiona" (ya aplicada en la práctica) o hacer el repo público (no recomendado: datos personales en el historial).

### Hallazgos menores
- `assets/skin_*.jpeg` (fotos de productos de skincare) son públicas en Vercel. No contienen datos personales sensibles; si se prefiere privacidad total, moverlas al bucket privado.
- El webhook de prueba de Jarvis (`jarvis-hub-test-…`) está protegido por la comprobación de ejecución manual.

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
| 2026-10-08 | Estabilización (2.6.1) | Verificación GitHub, superficie publicada, migraciones en réplica PG17, rollback exacto, `hub_financial_ingest` al repo, revisión obligatoria preparada | `.vercelignore`, `release.json`, `sw.js`, `.github/workflows/ci.yml`, `supabase/`, `tests/db/`, `tests/deploy-surface.test.mjs`, `tools/db-replica/`, `docs/SUPABASE-SCHEMA.md` | unit 15/15; réplica: todo OK; E2E autenticado **pendiente** | rama `feature/fase1` |
| 2026-10-08 | Staging: migraciones y E2E | Copia verificada; `staging_revoke_maintain` y `financial_ingest_always_review` aplicadas en staging; correcciones 2.6.2; E2E autenticado 22/22 (x2) | `phase1.js`, `world.js`, `world-extensions.js`, `jarvis-ui.js`, `tools/dev-server.mjs`, `tests/e2e/authenticated.mjs`, `release.json`, `sw.js`, `docs/SUPABASE-SCHEMA.md` | Permisos y sincronización en staging `TEST_OK`; E2E 22/22; smoke 15/15; unit 15/15; CI verde | `d542ce9`…`c25cbda` |

**Problemas encontrados:**
- Vercel (plan Hobby) bloquea despliegues con commits cuyo autor no es la cuenta de Renzo. Solución: commits con autor `rellmen` y coautor Claude.
- El proxy de esta sesión no permite push a `main` ni de tags, y las fusiones las hace Renzo.
- n8n: créditos de IA agotados ("Payment required"); afecta también a los flujos activos.
- Staging está protegido por Vercel SSO; la verificación se hace por hashes del deployment y con el servidor local que replica las cabeceras.
- El e2e con sesión necesita confirmar el usuario de pruebas de staging (email enviado a `renzojesus99+rhstaging@icloud.com`).
- En el Mac `NODE_ENV=production` hace que `npm install` omita devDependencies; para pruebas locales se usa `~/Projects/RENZO-HUB/tools/e2e-runner`.

**Pendiente de Renzo:** ver "Necesita autorización o acción de Renzo" arriba.

**Siguiente tarea:** Renzo: Supabase Auth (desactivar registro público y activar contraseñas filtradas, ambos entornos) y fusionar PR #1 y PR #2. Después: comprobar que el despliegue Git de staging sirve 2.6.2. Producción (migraciones `20261008120000` + `20261008140000` y promoción a `main`) solo con autorización expresa.


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
