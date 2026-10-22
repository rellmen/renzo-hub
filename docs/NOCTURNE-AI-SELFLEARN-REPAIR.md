# Reparación Ares AI y SelfLearn · 22 octubre 2026

## Estado vigente: publicado y Ares habilitado

El usuario añadió OPENROUTER_API_KEY directamente en Vercel Production. Publicado commit `b456c5eb9ba9d9129c69e48c9f333dd707866a96`, deployment `dpl_J2eYcpZGUjaawQfwpYhA637QXKwm` (READY). Alias público renzo-hub.vercel.app verificado en ese deployment. GET público `/api/ares-ai`: 200, enabled=true, OpenRouter/openrouter/free, Cache-Control no-store. Config pública apunta a Supabase producción. `/aprender` 200 y título SelfLearn; rutas principales del candidato 200. POST público sin JWT: 401 JSON Sesión necesaria (rechazo de aplicación, no Vercel SSO). La clave no se leyó ni se imprimió.

CI general del commit: run 39797028685 success. React del commit 2300238: run 39795059023 success con Chromium/WebKit; todo apps/rise-react tiene idéntico tree SHA `b08ccd905b322b1cecaaa9e1eb4766539bcc0bee` en 2300238 y b456c5e. La repetición React run 39797028937 todavía in_progress al publicar (descargando navegadores); no se declara aprobada esa repetición. El código React publicado sí coincide exactamente con el ya validado.

Rollback inmediato Nocturne: asignar renzo-hub.vercel.app de nuevo a `dpl_8dMPmCEgLpE3ZceG3dpJ9PqAxft1`. Rescate clásico disponible y READY: `dpl_5Rh9Ram6QBVr8LFVXDx6eyXEueLr`, alias rise-hub-classic-renzojesus99-1996.vercel.app. Rollback de frontend no deshace migraciones ni XP/FSRS confirmados.

Pendiente funcional explícito: no se ha hecho consulta OpenRouter con una sesión real ni completado lección/repaso en cuenta personal. enabled=true confirma configuración cargada, no valida la clave con el proveedor ni garantiza una respuesta del modelo. Prueba real requiere que Renzo abra Ares con su sesión. XP/FSRS tienen RPC y flag production habilitados y probe compatible; no afirmar que una lección personal fue acreditada.

Este bloque prevalece sobre los estados históricos que siguen.

## Actualización autorizada: producción migrada

Renzo autoriza explícitamente las migraciones y la activación de Ares. Aplicadas en producción vía MCP: selflearn_transactions 20261022143223 y selflearn_capabilities_contract 20261022143229. Archivos trasladados a migrations/ y rollbacks/; no reaplicar. Readiness producción 7/7 true. RPC invoker, sin EXECUTE anon; authenticated permitido. Probe sintético de metadatos version=1/ready=true. Los 171 hub_records y el único hub_user_state conservan exactamente sus huellas antes/después: no se modificó contenido. Sin nueva advertencia de advisors.

Flags ARES_AI_ENABLED, ARES_AI_SHARE_PROJECT_DATA y ARES_AI_ALLOW_PRODUCTION preparados en producción Nocturne; VITE_ENABLE_SELFLEARN_AWARDS=true tras verificar backend. No se ha publicado otro frontend: los cambios de variables se aplican al siguiente build. La clave OPENROUTER_API_KEY existe como sensitive en rise-hub clásico pero Vercel no devuelve su valor; no hay mecanismo de transferencia en herramientas disponibles. No se cambia su tipo ni se intenta extraerla de funciones. El usuario debe añadir su clave directamente como secreto de Production en rise-hub-nocturne-qa. Nunca pegarla en chat. Hasta añadirla y desplegar/verificar, Ares NO está activo.

CI React: todos los pasos del job, incluidos Chromium/WebKit smoke y UI con mocks, constan success (job 119880193910); el contenedor del run aún informa in_progress. CI db-migrations job 119880193080 success; job test de CI sigue queued. No se declara CI global aprobado. El resto de este informe conserva la evidencia histórica previa a esta autorización; este bloque prevalece para el estado vigente.


## Estado y causas verificadas

Base de trabajo: staging `7b8f9cb67b3e0b4fddd78bcb2c18f9ad3dc7bd5a`, PR #147 fusionada. Main conserva `ebd0173`. El proyecto `rise-hub-nocturne-qa` es sensible: no modificar su dominio público ni configuración de producción. Último preview observado `dpl_5t1NkXSZSHedn57bCJFjfDLQssHu`; último deployment target production `dpl_8dMPmCEgLpE3ZceG3dpJ9PqAxft1`.

