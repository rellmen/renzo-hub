# Renzo Hub

Esta carpeta es una copia aislada local para Renzo Microapp OS Core v1; no es la fuente canónica y no debe desplegarse.

El nuevo núcleo TypeScript está en [`os-core/src`](os-core/src/index.ts), con su guía de arquitectura en [`docs/RENZO-MICROAPP-OS-CORE-V1.md`](docs/RENZO-MICROAPP-OS-CORE-V1.md). Ejecuta `npm test` y `npm run build` con Node.js 24.

La aplicación existente mantiene sus rutas, autenticación, PWA y persistencia sin cambios de integración.

Para el estado de origen e instrucciones heredadas, consulta también:

Consulta primero [AGENTS.md](AGENTS.md) y [RENZO-HUB-CURRENT.md](RENZO-HUB-CURRENT.md). La fuente canónica es esta carpeta.

- Producción: https://renzo-hub.vercel.app/
- Preview aislada: https://renzo-hub-2-1-staging.vercel.app/
- Estado y comparación del release: `./scripts/renzo-hub status`

La aplicación usa variables Vercel y proyectos Supabase separados por entorno. No pongas secretos en el frontend.
