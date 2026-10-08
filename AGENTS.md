# Renzo Hub: instrucciones para cualquier IA

## Esta copia de trabajo
- Esta carpeta es una copia local aislada para desarrollar Renzo Microapp OS Core v1. No es la fuente canónica ni debe publicarse o conectarse a Vercel/Supabase.
- Los cambios aquí no autorizan push, deploy ni modificaciones en `main` o Producción. Conserva la funcionalidad actual y usa esta copia para validación local.
- Se excluyeron `.env.local`, `.vercel/` y `.git/` de la carpeta de origen para no copiar credenciales ni estado de despliegue.

## Fuente vigente
- La fuente canónica de Renzo Hub es esta carpeta (`renzo-hub-news/`). Lee este archivo y `RENZO-HUB-CURRENT.md` antes de editar.
- Ejecuta `./scripts/renzo-hub status` al empezar. La salida compara el release local con Producción y Preview.
- No copies código desde una conversación antigua, una captura, Figma ni una preview. Parte siempre de los archivos actuales de esta carpeta.
- El release local incluye exactamente la versión que se sube a ambos proyectos; Vercel separa las variables y los datos de cada entorno.
- En esta copia no hay remoto Git configurado. Si trabajas fuera del workspace compartido, primero consigue acceso a esta carpeta o a un repositorio actualizado; no declares otra copia como fuente canónica.

## Entornos: no confundir
- **Producción / uso diario:** https://renzo-hub.vercel.app — proyecto Vercel `renzo-hub`, con Supabase de producción.
- **Preview / revisión:** https://renzo-hub-2-1-staging.vercel.app — proyecto Vercel `renzo-hub-2-1-staging`, rama `renzo-hub-2-1-preview`, con Supabase separado.
- Los datos/configuración de un entorno no se deben copiar al otro. El indicador de entorno de la app debe mostrar `PRODUCCIÓN` o `PREVIEW`; no publiques si aparece `ENTORNO SIN VERIFICAR`.
- Para un cambio normal, actualiza ambos entornos desde los mismos archivos actuales, conservando en cada despliegue su objetivo y configuración Vercel. Comprueba las dos URLs después.

## Edición y publicación
- Mantén el diseño móvil y escritorio, el acceso Supabase, las microapps Study y Dutch y la instalación PWA.
- No guardes claves de servicio ni credenciales en el código, documentación o comandos. La publishable key solo se sirve desde `/api/supabase-config` por entorno.
- Después de editar, incrementa `release.json`, actualiza `RENZO-HUB-CURRENT.md`, cambia la caché de `sw.js` e incluye esos archivos en el release.
- En Vercel, despliega `renzo-hub-news` al proyecto existente correcto. Para Preview usa target `preview` y la rama `renzo-hub-2-1-preview`; para Producción usa target `production`. Comprueba deployments y URLs sin forzar un team distinto del workspace conectado.
- No afirmes que algo está publicado hasta comprobar que ambas despliegues estén `READY` y que `/release.json` y `/api/deployment-info` respondan con el release y entorno esperados.