Ares: `api/ares-ai.js` vive fuera de la raíz React y no estaba montado en la entrada TanStack. Además, su política anterior rechazaba production incondicionalmente. Un cambio de ruta por sí solo no enciende el modelo. La primera prueba remota del candidato 532c759 aún devolvió 404: Vercel necesita una función explícita relativa a la raíz React para este endpoint. Se añade `apps/rise-react/api/ares-ai.js` que reexporta el handler compartido. El siguiente candidato reveló un error ESM en Node 24 al importar `.js` fuera del package raíz: la implementación se mueve a `apps/rise-react/server/ares-ai.mjs`, reutilizada también por el clásico; la entrada server de TanStack atiende `/api/ares-ai` con el mismo handler, sin proxy ni duplicación de autenticación.

SelfLearn: inspección SQL de catálogos confirma finalize/review/guard en staging y ausencia en producción. Ambas tablas producción tienen RLS y cuatro políticas owner para cada operación; UPDATE tiene USING y WITH CHECK. El frontend anterior bloqueaba production incluso con el flag activo.

## Implementación

- `src/server.ts` + `src/lib/server/node-handler.mjs`: adaptador Fetch/Node, GET/POST y 405 para otros métodos; JSON limitado a 16 KiB, 400/413/415, errores genéricos y no-store. No imprime tokens o cuerpos.
- `api/ares-ai.js` y `apps/rise-react/api/ares-ai.js` reexportan `apps/rise-react/server/ares-ai.mjs`: mantiene token Supabase, owner/RLS, allowlist de registros, prohibición de consultas sensibles, modelo gratuito fijado y timeouts. Production requiere además `ARES_AI_ALLOW_PRODUCTION=true`. Consume el RPC existente `selflearn_tutor_take_quota`: presupuesto **compartido** con tutor de idiomas, 12 consultas/día, falla cerrado si no está disponible. No es una cuota independiente de Ares. Secretos solo servidor.
- `use-selflearn-capabilities.ts`: consulta autenticada `selflearn_capabilities`, version 1 + ready true; fail closed ante errores. React requiere este probe y flag antes de habilitar XP/FSRS production. No añade materias: NL/EN exclusivamente.
- SQL pendiente añade probe invoker sin filas personales, ejecutable solo authenticated; comprueba presencia de RPC, trigger y RLS. Se conservan transacciones, advisory locks, IDs idempotentes, CAS y FSRS existentes. Esto no convierte checkpoints editables en acreditación antifraude.

## Pruebas y límites

- Suite Node: 486/486 pasando, incluyendo DB PGlite con datos sintéticos: rollback atómico, XP único, vocabulario histórico, propietario distinto, rol anon, CAS y reintentos FSRS. La prueba de capacidades se incluye en el escenario SQL.
- React: 15/15, incluidos cuatro casos de capabilities.
- TypeScript y build Nitro preset Vercel completados. Handler presente en bundle servidor y ausente de static cliente (búsqueda de nombres de secretos/flags de Ares).
- GET local servido por TanStack: HTTP 200 JSON enabled=false, no 404. Disabled es el estado correcto sin configuración/secretos.
- E2E local Chromium/WebKit intentado: descarga de navegadores bloqueada, ejecutables ausentes. No aprobado localmente; CI existente ejecuta ambos motores.
- Auth válida, chat OpenRouter real, dos dispositivos reales y paridad de registros históricos producción NO probados: no hay sesión QA autorizada. Mocks no sustituyen esas pruebas. No usar la cuenta personal para pruebas.
- No se han cambiado filas de producción ni copiado datos a staging. La integridad histórica real se preserva por no escritura; no se ha realizado una comparación de snapshots de datos privados.

## SQL pendiente y secuencia segura

Producción: no DDL ni escrituras. Staging: se aplicó únicamente el probe incremental `20261022141917_selflearn_capabilities_contract` mediante MCP, sin tocar funciones originales ni filas. Reflejado en archivo pending con la versión exacta del historial remoto. Probe bajo rol authenticated con identidad sintética y transacción rollback: `{version:1,ready:true}`; invoker, anon EXECUTE=false, authenticated EXECUTE=true. Esto comprueba metadatos, NO una sesión JWT real.

