# RISE HUB (antes Renzo Hub): instrucciones para cualquier IA

## Decisión vigente de Renzo · 23 octubre 2026 · Nocturne como único staging

Esta decisión sustituye las asignaciones históricas de desarrollo Classic de este archivo y de documentos anteriores.
- Desarrollar exclusivamente Nocturne en `apps/rise-react/`, con sus pruebas, API servidor y migraciones revisadas. Rama de integración `feature/nocturne-integral-migration`, PR #150 hacia `staging` hasta superar CI y revisión; no merge automático ni publicación en producción.
- Proyecto de pruebas canónico: Vercel `renzo-hub-2-1-staging` (`prj_kt9EGP7NvU1SghR5wJrbXMptDJMl`), raíz `apps/rise-react`, Supabase staging `zpueziugbezqxompwsol`.
- Classic es SOLO respaldo y referencia de lectura: consultar sus modelos, reglas y comportamiento para adaptar funcionalidades a Nocturne. No modificar ni desarrollar sus pantallas, `world.js`, `gym.js`, `phase1.js`, módulos Classic, `index.html`, service worker o release Classic; no desplegar nuevas versiones Classic.
- El proyecto `rise-hub` se conserva como respaldo. El antiguo `rise-hub-nocturne-qa` deja de ser destino de nuevas previews: actualmente también aloja el dominio público; no borrarlo, renombrarlo ni alterar producción. Las previews automáticas de ambos proyectos se han deshabilitado, conservando los despliegues existentes.
- La rama Git `staging` y un deployment preview no son lo mismo: mientras #150 no se fusione, el staging canónico prueba un SHA explícito de la rama candidata. No afirmar que #150 está fusionado ni que la migración está terminada.
- No copiar datos ni secretos de producción a pruebas. No rediseñar Nocturne. Una mejora se implementa en Nocturne usando Classic como especificación; los pendientes no justifican abrir otra línea de desarrollo Classic.
- Para esta congelación, los cambios de documentación/configuración Nocturne NO requieren incrementar `release.json` ni cambiar `sw.js` de Classic. Conservarlos intactos.
- Antes de trabajar, leer `docs/NOCTURNE-STAGING-CLASSIC-READONLY.md`. La prueba de interfaz en iPhone ha sido aprobada por Renzo; no equivale a certificar todos los flujos PWA/offline/datos.

## Qué es
RISE HUB (antes Renzo HUB) es la plataforma personal y privada de Renzo. El cambio de nombre es solo visible: URLs, repositorio, proyectos de Vercel y Supabase, nombres de archivo y prefijos técnicos (`renzo-hub-…`) se mantienen. **No forma parte de Nodalys**: no compartir código, datos, credenciales, documentación ni agentes con Nodalys.

## Fuente vigente
- Repositorio Git `~/Projects/RENZO-HUB/repo` (remoto previsto `rellmen/renzo-hub`). Lee este archivo y `RENZO-HUB-CURRENT.md` antes de editar.
- Ejecuta `./scripts/renzo-hub status` al empezar.
- No copies código desde conversaciones antiguas, capturas, Figma ni previews. No uses la carpeta espejo de ChatGPT como fuente.

## Ramas
- `production` = producción real (Nocturne, `apps/rise-react`) desde el 24-10-2026. Solo se actualiza mediante PR `staging → production` aprobado por Renzo.
- `main` = Classic congelado (respaldo de lectura en el proyecto `rise-hub`). Ya no es lo que sirve el dominio; no publicar nada nuevo ahí.
- `staging` = pruebas en `renzo-hub-2-1-staging`.
- `feature/*` = desarrollo; una rama por tarea, PR hacia `staging`.
- **No borrar nunca la rama `staging`** (GitHub ofrece "Delete branch" tras fusionar un PR desde `staging`).
- `experimental/os-core` = arquitectura futura; no se despliega.
- Nunca reescribir historia publicada (sin `push --force`, sin `rebase` de ramas compartidas).

