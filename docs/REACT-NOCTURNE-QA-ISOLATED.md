# RISE HUB Nocturne · despliegue QA independiente

## Ámbito

Este procedimiento crea **un proyecto nuevo y protegido** en Vercel, separado de los proyectos existentes `rise-hub` (producción) y `renzo-hub-2-1-staging` (legacy). **No modificar dominios, redirecciones, rutas, ramas de producción o variables del frontend clásico**. Mantener la rama `main` sin cambios.

| Ajuste QA | Valor |
| --- | --- |
| Repositorio | `rellmen/renzo-hub` |
| Rama | `staging` o SHA de commit verificado |
| Project root | `apps/rise-react` |
| Framework | TanStack Start / Lovable |
| Build | `npm run build` |
| Protección | SSO de Vercel para todos los despliegues (sin acceso público) |
| Indexación | `X-Robots-Tag: noindex, nofollow, noarchive` |
| Autenticación | Supabase **QA** con cuentas de prueba, nunca claves service role |
| Dominio | `*.vercel.app` de QA, **sin** reasignar `renzo-hub.vercel.app` |

La ruta `apps/rise-react/api/supabase-config.js` solo responde a GET con
`SUPABASE_URL` y `SUPABASE_PUBLISHABLE_KEY`. Rechaza `sb_secret_*`, `service_role`, URLs HTTP o dominios inesperados.
Las variables deben configurarse en el proyecto QA desde el panel privado de Vercel, no commitearlas al repositorio ni incluirlas en logs. Los valores nunca se derivan del ZIP Lovable.

### Verificaciones antes de invitar al usuario

1. Comprobar que `staging` pasó CI y `React Nocturne — Authentic Build` sobre **el mismo SHA**, con siete JPEG exactos.
2. Configurar Supabase QA con usuario(s) de prueba e RLS; jamás usar datos bancarios/nóminas/fotos reales para E2E.
3. Validar 401/403 sin sesión, lectura únicamente de filas del propietario, guardado/relectura de Body/Food, Gym/Skin, Work y Notas.
4. Desconectar la red, reiniciar navegador, recuperar sesión y comprobar cambio de cuenta: ningún dato de otro usuario debe aparecer en caché.
5. Verificar que `/api/supabase-config` no publica valores secretos, no se indexa y no responde a POST.
6. Verificar que Ares externo permanece **desactivado** salvo opt-in real y flags de preview; no se ejecutan aprobaciones ni agentes.
7. Confirmar errores accesibles, 320–1440 px, contraste, zoom, rutas directas y teclado.
8. Probar PWA WebKit y dispositivo iPhone real, incluida actualización de SW y revertir a versión anterior.
9. Registrar pruebas, hash, URL protegida, fecha y capturas sin datos sensibles. Solo entonces considerar cutover hacia producción.

**Limitaciones actuales:** Nocturne compila con imágenes auténticas, pero no ha pasado aún QA autenticada completa ni es equivalente al frontend legacy. Este documento no autoriza su publicación.