Producción requiere, tras autorización, aplicar en orden `20261022090000_selflearn_transactions.sql` y `20261022141917_selflearn_capabilities_contract.sql`. Staging ya tiene ambos componentes: NO reaplicar. Cada uno dispone de rollback independiente. La ampliación se separa del archivo original para no reescribir una migración ya aplicada en staging.

1. Revisar PR y CI; candidato Preview por integración Git, sin merge a main.
2. Probe ya instalado en staging; ejecutar readiness + prueba JWT real y pruebas sintéticas aisladas. No usar filas personales.
3. Validar candidato con Supabase del entorno correcto y sesión QA autorizada. Antes del release production, generar candidato aislado ligado a producción, con awards apagados.
4. Obtener autorización explícita para SQL producción y configuración servidor Ares. Aplicar SQL aditivo, ejecutar readiness y verificar permisos/invoker.
5. Ares servidor: SUPABASE_URL/KEY publicable del mismo entorno, OPENROUTER_API_KEY secreta, ARES_AI_ENABLED=true, ARES_AI_SHARE_PROJECT_DATA=true; solo producción añade ARES_AI_ALLOW_PRODUCTION=true. No copiar secretos entre proyectos. Si no hay autorización de compartir títulos/estados, dejar apagado.
6. Solo tras validación backend: VITE_ENABLE_SELFLEARN_AWARDS=true en build del candidato, VITE_NOCTURNE_RELEASE_TARGET=production y Supabase producción. Backend sigue siendo la autoridad. Probar sin escribir en registros personales.
7. Publicación definitiva requiere aprobación y gates funcionales reales, no solamente build verde. No cambia release/caché clásica en esta PR sin publicación.

## Reversión exacta

Frontend candidato: cerrar/no fusionar PR o descartar preview. Si se publicara después, reasignar `renzo-hub.vercel.app` al deployment clásico conocido `dpl_5Rh9Ram6QBVr8LFVXDx6eyXEueLr`, proyecto `rise-hub`, después de reconfirmar que sigue READY y el alias clásico funciona. Seguir `docs/NOCTURNE-REVERSIBLE-RELEASE.md`; no borrar Blue ni el alias `rise-hub-classic-renzojesus99-1996.vercel.app`.

Apagar awards y Ares antes de retirar backend. SQL rollback elimina trigger/RPC/helpers/probe; prueba aislada confirma mismo número de filas antes/después. NO revierte lecciones, XP ni repasos ya confirmados; no restaura fechas FSRS anteriores ni borra auditoría. Una reversión de frontend tampoco revierte escrituras Supabase. SQL rollback remoto requiere autorización e inspección de dependencias. En staging, si solo se añadió probe, revertir únicamente ese probe, no retirar funciones preexistentes.

## Pendiente de Renzo / autorización

Aprobar PR hacia staging; sesión QA separada si se desean cerrar pruebas autenticadas reales. Producción: autorización específica para migración SQL, configuración/activación Ares y promoción final. Hasta entonces, reparación preparada y probada localmente; no declarar restauración en producción.

Preview aislado: variables publicables Supabase staging configuradas SOLO para rama `feature/nocturne-ares-selflearn-repair`, target preview. Awards false; sin claves proveedor ni modificación de variables producción.

## Evidencia remota del candidato

Commit funcional `b5a40a07a99b0fc2aadd675903aa4bd4b4dc980b`, preview `dpl_3Rb5LLGf2EB1uBf5WYSG32zUBgeF` / `https://rise-hub-nocturne-ltk56ewlr-renzojesus99-1996.vercel.app/`: GET `/api/ares-ai` 200 JSON enabled=false y no-store; `/api/supabase-config` 200, Supabase staging correcto. Proyecto Nocturne no contiene variables OpenRouter/Ares: activación real pendiente, no se han copiado secretos. Respaldo clásico GET Ares 200 también enabled=false. Dominio público continúa en `dpl_8dMPmCEgLpE3ZceG3dpJ9PqAxft1`, sin cambios.

CI de GitHub del commit funcional sigue queued: runs `39794584449` (React) y `39794584490` (CI). No declararlos aprobados. `./scripts/renzo-hub preflight 148` no pudo ejecutarse: `spawnSync gh ENOENT`; `gh` no está instalado/autenticado en este entorno. Se usa conector para comprobar base staging, rama, commit, deployment y estado de CI, sin equivaler a preflight completo.