## Entornos: no confundir
- **Producción:** https://renzo-hub.vercel.app · Vercel `rise-hub-nocturne-qa`, rama `production`, raíz `apps/rise-react` (comprobado el 31-10-2026 con `/api/deployment-info`) · Supabase `mgncykyrhavpepfggmng`.
- **Classic de respaldo:** Vercel `rise-hub`, rama `main`. No borrar ni renombrar ninguno de los dos proyectos.
- **Staging:** https://renzo-hub-2-1-staging.vercel.app · Vercel `renzo-hub-2-1-staging` · Supabase `zpueziugbezqxompwsol`.
- Los datos y la configuración de un entorno no se copian al otro.

## Publicación
- **Prohibido desplegar a producción sin autorización explícita de Renzo.** Todo cambio pasa antes por staging.
- Producción se publica sola al fusionar en `production` (Nocturne). Sin despliegues por CLI. Sigue `docs/RELEASE-CHECKLIST.md`.
- Migraciones: aplicadas en ambos entornos en `supabase/migrations/` (una base vacía + todas reproduce el esquema); rollbacks en `supabase/rollbacks/`; no aplicadas en producción en `supabase/pending/`.
- No desplegar por CLI desde carpetas sin commit: cada despliegue debe corresponder a un commit.
- Tras editar Nocturne: incrementa `apps/rise-react/public/release.json` y actualiza `RENZO-HUB-CURRENT.md` (los assets llevan hash; `sw.js` solo cambia si cambia su lógica).
- No afirmes que algo está publicado hasta comprobar `READY` y que `/release.json` y `/api/deployment-info` respondan lo esperado.

## Reglas permanentes (valen sin que Renzo las repita)
Renzo ya no reescribe estas condiciones en cada encargo. Una autorización suya ("Autorizo: X") cubre solo X; todo lo demás sigue prohibido:
- No fusionar ni desplegar a `production`/`main`. Renzo fusiona los PR; la IA prepara y verifica.
- No aplicar migraciones en producción. En staging, solo con OK de Renzo y con rollback probado.
- No activar ni publicar workflows de Jarvis o Nodalys; las copias nuevas quedan inactivas.
- No borrar datos, no `push --force`, no tocar credenciales, permisos sensibles ni la configuración de producción de Vercel o Supabase.
- Al terminar cada cambio: abrir el PR hacia `staging` y dar el enlace.

## Antes y después de fusionar
- Antes: `./scripts/renzo-hub preflight [nº PR]` (destino, fusionable, CI, versión y caché, migraciones con rollback, claves).
- Después de que Renzo diga "publicado": `./scripts/renzo-hub verify staging|prod [versión] [--smoke]` (versión servida, entorno, rutas internas no expuestas, smoke). Staging necesita `VERCEL_PROTECTION_BYPASS` en la shell.
- Pegar la salida de esos comandos en el informe en lugar de describirla.

## Definition of Done: formato obligatorio de cada informe
Nada es "hecho" sin evidencia comprobada en ese mismo turno (salida de comando, ID de registro, URL, hash). Todo informe separa:
1. **Verificado:** con la evidencia al lado.
2. **Preparado, sin aplicar:** existe pero no está en marcha (PR abierto, migración sin aplicar, workflow inactivo).
3. **Pendiente de Renzo:** pasos exactos, con enlace.
4. **Necesita autorización:** qué y por qué.
Si algo no se pudo comprobar, se dice "no verificado" y por qué. Nunca "ya está hecho" sin el punto 1.

## Microapps
- Nuevas microapps: `./scripts/renzo-hub new-microapp` y `docs/MICROAPPS.md`. Se declaran solo en `microapps/registry.js`; datos sencillos en `hub_records` vía `microapps/records.js`.

## Seguridad y datos
- Nunca pongas claves, tokens ni contraseñas en código, documentación, commits o comandos. La publishable key solo se sirve desde `/api/supabase-config`.
- Migraciones Supabase solo aditivas; primero en staging; las de producción requieren autorización de Renzo.
- No inventar datos en estadísticas: mostrar "sin datos" cuando falten.
- Registros financieros importados (Jarvis) siempre pasan por revisión humana.
- Mantén el diseño móvil y escritorio, el acceso Supabase, las microapps existentes y la instalación PWA.
