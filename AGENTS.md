# Renzo Hub: instrucciones para cualquier IA

## Qué es
Renzo HUB es la plataforma personal y privada de Renzo. **No forma parte de Nodalys**: no compartir código, datos, credenciales, documentación ni agentes con Nodalys.

## Fuente vigente
- Repositorio Git `~/Projects/RENZO-HUB/repo` (remoto previsto `rellmen/renzo-hub`). Lee este archivo y `RENZO-HUB-CURRENT.md` antes de editar.
- Ejecuta `./scripts/renzo-hub status` al empezar.
- No copies código desde conversaciones antiguas, capturas, Figma ni previews. No uses la carpeta espejo de ChatGPT como fuente.

## Ramas
- `main` = producción. Solo se actualiza mediante Pull Request aprobado por Renzo.
- `staging` = pruebas en `renzo-hub-2-1-staging`.
- `feature/*` = desarrollo; una rama por tarea, PR hacia `staging`.
- **No borrar nunca la rama `staging`** (GitHub ofrece "Delete branch" tras fusionar un PR desde `staging`).
- `experimental/os-core` = arquitectura futura; no se despliega.
- Nunca reescribir historia publicada (sin `push --force`, sin `rebase` de ramas compartidas).

## Entornos: no confundir
- **Producción:** https://renzo-hub.vercel.app · Vercel `renzo-hub` · Supabase `mgncykyrhavpepfggmng`.
- **Staging:** https://renzo-hub-2-1-staging.vercel.app · Vercel `renzo-hub-2-1-staging` · Supabase `zpueziugbezqxompwsol`.
- Los datos y la configuración de un entorno no se copian al otro.

## Publicación
- **Prohibido desplegar a producción sin autorización explícita de Renzo.** Todo cambio pasa antes por staging.
- Producción se publica sola al fusionar en `main` (rama de producción de Vercel = `main` desde 2026-10-10). Sin despliegues por CLI. Sigue `docs/RELEASE-CHECKLIST.md`.
- Migraciones: aplicadas en ambos entornos en `supabase/migrations/` (una base vacía + todas reproduce el esquema); rollbacks en `supabase/rollbacks/`; no aplicadas en producción en `supabase/pending/`.
- No desplegar por CLI desde carpetas sin commit: cada despliegue debe corresponder a un commit.
- Tras editar: incrementa `release.json`, actualiza `RENZO-HUB-CURRENT.md` (tabla de progreso) y cambia la caché de `sw.js`.
- No afirmes que algo está publicado hasta comprobar `READY` y que `/release.json` y `/api/deployment-info` respondan lo esperado.

## Microapps
- Nuevas microapps: `./scripts/renzo-hub new-microapp` y `docs/MICROAPPS.md`. Se declaran solo en `microapps/registry.js`; datos sencillos en `hub_records` vía `microapps/records.js`.

## Seguridad y datos
- Nunca pongas claves, tokens ni contraseñas en código, documentación, commits o comandos. La publishable key solo se sirve desde `/api/supabase-config`.
- Migraciones Supabase solo aditivas; primero en staging; las de producción requieren autorización de Renzo.
- No inventar datos en estadísticas: mostrar "sin datos" cuando falten.
- Registros financieros importados (Jarvis) siempre pasan por revisión humana.
- Mantén el diseño móvil y escritorio, el acceso Supabase, las microapps existentes y la instalación PWA.
