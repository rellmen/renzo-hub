# RISE HUB Nocturne · transición reversible sin pérdida del sistema clásico

**Estado:** preparación técnica, NO autorización de corte automático. 22-10-2026.
**Regla:** el dominio público `renzo-hub.vercel.app` permanece en el despliegue clásico hasta superar TODOS los controles. No se mueven usuarios, datos privados, `service_role` ni contraseñas entre bases.

## Anclajes verificados (verificar de nuevo antes de ejecutar)

| Elemento | Valor |
|---|---|
| Proyecto Vercel clásico (producción) | `rise-hub` / `prj_G7Rzu7cpQuKo3wnByqNVgQ6gpjDd` |
| Despliegue clásico de rescate, READY | `dpl_5Rh9Ram6QBVr8LFVXDx6eyXEueLr` |
| Commit clásico preservado | `ebd01738670b93cf12f586369aba728e446d12ad` |
| Alias público a proteger | `https://renzo-hub.vercel.app/` |
| Alias clásico alternativo **ya asignado**, GET / y /api/supabase-config = 200 | `https://rise-hub-classic-renzojesus99-1996.vercel.app/` |
| Proyecto Vercel React staging | `renzo-hub-2-1-staging` / `prj_kt9EGP7NvU1SghR5wJrbXMptDJMl` |
| Proyecto Vercel candidato Green ya existente | `rise-hub-nocturne-qa` / `prj_32rPUdYicngL3YfAPKPWecBGXsNw` (NO es `rise-hub` público) |
| Supabase producción | `mgncykyrhavpepfggmng` |
| Supabase staging (NO usar en público) | `zpueziugbezqxompwsol` |
| Rama de integración Nocturne | `staging`; **no** mezclar indiscriminadamente todo `staging` en `main` |

El alias de rescate **no** significa que un rollback de escrituras en BD esté garantizado, ni que usuarios externos puedan atravesar la protección Vercel sin comprobarlo. Testar acceso en una ventana normal con la cuenta autorizada antes de promocionar.

## Arquitectura de compatibilidad: blue/green

- **Blue (clásico):** dejar el proyecto y su configuración de raíz (`framework:null`, raíz repo, `vercel.json` con output `.`) intactos. Es el origen de verdad hasta completar paridad.
- **Green (React):** utilizar el proyecto existente **`rise-hub-nocturne-qa`** (no crear uno nuevo), que compila TanStack Start desde `apps/rise-react`. Se corrigió **solo su entorno Vercel `production`**: URL + clave publicable VITE y servidor hacia Supabase producción, `VITE_NOCTURNE_RELEASE_TARGET=production`, `VITE_ENABLE_SELFLEARN_AWARDS=false`; comprobados con la API de Vercel, sin mostrar claves. Sus variables `preview` con rama `staging` permanecen separadas. El nombre `production` aquí es el target **del proyecto QA aislado**, NO el dominio principal de RISE HUB. Antes de presentar Green como candidato listo, generar un despliegue nuevo y validarlo en su URL. No cambiar el proyecto Vercel clásico para construir Green.
- **Puente:** la pantalla Ajustes de Green ofrece un enlace permanente a Blue mediante el alias de rescate. Permite usar funciones clásicas no migradas. Los datos de ambas vistas solo pueden converger si apuntan al **mismo** Supabase producción y a esquemas compatibles.
- **Cortafuegos:** `nocturne-environment.mjs` rechaza el backend staging en los dominios de producción y el backend producción en el dominio staging. Un candidato Green con URL única debe compilar además con `VITE_NOCTURNE_RELEASE_TARGET=production` y verificarlo por inspección del despliegue antes de mover un alias.
- **SelfLearn:** XP y FSRS experimentales quedan desactivados fuera de los hosts de staging reconocidos, aunque `VITE_ENABLE_SELFLEARN_AWARDS=true` se haya heredado por error. En producción el usuario seguirá usando la versión clásica para acreditación hasta que estén instaladas y ensayadas las transacciones nuevas.

## Diferencias de BD: auditoría reproducible

Ejecutar **solo lectura** `supabase/verify/nocturne-production-readiness.sql` en los dos proyectos. Resultado el 22-10-2026:

| Requisito | Staging | Producción |
|---|---|---|
| RLS de `hub_records` y `hub_user_state` | Sí | Sí |
| Cuatro políticas owner `hub_records` | Sí | Sí |
| RPC `selflearn_finalize_lesson` | Sí | **No** |
| RPC `selflearn_review_vocabulary` | Sí | **No** |
| Trigger `selflearn_guard_records` habilitado | Sí | **No** |

