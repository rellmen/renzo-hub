# Renzo Hub · versión vigente

- **Producción (uso diario):** [renzo-hub.vercel.app](https://renzo-hub.vercel.app/) · release **2.10.1** (nóminas por mes de cobro y tipo) · rama `main`, commit `b73d505` (merge del PR #20) · verificada 2026-10-10: READY, `release.json` 2.10.1, `deployment-info` production/main, smoke 15/15. Migraciones: todas las de `supabase/migrations/` hasta 20261010030000 (ver `docs/SUPABASE-SCHEMA.md`). Rollback app: Instant Rollback en Vercel
- **Staging (revisión aislada):** [renzo-hub-2-1-staging.vercel.app](https://renzo-hub-2-1-staging.vercel.app/) · release **2.10.1** · rama `staging` · **No borrar la rama `staging` al fusionar PRs.**
- **Experimental:** 2.6.0 Microapp OS Core · rama `experimental/os-core` (no se despliega)
- **Fuente canónica:** `github.com/rellmen/renzo-hub` (privado). `main` = producción, `staging` = pruebas, `feature/*` = una rama por tarea con PR hacia `staging`
- **Copias de seguridad:** `~/Projects/RENZO-HUB/backups/` y versiones verificadas en `~/Projects/RENZO-HUB/releases/`
- **Proyectos Vercel:** `renzo-hub` (producción) y `renzo-hub-2-1-staging` (staging)
- **Supabase:** "Renzo Hub" `mgncykyrhavpepfggmng` (producción) y "Renzo Hub Staging" `zpueziugbezqxompwsol`
- **Referencias:** `RENZO_HUB_TECHNICAL_AUDIT.md` y `PHASE_1_EXECUTION_PLAN.md` (bóveda del proyecto y `~/Documents/HUB`)

> La carpeta `~/.codex/.chatgpt-projects/.../renzo-hub-news` queda como espejo histórico de solo lectura. No editar ni desplegar desde ella.

## 2.10.2 (2026-10-11): buckets de producción en migraciones · criterio 4 de Fase 1

- Consulta 9 (huella del esquema de Nóminas) en producción = `793af6d3d9e56b3fe6ead9389f27ffd2`, idéntica a staging. Staging se reproduce con la cadena de migraciones, así que producción también.
- Consulta 10 (buckets): `hub-private` y `payroll` iguales en ambos entornos. Producción tenía además `portfolio-files` (3 archivos) y `progress-photos` (vacío), sin migración y sin existir en staging.
- Nueva migración aditiva `20261011120000_storage_portfolio_progress_buckets.sql` (definición copiada de producción; en producción no cambia nada) y rollback solo para staging.
- Prueba `tools/db-replica/buckets_test.sh` (también en CI): base vacía + todas las migraciones = buckets y políticas de producción; estado de producción + migración = sin cambios y archivos intactos; idempotente; rollback.
- Pendiente: aplicar la migración en staging (Renzo, SQL Editor de "Renzo Hub Staging") y comprobar. Con eso el criterio 4 queda cerrado.
- **Decisión de Renzo (2026-10-11): los criterios 5 (staging para Jarvis) y 8 (separación Nodalys) pasan a la Fase 2.** No bloquean nada: las nóminas se suben desde la app sin n8n. La Fase 1 se cierra con 6 de 8 criterios en cuanto el criterio 4 quede comprobado en staging.
- Petición de Renzo: al terminar cada cambio, darle siempre el enlace del PR hacia `staging` (y el del SQL Editor de staging si hay migración).
- Extracto ING de septiembre: confirma las 7 nóminas (3.376,15 €). La nº 19 se cobró el 2 sep (junto con la nº 20) y la nº 22 el 11 sep; la app muestra 1 y 10 sep (fecha del documento). Pendiente de decisión de Renzo: importar el CSV del banco para marcar "cobrada en banco" con la fecha real.

## Estado verificable de Fase 1 (2026-10-08, 12:15)

**Fase 1: 2.6.2 publicada y validada en staging** (smoke 15/15 y E2E autenticado 22/22 contra la URL desplegada). No se declara cerrada hasta completar los controles de Supabase Auth (registro público y contraseñas filtradas). Producción sigue en 2.4.1 sin cambios.

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
| Comprobación | Resultado |
|---|---|
| PR #2 | Fusionado por Renzo 11:48, merge `cc183cf`; contiene `c25cbda`; árbol idéntico a `5c2df42` (aprobado). Destino `staging` |
| GitHub Actions | Verde antes del merge (`5c2df42`) y en el push a `staging` |
| Vercel staging | `dpl_Dq4qcEqQUmNB1WsQEHzSK8A1HibM` **READY**, rama `staging`, commit `cc183cf`, alias `renzo-hub-2-1-staging.vercel.app` |
| Supabase usado por staging | Variables solo *preview*; `SUPABASE_URL` y `/api/supabase-config` = `zpueziugbezqxompwsol` (staging), clave publishable. Sin clave de servicio |
| Producción durante el merge | El proyecto `renzo-hub` canceló su build (regla: solo `main`). `renzo-hub.vercel.app` sigue en **2.4.1**; migraciones de producción sin cambios |
| Migraciones | Ninguna repetida ni aplicada (staging sin integración de ramas) |
| URL desplegada: `release.json` y `deployment-info` | 2.6.2 · `preview` · `renzo-hub-2-1-staging` · `staging` |
| Cabeceras | CSP `script-src 'self' cdn.jsdelivr.net`, HSTS, `nosniff`, `X-Frame-Options: DENY`, Referrer-Policy, Permissions-Policy |
| Documentos internos | 19 rutas (`*.md`, `docs/`, `supabase/`, `scripts/`, `tests/`, `tools/`, `.github/`, `package*.json`, `.env`, `.vercelignore`, `.gitignore`, `integrations/`, `os-core/`) → **404**; app (8 rutas) → 200 |
| Protección de Vercel | Sin sesión → 302 (login de Vercel) |
| Smoke contra la URL desplegada | **15/15** (móvil y escritorio) |
| E2E autenticado contra la URL desplegada | **22/22** (login, 12 secciones, perfil, Portfolio, Nutrición, Peso, Hábitos, Progreso/XP sin duplicados, sin errores JS) |

Las pruebas contra la URL protegida usan el secreto *automation-bypass* que ya existía en el proyecto (creado el 7 oct); se lee en memoria y nunca se escribe ni se muestra.

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

## Comprobaciones previas a producción (2026-10-09) · RESULTADO: BLOQUEADO

| Comprobación | Resultado |
|---|---|
| Integración GitHub de Supabase | **No conectada** en producción ni en staging (panel Integrations: "Connect GitHub"). Fusionar en `main` no aplica migraciones |
| Registro público | **Activado** en producción y staging ("Allow new users to sign up" = on). Pendiente de Renzo |
| Contraseñas filtradas | **No disponible**: Supabase lo limita al plan Pro. Alternativa: longitud mínima 12 (hoy 6) y requisitos de caracteres |
| Backup de Supabase | El plan Free **no tiene copias** ni PITR. Copia propia de solo lectura: 20 tablas, 648 filas, permisos, funciones, políticas, usuarios y lista de storage (sin el contenido de los archivos). SHA-256 `e9bb3e26…` verificado en el Mac (`~/Documents/HUB/supabase-prod-2026-10-09.tgz`; Desktop Commander offline, pendiente moverla a `~/Projects/RENZO-HUB/backups/`). Restauración no destructiva `tools/backup/snapshot_to_sql.py` probada en réplica (tablas no payroll; payroll requiere su esquema real, T2.1) |
| Migraciones | `20261008140000` idéntica a la probada y aplicada en staging (sha256 `f45f7966…`). `20261008120000` **actualizada** porque producción cambió: 2 vistas nuevas (`payroll_v_monthly_nl`, `payroll_v_jaaropgave_nl`, creadas el 8 oct fuera del repo, también en staging) con todos los privilegios para anon (sin fuga real: `security_invoker` y anon sin acceso a las tablas base). Nueva versión: revoca anon en todo `public`, vistas solo lectura y quita anon de los privilegios por defecto. Réplica con privilegios de producción del 9 oct: todo OK y rollback idéntico |
| Producción | **Ya no es 2.4.1: sirve 2.8.0 "Nóminas"** sin commit en GitHub. Contiene la base de Fase 1 (CSP, sin registro, documentos internos 404) + `payroll.js`, pero **no** las correcciones 2.6.2 (`phase1.js`, `world.js`, `world-extensions.js`, `jarvis-ui.js` difieren; `gym.js`, `news.js`, `profile.js` iguales) |

**Consecuencia:** el plan "promocionar 2.6.2 a producción" ya no es válido: sustituiría 2.8.0 y **quitaría el módulo de Nóminas**. Antes hay que llevar el código de 2.8.0 a GitHub, integrarlo con 2.6.2 y validarlo en staging. No se ha creado el PR `staging → main` ni se ha tocado producción.

## Informe de preparación para producción (no autorizado aún, OBSOLETO desde 2026-10-09)

**Por qué conviene promocionar pronto:** producción 2.4.1 publica hoy documentos internos: `/AGENTS.md`, `/JARVIS-CONNECTION.md`, `/RENZO-HUB-CURRENT.md`, `/RENZO-HUB-2.1-IMPLEMENTACION-Y-VALIDACION.md`, `/scripts/renzo-hub` y `/supabase/migrations/…baseline….sql` responden 200 (comprobado 12:15). Además, en 2.4.1 `/api/jarvis` puede registrar gastos directo en Money y `hub_financial_ingest` también. 2.6.2 corrige todo esto.

| # | Paso | Quién | Estado |
|---|---|---|---|
| 1 | Supabase Auth en producción y staging: desactivar registro público, activar contraseñas filtradas | Renzo (Dashboard) | Pendiente |
| 2 | Comprobar en Supabase producción → Integrations → GitHub si `rellmen/renzo-hub` está conectado (producción tiene ramas de Supabase, branch `main`). Si lo está, desconectarlo o confirmar que no aplica migraciones al fusionar en `main` | Renzo | Pendiente, **bloquea el PR #1** |
| 3 | Copia de seguridad de producción: Dashboard → Database → Backups (descargar la última) y, si es posible, `supabase db dump` con la contraseña de la base | Renzo | Pendiente |
| 4 | Aplicar en producción `20261008120000_harden_grants_and_functions.sql` y `20261008140000_financial_ingest_always_review.sql` (probadas en réplica con los privilegios reales de producción; rollback exacto) | Claude con OK de Renzo | Preparado |
| 5 | PR `staging` → `main` (sustituye al PR #1) con 2.6.2; Renzo fusiona | Claude prepara, Renzo fusiona | Preparado |
| 6 | Vercel `renzo-hub`: cambiar rama de producción de `renzo-hub-2-1-production` a `main` (las variables de producción ya existen: `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`, `JARVIS_INBOUND_TOKEN`, `JARVIS_OWNER_ID`) | Claude con OK de Renzo | Preparado |
| 7 | Verificación en producción: READY, commit, `release.json` 2.6.2, documentos internos 404, smoke; E2E autenticado **no** se ejecuta en producción | Claude | Preparado |
| 8 | Rollback: Vercel "Instant Rollback" a `dpl_HBnDnZqawHuTC9nUFcCsxoLnDeTs` (2.4.1) y `*.rollback.sql` | Claude con OK | Preparado |
| 9 | Jarvis/Nodalys: publicación de workflows (decisión aparte, requiere créditos de IA en n8n) | Renzo | Fuera de este despliegue |

Riesgos conocidos: el XP se calcula también para datos antiguos la primera vez que Renzo abra 2.6.2 en producción (eventos con id determinista, sin duplicados); el perfil corporal de Renzo debe rellenarse en Ajustes (2.6 ya no lo trae escrito en el código).

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
| 2026-10-08 | Despliegue staging 2.6.2 | PR #2 fusionado; deployment READY con `cc183cf`; validación contra la URL desplegada | `tests/e2e/smoke.mjs`, `tests/e2e/authenticated.mjs` (bypass por variable de entorno) | smoke 15/15, E2E 22/22, 19 rutas internas 404, Supabase staging confirmado | `cc183cf`, `477443b` |

**Problemas encontrados:**
- Vercel (plan Hobby) bloquea despliegues con commits cuyo autor no es la cuenta de Renzo. Solución: commits con autor `rellmen` y coautor Claude.
- El proxy de esta sesión no permite push a `main` ni de tags, y las fusiones las hace Renzo.
- n8n: créditos de IA agotados ("Payment required"); afecta también a los flujos activos.
- Staging está protegido por Vercel SSO; la verificación se hace por hashes del deployment y con el servidor local que replica las cabeceras.
- El e2e con sesión necesita confirmar el usuario de pruebas de staging (email enviado a `renzojesus99+rhstaging@icloud.com`).
- En el Mac `NODE_ENV=production` hace que `npm install` omita devDependencies; para pruebas locales se usa `~/Projects/RENZO-HUB/tools/e2e-runner`.

**Pendiente de Renzo:** ver "Necesita autorización o acción de Renzo" arriba.

**Siguiente tarea:** pasos 1 a 3 del informe de preparación para producción (Renzo). Después, con autorización expresa, pasos 4 a 8.


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

## Nóminas · trabajo preparado para staging (2.7.0)

| Fecha | Tarea | Resultado | Archivos | Pruebas | Commit / PR |
|---|---|---|---|---|---|
| 2026-10-08 | Módulo Nóminas | Bandeja, detalle/PDF, revisión, KPIs, alertas, Realtime y demo aislada. Producción pendiente de OK. | payroll.js, payroll.css, payroll-demo.js, app.js, index.html, sw.js, release.json | 15 unitarias; contrato Supabase solo lectura; integración de navegador | feature/payroll |
| 2026-10-08 | Nóminas · cierre y staging (Claude) | Test e2e corregido (contraseña del paso demo). Preview en proyecto staging `dpl_8XKdRN3ke2Q8ZH2W9zT34HmTvFLB` READY, `/release.json` 2.7.0, `/api/deployment-info` preview. Realtime activado en staging. Producción sin tocar (2.4.1). | tests/e2e/payroll.mjs | unit 15/15; e2e nóminas Chromium y WebKit OK; smoke 15/15 | `9f18902` · https://renzo-hub-2-1-staging-ous87m050-renzojesus99-1996.vercel.app |
| 2026-10-08 | Nóminas 2.7.1 · demo en segundo enlace de staging | El dominio renzo-hub-2-1-staging.vercel.app queda con la 2.6.2 de la tarea de estabilización (decisión de Renzo). Demo ?demo=1 habilitada también en renzo-hub-2-1-staging-renzojesus99-1996.vercel.app. | payroll.js, payroll-demo.js, sw.js, release.json | unit 15/15; e2e Chromium y WebKit OK | ver commit siguiente |

Ver `docs/PAYROLL-CHANGELOG.md` para limitaciones y peticiones a Claude. No se incorporan los cambios locales sin commit de la tarea e2e/fase1-2.6.2.

## Nóminas 2.10.1 (2026-10-10): ordenadas por mes de cobro y tipo
- Pestaña Nóminas: vista por defecto **"Por mes de cobro"**: cada mes con su recuento ("5 semanales + 2 pagos extra"), el neto cobrado confirmado y las pendientes; dentro, ordenadas por fecha de cobro (regla: semana trabajada → miércoles siguiente; pagos extra → su fecha de pago).
- Cada nómina muestra fecha de cobro, semana, nº y **tipo**: Semanal, Vakantiegeld, Vacaciones o Corrección. Se puede volver a "Por semana trabajada".
- Petición de Renzo: entender por qué septiembre tiene 7 (septiembre de 2026 tiene 5 miércoles de cobro + pagos extra).

## Nóminas 2.10.0 (2026-10-10): subir nóminas desde la app, sin n8n
- My Finance → Nóminas → **Subir nómina (PDF)**: el PDF de SD Worx se lee en el propio dispositivo (`payroll-pdf.js` + pdf.js servido desde `/vendor/pdfjs`, sin CDN), se enseña un resumen (nº, semana, bruto, neto, retención, fecha) y si las cuentas cuadran.
- Al confirmar, `api/payroll-upload.js` comprueba la sesión y el origen, valida PDF (tipo, ≤ 3 MB, SHA-256) e importes, reutiliza la empresa y la etiqueta de semana existentes, detecta pagos adicionales (segunda nómina de la misma semana), y llama a `payroll_register_document` → bucket privado `payroll` → `payroll_ingest`. **Siempre queda pendiente de revisión.** El mismo PDF dos veces = duplicado.
- Sin migraciones: usa las funciones de Nóminas que ya existen. Necesita `SUPABASE_SECRET_KEY` en Vercel (producción ya la tiene; staging por confirmar: `GET /api/payroll-upload` responde `configured`).
- Verificado con las nóminas reales nº 4, 5, 22 y 23 (lectura y cuentas) y en réplica PostgreSQL 17 (`tools/db-replica/payroll_upload_test.sh`, también en CI con una nómina ficticia). Pruebas: unitarias 58/58, E2E Nóminas con subida (Chromium), E2E autenticado 32/32, smoke 15/15.

## Skin 2.9.2 (2026-10-10): rutina de piel arreglada y en el registro
- **Fallo encontrado (también en producción):** al cargar Skin, el código escribía en elementos que no existen (`skinPct`, `greeting`, `streak`). La carga se cortaba: la rutina no mostraba ningún paso y el indicador decía "Conectado · algunos datos no se pudieron cargar". No estaba cubierto por ninguna prueba.
- Skin pasa a `microapps/skin/skin.js` (contrato del registro, `loadOnSignIn`), con escritura segura en elementos opcionales. Sin cambios visibles salvo que vuelve a funcionar.
- Nueva prueba E2E de Skin: marcar un paso, comprobarlo en Supabase, recargar y releer, nota del día, desmarcar e historial de solo lectura.

## Observabilidad 2.9.1 (2026-10-10): registro de errores de la app
- `microapps/errors.js`: captura errores de JavaScript, promesas rechazadas y microapps que no cargan; los guarda en `hub_records` (system / app_error) en la fila del propio usuario. Deduplicado, máximo 20 por sesión, ignora ruido (extensiones, ResizeObserver, Realtime sin red). Sin migraciones.
- System → "Errores de la app": últimos 20 abiertos con fecha, versión y sección; botón "Marcar como revisados".
- Corrección: `records.js`, `ui.js` y `errors.js` ahora están en la caché sin conexión (en 2.9.0 faltaban los dos primeros) y un test lo vigila para todo `microapps/`.

## Microapps 2.9.0 (2026-10-10): registro central, kit de datos, generador y Notas
- `microapps/registry.js`: cada microapp se declara una vez; rutas, menú, pestañas, tarjetas de Home, enlace directo `?app=` y ciclo de vida salen de ahí. Guía: `docs/MICROAPPS.md`.
- `microapps/records.js`: datos de apps sencillas en `hub_records` (sin migraciones). `microapps/ui.js`: cabecera, pestañas y estados "sin datos" comunes.
- `./scripts/renzo-hub new-microapp <id> "<Nombre>" <area>` crea módulo, entrada de registro y caché.
- Nóminas, Gym y News pasan al registro sin cambios visibles. Primera app hecha con el generador: **Notas** (Home → Tus microapps).
- Pruebas: registro y kit (unitarias), y el E2E autenticado recorre todas las secciones del registro y crea/elimina una nota real del usuario de pruebas en staging.
- Sin cambios de base de datos.

## My Finance 2.8.4 (2026-10-10): Nóminas como apartado de My Finance
- Money pasa a llamarse **My Finance** (menú inferior, título, tarjeta de Home y textos de Jarvis).
- My Finance tiene dos apartados: **Movimientos** (lo que era Money) y **Nóminas** (la microapp de nóminas, sin cambios de datos ni cálculos).
- Nóminas: botón "← My Finance", pestañas para volver a Movimientos y el menú inferior visible con My Finance marcado.
- Home: la tarjeta "Nóminas" pasa a ser "My Finance" (movimientos y nóminas). System mantiene el acceso directo "My Finance · Nóminas". El enlace `?app=payroll&payslip=` sigue funcionando.
- Sin cambios de base de datos. El mensaje "Money → Pendientes" de la función de base de datos se mantiene hasta una migración futura.

## Nóminas 2.8.3 (2026-10-10): aviso de nóminas que faltan
- El resumen avisa de huecos en la numeración por empresa y año (solo entre la primera y la última recibidas): hoy "Falta la nómina nº 22 de SD Worx".
- CI ejecuta el E2E de Nóminas (datos ficticios, Chromium y WebKit) en cada PR.
- Pruebas: unit 29/29, smoke 15/15, E2E autenticado 22/22, E2E Nóminas OK.
- Decisión de Renzo (10 oct): sin VPS; n8n Cloud se pagará cuando haga falta.

## Cierre de Fase 1 · trabajo autónomo (2026-10-10)

| Criterio de cierre (auditoría §7) | Estado |
|---|---|
| 1 · Fuente única en GitHub, Vercel desde Git | ✔ (protección de `main` requiere GitHub Pro) |
| 2 · Sincronización fiable | ✔ |
| 3 · Superficie pública mínima | ✔ app · **pendiente Renzo:** desactivar registro en Supabase (ambos proyectos) |
| 4 · Esquema reproducible | ✔ `20261007200000_payroll_schema_baseline.sql`; cadena completa probada = staging. Pendiente: comprobar md5 en producción y buckets `portfolio-files`/`progress-photos` |
| 5 · Staging probable para Jarvis | ✖ depende del VPS de n8n |
| 6 · Microapps de Fase 1 | ✔ · falta prueba real Telegram → Money (depende del VPS) |
| 7 · Red de seguridad | ✔ smoke, E2E, CI, plantilla de PR y `docs/RELEASE-CHECKLIST.md` |
| 8 · Separación Nodalys | ✖ diseñada; implementación en n8n depende del VPS |

## Nóminas 2.8.2 (2026-10-10): mes por fecha de cobro, correcciones agrupadas y pendientes visibles

Petición de Renzo: "trabajo una semana y cobro lo que hice esa semana el siguiente miércoles"; totales confusos (~10.000) y nóminas "replicadas".
Diagnóstico con datos reales (solo lectura): 24 nóminas SD Worx, sin duplicados. Las 3 semanas dobles (W22, W24, W34) son correcciones con 0 horas e importes pequeños (pagos adicionales). El total mostrado solo sumaba las 19 confirmadas; 5 pendientes de revisión no contaban. El porcentaje alto (≈37 %) es la tarifa especial de los pagos extra.

| Cambio | Dónde |
|---|---|
| Regla de cobro: nómina semanal normal = miércoles siguiente a la semana ISO; corrección = su fecha de pago | `payroll.js` (`payDate`) y migración `supabase/pending/20261010030000_payroll_pay_date_rule.sql` (vistas confirmed, monthly_nl, jaaropgave_nl; solo cambia `ref_date`) |
| A · Correcciones agrupadas bajo su semana como "Pago adicional" | `payroll.js` (`groupByWeek`, `payslipCard`) |
| B · Resumen: neto confirmado + "Pendientes sin contar" + total con pendientes, por año de cobro | `payroll.js` (`yearSummary`) |
| C · Retención por nómina; aviso de tarifa especial en pagos extra | `payroll.js` (`taxRate`), detalle y mensual |

Pruebas: unit 28/28, smoke 15/15, E2E autenticado 22/22, E2E Nóminas (Chromium) OK, deploy-surface 3/3, `tools/db-replica/pay_date_test.sh` TODO OK (fechas, agrupación mensual, cambio de año, vista dependiente, security_invoker, permisos, idempotencia, rollback).

## Unificación 2.8.1 (2026-10-09): Nóminas 2.8.0 + estabilización 2.6.2

Rama `feature/unificacion-2.8.1` = `feature/fase1` + merge de `e35f64a` (Nóminas 2.8.0, lo que sirve producción). Conflictos solo en `release.json`, `sw.js` y `tests/e2e/smoke.mjs`, resueltos conservando ambos lados (bypass de Vercel + comprobación de entorno). Caché `renzo-hub-cloud-v6.0-unificada`.

| Prueba (código unificado, servidor local + Supabase staging) | Resultado |
|---|---|
| `npm run check` / `npm test` | OK / 24/24 |
| deploy-surface | 3/3 |
| Réplica de base de datos (`tools/db-replica/run.sh`) | TODO OK |
| Smoke | 15/15 |
| E2E autenticado Fase 1 | 22/22 |
| E2E Nóminas (demo) | Chromium OK (contenedor) · Chromium + WebKit OK en el Mac (worktree `~/Projects/RENZO-HUB/unificacion-2.8.1`, 2026-10-09 21:30) |

PR #3 hacia `staging` abierto (CI verde). Mac: copia de producción movida a `backups/supabase-prod-2026-10-09/` (sha256 verificado); cambios sin commit de `e2e/fase1-2.6.2` guardados como parche en `backups/`; ramas de Nóminas del Mac sin commits fuera de la unificación. Pendiente:, despliegue y validación en staging; después, autorización de Renzo para producción. Aviso: `docs/PAYROLL-2.8-TAREA-2-3.md` contiene una cifra salarial real (repositorio privado); decidir si se anonimiza.

## Nóminas 2.8.0 · desarrollo local (Tareas 1, 2 y 3)

| Fecha | Tarea | Resultado | Archivos | Pruebas | Commit / PR |
|---|---|---|---|---|---|
| 2026-10-09 | Tarea 1 · Mensual | Vista mensual por fecha de pago, selector de año, total anual, desglose, retenciones, horas y saldos; demo sintética. | payroll.js, payroll.css, payroll-demo.js, release.json, sw.js, tests, docs | check OK; unitarias; E2E Chromium y WebKit; capturas 390 y 1440 px | c708679; sin PR |
| 2026-10-09 | Ajustes de Tarea 1 | Singular, etiquetas con mayúscula y bloques Horas/Saldos plegables en móvil. | payroll.js, payroll.css, tests/e2e/payroll.mjs, sw.js | check, unitarias y E2E Chromium/WebKit | dd261c8 |
| 2026-10-09 | Tarea 2 · smoke por entorno | Entorno esperado derivado de BASE_URL, con override EXPECT_ENV; solo lectura. | tests/e2e/smoke.mjs, docs | Smoke real producción 15/15, sin login | 1663313 |
| 2026-10-09 | Tarea 3 · Año (jaaropgave) | Pestaña Año: aviso de completitud arriba, valores oficiales de la última nómina separados de lo registrado, demo con año incompleto y completo. Aviso específico si lo registrado supera el oficial o falta el acumulado. | payroll.js, payroll.css, payroll-demo.js, sw.js, tests, docs | check OK; 21/21 unitarias; E2E Chromium y WebKit; smoke producción 15/15; cifras reales verificadas en la vista | commit Tarea 3; sin PR ni despliegue |

Worktree: `/Users/Nodalys/Renzo HUB/payroll-2.8`, creado desde `main` en `7c110eb`. El checkout `e2e/fase1-2.6.2` conserva sus cambios. Caché `renzo-hub-cloud-v5.9-payroll`. Pendiente: revisión de Renzo, PR y despliegue con su OK. Detalles en `docs/PAYROLL-2.8-TAREA-1.md` y `docs/PAYROLL-2.8-TAREA-2-3.md`.
