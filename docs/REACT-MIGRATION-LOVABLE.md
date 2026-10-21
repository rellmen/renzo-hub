# RISE HUB — migración completa a React desde el diseño aprobado en Lovable

**Decisión 21 de octubre de 2026.** Renzo aprobó expresamente la interfaz del proyecto de Lovable **RISE HUB Nocturne** y preguntó por migrar toda la app actual a React. Se abandona el intento anterior de imitar el diseño mediante capas CSS sobre HTML heredado. El objetivo es **conservar el diseño React auténtico**, con comportamiento real y datos privados propios.

**Prototipo aprobado:** https://lovable.dev/projects/ca43e152-f7c7-4c8e-b925-01476b9053da
**Revisión fuente examinada:** `c68f0b618b59c16930bf1f6ad0e1b44e0bf81deb` (Lovable, React 19 + TanStack Start/Router + Tailwind 4).
**Ramas GitHub observadas al empezar:** main `ebd01738670b93cf12f586369aba728e446d12ad`; staging `e5630fef4b1c747316330b12c8340ea4ee60f530`.
**Rama integrable fase 0:** `feature/react-lovable-phase0-staging`, basada en staging; copia de diseño aprobada examinada desde main. **No cambiar producción mientras esté incompleta**.

## Arquitectura objetivo

1. **Frontend:** reutilizar de verdad el **código React/TSX, diseño, componentes, fotos y navegación** del proyecto de Lovable (AppShell, DesktopSidebar, MobileDock, TopBar, PageHero, PhotoModuleCard, MetricPanel, ProgressRing, dashboards y pantallas). Mantener Cormorant Garamond + Manrope, héroe de eclipse, tarjetas fotográficas y sistema de color oklch premium. No recrear el diseño con el antiguo `rx-*` o CSS vNext. El prototipo usa datos de ejemplo etiquetados; eliminarlos de la app autenticada y mostrar estados reales.
2. **Datos:** usar **el Supabase existente de cada entorno**: staging `zpueziugbezqxompwsol`, producción `mgncykyrhavpepfggmng`. Recuperar URL y publishable key vía `/api/supabase-config` exclusivamente **same-origin**, con `cache: no-store`. No incluir claves en el bundle ni copiarlas de un entorno al otro. RLS y perfil de usuario original permanecen intactos. No migrar bases ni modificar esquemas solo por cambiar UI.
3. **Backend/API:** mantener los endpoints serverless actuales en `api/`, contratos RPC, carga de archivos, verificaciones de autorización, acciones y aprobación Ares. No incorporar la base de datos de Lovable, que está desactivada y usa localStorage de demo.
4. **Estado real:** React Query para lecturas/caché, invalidación tras escritura; hooks especializados por dominio que llamen a servicios existentes o adaptaciones de lógica **pura** extraída de `world.js`, `gym.js`, `payroll.js`. Nunca montar simultáneamente dos clientes/guardados activos que dupliquen escrituras.
5. **Autenticación:** AuthProvider React con auth de Supabase; carga/salida, recuperación de sesión, limpieza al cambiar usuario, reautenticación y errores. Denegar acceso a cualquier pantalla privada sin sesión. Copia de seguridad/rollback de datos antes del corte.
6. **Coexistencia:** compilar app nueva en un artefacto independiente para staging y mantener la app antigua accesible durante pruebas (ruta o dominio aislado). Evitar que el Service Worker viejo tome control del React preview; versión y scope propios. Migración gradual por **dominios**, no un `index.html` mixto con dos renderizadores en el mismo nodo.
7. **Release:** una vez migrados y verificados *todos* los módulos, realizar PR de integración **staging → main** con respaldo y rollback de Vercel, único momento de sustituir UI pública.

## Matriz funcional de migración (no marcar hecho sin test autenticado)