Los borradores de migración y reversión están en `supabase/pending/20261022090000_selflearn_transactions.sql` y `.rollback.sql`; **no ejecutarlos en producción** sin comparar el comportamiento con clientes legacy y realizar un ensayo sobre copia aislada. El trigger puede alterar/rechazar actualizaciones antiguas; comprobar importaciones offline, XP histórico, vocabulario FSRS, concurrentes y rollback sin pérdida. Ejecutar advisors de Supabase tras cualquier DDL; los avisos de seguridad heredados también requieren revisión.

## Gates para preparar y activar Green

1. **Preservación:** comprobar que el dominio público y el alias de rescate apuntan al SHA clásico fijado, que sirven HTML de la app y que `/api/supabase-config` responde URL de producción. Guardar IDs, aliases y configuración del proyecto Vercel antes de cualquier modificación.
2. **Código:** integrar las correcciones de aislamiento, login production-aware y acceso clásico de este PR; compilar, ejecutar CI general y React, 7 hashes JPEG originales y verificar las 11 rutas.
3. **Candidato real:** crear un despliegue TanStack con raíz `apps/rise-react`, variables **solo publicables** de Supabase producción y `VITE_NOCTURNE_RELEASE_TARGET=production`; `VITE_ENABLE_SELFLEARN_AWARDS=false`. Inspeccionar el build resultante para descartar `zpueziugbezqxompwsol`, sin imprimir claves. NO usar `service_role` en el frontend.
4. **Preflight de red:** `node tools/nocturne-release-preflight.mjs --candidate https://<URL-unica-green>/`. El script es de solo lectura y bloquea candidatos con Supabase staging, falta de HTML Nocturne, rutas rotas, PWA ausente o respaldo sin Supabase producción. `--strict` **no** declara el corte seguro: exige también paridad funcional real.
5. **Paridad funcional:** contrastar Ares, proyectos, SelfLearn, Gym, Skin, Money, Notes, Body, Food, ajustes y los módulos **clásicos aún ausentes** (Nóminas, Shift Tracker, My Finance, funciones Jarvis, etc.). Cada operación de lectura/escritura debe validarse con datos autorizados; no introducir registros ficticios en cuentas reales. Usuario optó por omitir cuenta de QA y declara prueba de interfaz en iPhone: esas decisiones **no son pruebas de CRUD simultáneo u offline**.
6. **Operaciones:** mantener el cambio en modo prueba o enlace secundario hasta comprobar sesiones, API legacy, recursos, Service Worker sin caché privada, CSP, redirecciones y autenticación en dominio real. Hacer prueba de rollback del alias antes de iniciar corte público y guardar la evidencia.
7. **Promoción:** solo si Green y Blue están verificados, configurar la asignación del dominio público al candidato por una ruta que Vercel admita (mismo proyecto o transferencia revisada de dominio). Si la asignación de alias falla, abortar; **no borrar ni desasignar manualmente Blue sin prueba previa**. Nunca reutilizar un deployment construido con Supabase staging.
8. **Monitorizar y volver atrás:** si fallan auth, rutas, persistencia, CSP, endpoint, SW o paridad, reasignar el alias público a `dpl_5Rh9Ram6QBVr8LFVXDx6eyXEueLr` mediante `assign_alias` del proyecto `rise-hub`, y verificar GET /, /api/supabase-config, rutas clásicas e IDs tras restauración. Mantener el alias de rescate invariable. Si se hubiera modificado la configuración del proyecto, restaurar los valores del paso 1; no asumir que reasignar el alias restaura framework/rootDirectory.
9. **Integridad:** el rollback de frontend NO revierte escrituras válidas realizadas en Supabase. Mantener migraciones aditivas cuando sea posible y tener un backup/copia restaurable antes de DDL incompatible. No ejecutar el script SQL rollback salvo aprobación del alcance e inspección del impacto.

## Prohibiciones de seguridad durante la preparación

No reasignar `renzo-hub.vercel.app` a staging. No copiar `auth.users`, sesiones, `service_role`, `.env`, fotos, nóminas ni datos de usuarios entre proyectos. No añadir RLS demasiado permisivo o SECURITY DEFINER para sortear un error. No declarar listo por HTTP 200 solamente. No desplegar por un simple merge `staging` → `main`: el proyecto clásico publica la raíz y el proyecto React `apps/rise-react`.

**Estado actual:** alias clásico preparado y comprobado; barreras de host + fallback React implementadas en rama de trabajo; migración de SelfLearn a producción y candidato Green real aún pendientes. El dominio público no se toca.
