# Renzo Hub · versión vigente

- **Release:** 2.3.0
- **Producción (uso diario):** [renzo-hub.vercel.app](https://renzo-hub.vercel.app/)
- **Preview (revisión aislada):** [renzo-hub-2-1-staging.vercel.app](https://renzo-hub-2-1-staging.vercel.app/)
- **Fuente canónica:** esta carpeta, `renzo-hub-news/`
- **Última edición:** 7 de octubre de 2026
- **Despliegue Producción:** `dpl_m41s3rKdKEvgWUidaneMdZChd1YG` · READY
- **Despliegue Preview:** `dpl_3KSBd8EdEShrfDdaS8pNMvMJKbDG` · READY
- **Proyectos Vercel:** `renzo-hub` (prod) y `renzo-hub-2-1-staging` (preview)

## Cambios del release 2.3.0
- Iconos de microapps y navegación con respuesta animada, brillo y selección accesible; se respeta reducir movimiento.
- Indicador visible de Producción, Preview o entorno sin verificar.
- Arranque recuperable: fallo de CDN/configuración muestra un mensaje claro y un botón de reintento; fallos de carga de módulos no ocultan la app.
- Lectura tolerante a datos de navegación local dañados.
- Nombre de caché PWA actualizado para que móviles reciban la nueva versión.
- Endpoint público de metadatos sin secretos: `/api/deployment-info`.

## Comprobación rápida
Desde cualquier IA que tenga abierto el workspace, ejecutar `./scripts/renzo-hub status`. Una IA que no tenga acceso a esta carpeta no debe editar otra copia como si fuera la vigente.