| Área | React aprobado | Lógica real que se debe portar o reutilizar | Evidencia de aceptación |
|---|---|---|---|
| Home | `src/routes/index.tsx` | KPIs y resúmenes **reales**, tareas, objetivos, navegación | ninguna cifra ficticia; estado vacío honesto |
| Ares AI | `src/routes/ares.tsx` | `microapps/ares-ai.js`, `microapps/ares-center/ares.js`, autorizaciones, histórico | no aparentar IA online si no responde; no ejecutar sin aprobación |
| SelfLearn | `src/routes/aprender.tsx` | `microapps/selflearn/*`, `world.js`, FSRS, tutor, voz y sincronización | NL B2/EN C1, XP/FSRS, entrar-salir-retomar sin pérdida |
| Gym | `src/routes/gym.tsx` | `gym.js`, `microapps/gym/*`, fotos privadas, biblioteca, plan, timer | registrar/editar sesiones, sets, fotos y recarga de sesión |
| Money | `src/routes/dinero.tsx` | `microapps/finance/*`, `microapps/gastos/*`, bank imports, nóminas | importes correctos y rastreables, nunca balances demo |
| Skin | `src/routes/piel.tsx` | `microapps/skin/*`, inventario, pasos y fotos privadas | progreso persistente y privacidad |
| Projects | `src/routes/proyectos.tsx` | `world.js` (projects/tasks), `microapps/work/roadmap.js` | operaciones CRUD, RLS, progreso real |
| Body / Food | diseñar en React manteniendo coherencia Lovable | `microapps/body/*`, `microapps/food/*` | registros nutricionales/objetivos y panel Body |
| Payroll / Work | componentes nuevos React del mismo DS | `payroll.js`, Shift Tracker, deducciones/ORT, confirmaciones | cronología, importación, cálculos, DST y PDF intactos |
| Notes / News / Car | componentes React nuevos | módulos `microapps/notes`, `news.js`, historial coche | CRUD y rutas profundas |
| Settings / System / PWA | `src/routes/ajustes.tsx` + screens React | perfil, sesión, sincronización, exportación, estado/errores | no exposición de secretos; PWA iOS; offline |

## Fases ejecutables

**F0 · Seguridad y contrato:** auditar tablas/RLS, endpoints, rutas, y contratos; congelar inventario y criterios. Probar backups/exportaciones. Conservar un deployment anterior apto para rollback.

**F1 · App React funcional independiente:** copiar el código y assets reales del proyecto Lovable a un workspace/paquete separado; eliminar la API/estado ficticio; crear auth Supabase usando configuración de entorno por endpoint same-origin, React Query y layout protegido; mantener páginas de ejemplo SOLO con etiqueta de prototipo fuera de autenticación. CI build/lint/test y accesibilidad; desplegar preview aislado, nunca pisar `main`.

**F2 · Núcleo de datos:** extraer servicios TS/JS reutilizables de `world.js`, sin dependencia de DOM; migrar Home, proyectos, notas y perfil. Mantener identidad de cada registro, timestamps y reglas de merge.

**F3 · Dominios críticos:** migrar SelfLearn, Gym/Body/Food/Skin, Finanzas/Nóminas y Ares; tests de guardado/recuperación entre navegadores, cambios de usuario, offline y reautenticación. Las operaciones de pago/finanzas son especialmente sensibles.

**F4 · Calidad integral:** 320/375/390/430/768/1440px, Chromium+WebKit, teclado, foco, contraste AA, `prefers-reduced-motion`, imágenes contenidas, safe areas; captura de **cada pantalla interna**, no solo Home. PWA real en iPhone y actualización/cold start.

**F5 · Cutover controlado:** reconciliar primero `main` y `staging` (actualmente divergentes). PR a staging, CI verde + QA autenticado de staging; plan de rollback, paso posterior `staging → main` con autorización y release manifest/PWA únicos; verificar `/release.json` y `/api/deployment-info` contra el SHA final. No publicar hasta aquí.

## Gates que prohíben el despliegue

- Prototipo localStorage, cifras ficticias o acciones de Ares simuladas etiquetadas como reales.
- Sustituir React por una piel CSS sin portado funcional.
- Reescribir `world.js` sin preservar timestamps, merge y recuperación de datos.
- Mezclar claves/endpoint de staging y producción o deshabilitar RLS.
- Pruebas de sesión/guardado/fotos/finanzas pendientes; divergencia main/staging sin resolver.
- SW cache no versionada, dobles apps persistiendo sobre el mismo usuario, o falta de rollback.
- Falta de aprobación del resultado visual **y** funcional autenticado en staging.

## Notas de implementación

`apps/rise-react/src/lib/supabase-adapter.mjs` prepara un adaptador importable por React: lee configuración del mismo dominio, valida sus campos, falla cerradamente, obtiene cliente singleton desde una factory inyectada y nunca utiliza valores de demo. Los tests aislados permiten verificar el contrato antes de introducir el bundle React. **Este adaptador no significa que el port completo esté realizado.**

El proyecto Lovable original debe seguir editable como referencia de diseño, no debe publicarse ni conectarse a datos reales por accidente. Su React frontend **no se sustituye** por la UI vNext de producción.

**CI y release:** seguir `AGENTS.md`, `docs/RELEASE-CHECKLIST.md`; cualquier excepción se documenta y aprueba. No fusionar ramas divergentes a ciegas. Este documento es un plan de arquitectura y alcance técnico; todavía no afirma implementación completa.
