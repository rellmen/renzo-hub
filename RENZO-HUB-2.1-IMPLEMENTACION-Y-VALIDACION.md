# Renzo Hub 2.1 — especificación recuperada, implementación y validación

Fecha de trabajo: 7 de octubre de 2026 (Europe/Amsterdam).

## 1. Especificación consolidada recuperada

La conversación referenciada estaba truncada. El 7 de octubre de 2026 se recibió y leyó el documento completo `RENZO_HUB_2.1_MASTER_INSTRUCTIONS.md` (33 secciones), que pasa a ser la referencia consolidada para continuar este trabajo.

### Misión y arquitectura

Renzo Hub organiza el mundo personal de Renzo, no una colección de microapps. Debe responder qué ocurre, qué necesita atención, qué hacer ahora y si hay progreso real. Home muestra contexto y siguiente acción; Body, Work, Money y System agrupan las capacidades. Supabase es la fuente compartida de verdad cuando la integración está disponible. Personal Engine guarda reglas relativamente estables; Intelligence Engine observa datos cambiantes. No deben confundirse.

### Experiencia y navegación

Mantener Home / Body / Work / Money / System. Home debe ofrecer ENTER MY WORLD, contexto actual, estado, prioridad y alertas apoyadas por datos. La estética puede inspirarse en interfaces RPG con identidad propia y sin copiar sus elementos. La gamificación solo representa acciones reales.

### Contexto y Personal Engine

El sistema debe admitir Morning Shift, Evening Shift y Vacation, semanas mixtas y excepciones por día. Prioridad de contexto: excepción específica, override explícito, calendario, horario importado, patrón recurrente y modo manual. Nunca inventar un turno. El Personal Engine admite perfil, reglas de ejecución, atención, motivadores, estrés en modo observación, estilo de aprendizaje, decisiones, límites de proyectos y carrera. Las reglas importantes no se modifican silenciosamente.

### Focus e Intelligence Engine

Aplicar 1 proyecto principal + 1 secundario, con override y Project Slots configurables. Las nuevas ideas van a Idea Vault, separada de backlog y proyectos activos; decisiones de carga alta pueden tener enfriamiento de 48–72 h. Cada semana se prioriza un objetivo y un entregable observable. Output y cierre estratégico pesan más que el número de tareas. Distinguir Consumption, Construction, Application y Review.

Las alertas describen señales y evidencias; no diagnostican ni etiquetan a la persona. Los patrones muestran periodo, tamaño de muestra y confianza. Separar hechos, patrones, inferencias y recomendaciones; correlación no implica causalidad. Datos insuficientes deben producir “insufficient data”. Registrar si una recomendación fue aceptada, ignorada, rechazada o no pertinente.

### Áreas y flujos

- **Body:** Training, nutrición, compras, peso/progreso, skincare y recuperación.
- **Work:** My Workspace, Nodalys, Portfolio, Studies, Career y Projects, con información enlazable y sin duplicar tareas.
- **Dutch / Studies:** práctica A1–B1, escucha, lectura, escritura, pronunciación y neerlandés logístico; Learn → Build → Apply → Review.
- **Money:** salario, horas, extras, deducciones, gastos, combustible, ahorro y vistas semanal/mensual/anual. Nóminas y recibos pasan por extracción, confianza y validación humana antes de guardarse.
- **News / AI Ecosystem:** informes semanales y mensuales, captura desde IA, AI Inbox y Capture to Hub para tareas, ideas, gastos, estudios, documentos y otras entradas. Las ideas capturadas no se activan automáticamente.
- **Reports / intelligence:** ejecución, outputs, Body, aprendizaje, Money, foco, wins, riesgos, patrones y próxima semana; cada métrica procede de datos reales.

### Seguridad y despliegue

Supabase mantiene el modelo compartido con RLS por propietario. Revisar autenticación, grants y políticas antes de ampliar datos personales. Validar en Preview/Staging. No promover a producción hasta validar; preservar filas y funciones existentes.

## 2. Phase 0 — snapshot y auditoría

- Snapshot local íntegro de `renzo-hub-news` guardado en `snapshots/renzo-hub-news-20261006T222739Z/` antes de editar.
- No se obtuvo un backup de datos de Supabase ni de Vercel. La inspección del proyecto productivo fue solo de metadatos y esquema; no se consultaron filas. El usuario creó después un proyecto Supabase separado para staging.
- Al inicio de la auditoría, el directorio de la app no era un repositorio Git y no contenía `.vercel/` ni `supabase/`; posteriormente se inicializó Git local. No hay CLI de Vercel instalada.
- La app local es una PWA estática Cloud V2 con Supabase Auth y datos existentes de Skin, Gym y News; también conserva Food. La copia local no representa toda la evolución del esquema remoto.
- El proyecto Supabase remoto está activo en PostgreSQL 17.11; hay 3 migraciones aplicadas. Encontré nueve tablas `public`; todas tienen RLS habilitado y políticas de propietario para `authenticated`. No encontré vistas públicas. Las funciones públicas observadas son `handle_new_user` (SECURITY DEFINER, ejecución limitada a `postgres` y `service_role`, search_path vacío) y `set_updated_at` (invoker).
- Los asesores de Supabase no reportan hallazgos de rendimiento. El asesor de seguridad reporta que Leaked Password Protection está desactivada. La guía de Supabase confirma que esta protección rechaza contraseñas conocidas como filtradas y que requiere Pro o superior: [Password security](https://supabase.com/docs/guides/auth/password-security).
- Hallazgo de permisos para remediar en staging: `anon` conserva grants amplios —incluidos `TRUNCATE`— en `profiles`, `skin_notes`, `skin_routine_logs` y `user_settings`. RLS no filtra `TRUNCATE`. No he cambiado estos grants en producción; se debe retirar el privilegio innecesario en el entorno de prueba y validar acceso normal autenticado/no autenticado.
- El proyecto separado `Renzo Hub Staging` (ref `zpueziugbezqxompwsol`) está activo en `eu-central-1` y comenzó vacío. No se copiaron datos ni usuarios de producción.

## 3. Cambios implementados en el checkout local

- Añadida navegación principal Home / Body / Work / Money / System conservando los módulos Skin, Gym, Food, News y Settings existentes.
- Añadida portada ENTER MY WORLD y el panel “What should I do now?”; turno y prioridad permanecen vacíos hasta que el usuario los registre.
- Añadidos Project Slots Primary / Secondary, límite configurable 1–2, Backlog, Idea Vault, enfriamiento de 48 horas y override explícito al promover.
- Añadido Weekly Sprint con objetivo, entregable, fecha, siguiente acción y bloqueo.
- Añadidos registros de aprendizaje Dutch/Studies con Consumption / Construction / Application / Review, captura manual Capture to Hub / AI Inbox, reportes semanales/mensuales locales y feedback de recomendaciones.
- Añadido Personal Engine editable y override manual de turno de hoy. No se conecta al calendario ni infiere el horario.
- Añadida vista Money vacía con registro manual local, sin cifras precargadas ni extracción de recibos.
- Añadidos estados de evidencia y confianza: con pocos datos se informa “insufficient data”; no se generan patrones ni diagnósticos.
- Actualizado el cache key del service worker y la lista del app shell para incluir `world.js` y eliminar cachés antiguos al activar la nueva versión.
- Por seguridad de staging, las nuevas funciones guardan en `localStorage` separado por usuario autenticado. No escriben en Supabase ni sincronizan entre dispositivos todavía. Skin, Gym y News siguen usando sus tablas Supabase actuales.
- Se aplicó al staging una migración reproducible con las nueve tablas existentes, constraints, índices, triggers y políticas de propietario. Todas las tablas tienen RLS; `anon` no tiene grants de tabla y `authenticated` solo tiene SELECT/INSERT/UPDATE/DELETE sujetos a RLS. No se copiaron filas. Archivo local: `renzo-hub-news/supabase/migrations/20261006234511_baseline_renzo_hub_staging.sql`.

## 4. Validación ejecutada

- Parser HTML de Python: pasó.
- Comprobación de sintaxis JavaScript para el módulo inline de `index.html`, `world.js`, `gym.js`, `news.js` y `sw.js`: pasó.
- Comparación con el snapshot: solo difieren `index.html` y `sw.js`; `world.js` es el nuevo archivo. Los assets y módulos existentes no cambiaron.
- Auditoría remota de RLS, políticas de propietario, funciones y grants: completada en modo lectura. No se escribió ni eliminó ninguna fila; no se aplicaron migraciones ni se modificó Auth.
- Staging verificado después de la migración: nueve tablas con RLS habilitado, políticas por propietario, cero filas, cero grants a `anon`; migración `baseline_renzo_hub_staging` registrada. Security advisor devolvió cero hallazgos. El asesor de rendimiento solo señaló cuatro índices no utilizados, esperable en tablas de staging vacías; no se eliminaron.
- No se probó alta/login de Auth ni una sesión real para evitar crear usuarios de prueba. El Preview aislado ahora está configurado para el proyecto Supabase staging; la validación autenticada sigue pendiente hasta que la propietaria cree su propia cuenta.
- El Preview mostró la pantalla de acceso y `/api/supabase-config` respondió con el endpoint del staging. No se introdujeron credenciales ni se hicieron escrituras de usuario.

## 5. Estado por fase

| Fase | Estado |
|---|---|
| Phase 0 — backup, auditoría, permisos/RLS | Snapshot del código, auditoría de metadatos y grants/RLS seguros en staging completados; falta backup exportable de producción. |
| Foundation / World Experience | Navegación, Home y shell añadidos; publicados en una rama Preview privada y protegida por inicio de sesión de Vercel. |
| Data | Esquema base de nueve tablas y la tabla compartida `hub_records` reproducidos y verificados en staging; las funciones nuevas de frontend siguen usando almacenamiento local. |
| Money | Captura manual local implementada; falta backend, nóminas, validación y reportes completos. |
| Body | Módulos previos conservados; check-in nuevo local; falta integrar datos completos. |
| Work | Slots, Vault, Sprint, aprendizaje, captura e informes locales. |
| Dutch | Registro de aprendizaje y etapas; tutor, placement, voz y repetición espaciada pendientes. |
| News | Módulo existente conserva sincronización Supabase. |
| Personal Engine / Shift | Reglas y modo explícito de hoy; falta persistencia compartida, excepciones semanales y calendario. |
| Focus Engine | Regla de slots, cooling, sprint y señales explícitas; recomendaciones todavía básicas. |
| Intelligence Engine | Certeza conservadora y conteos locales; análisis de patrones requiere historia suficiente y datos compartidos. |
| AI Ecosystem | Inbox manual disponible; conectores, clasificación IA y agente semanal pendientes. |
| Validation | Validación estática y auditoría hechas; Preview abierto sin autenticación de la app. Flujos autenticados y validación integral pendientes hasta aislar Supabase. |

## 6. Bloqueos para continuar

1. El conector de Vercel devuelve 403 para el alcance `renzojesus99-1996` y no hay CLI instalada. Se autorizó e instaló la integración GitHub limitada al repositorio `rellmen/renzo-hub` y se creó un proyecto separado de Preview. El flujo de importación de Vercel lanzó también un despliegue inicial clasificado como Production dentro de ese proyecto nuevo; el proyecto original `renzo-hub` y su dominio de producción no se conectaron ni modificaron. El dominio estable del proyecto nuevo está asignado explícitamente a la rama `renzo-hub-2-1-preview` en Preview. El despliegue inicial aislado no expone contenido sin autenticación Vercel.
2. La rama de Supabase dentro del proyecto productivo no se pudo crear con su plan Free. El usuario creó un proyecto Supabase staging independiente; su esquema vacío ya se configuró y verificó. No se modificó el proyecto productivo.
3. El login real y las escrituras con propietario deben validarse en staging. La protección contra contraseñas filtradas aparece desactivada y requiere un plan compatible.

**El proyecto original de producción permanece intacto y la rama de actualización no se promovió.** El proyecto separado `renzo-hub-2-1-staging` tiene un despliegue inicial de tipo Production generado por el importador de Vercel, protegido por autenticación; su dominio estable de staging sirve la rama Preview. No se ejecutó ninguna escritura en Supabase.

## 7. Estado de conexión y repositorio (7 de octubre de 2026)

- El proyecto original `renzo-hub` permanece desconectado de Git. Para preservar producción, no se conectó ni se cambió su rama.
- La búsqueda del repositorio por el conector de Vercel falla por falta de autorización al alcance `renzojesus99-1996`. No se reintentó sin cambios de permisos.
- A petición del usuario se creó el repositorio privado [`rellmen/renzo-hub`](https://github.com/rellmen/renzo-hub) desde la sesión de GitHub del navegador; se eligió esa cuenta porque ya estaba autenticada en el navegador. El usuario autorizó esa elección.
- Verificado en GitHub: la rama `main` contiene los archivos de aplicación/configuración (`index.html`, `world.js`, `gym.js`, `news.js`, `sw.js`, manifiesto, configuración de Vercel, README y `.gitignore`), los tres iconos PWA y los ocho archivos `assets/skin_1.jpeg`–`assets/skin_8.jpeg`.
- El repositorio privado está bajo `rellmen`. La usuaria autorizó instalar GitHub App de Vercel con acceso limitado a ese repositorio. El conector GitHub auxiliar disponible aquí usa otra identidad (`rellme-lab`) y devuelve 404 para el repositorio privado.
- Vercel importa el repositorio en el proyecto separado `renzo-hub-2-1-staging`, usando como producción branch `main` y una rama distinta `renzo-hub-2-1-preview` para staging. El dominio `renzo-hub-2-1-staging.vercel.app` fue asignado en Vercel a Preview de esa rama. El despliegue Preview está Ready en `https://renzo-hub-2-1-staging-8gexjou3p-renzojesus99-1996.vercel.app`; la página muestra Renzo Hub y el formulario de acceso.
- El usuario autorizó incluir las ocho fotos en el repositorio y recibirlas en Preview. Las ocho están en la rama y el dominio sirve la app con autenticación Vercel. No se conectó el proyecto original a GitHub ni se promovió la rama Preview.
- El Preview de la rama ahora obtiene `SUPABASE_URL` y `SUPABASE_PUBLISHABLE_KEY` desde variables de entorno restringidas a Preview y al branch de staging; se comprobó que el endpoint devuelve el proyecto staging. El login todavía no se ha probado porque aún no hay usuario de staging. El conector GitHub devuelve 404 para la identidad secundaria, así que las actualizaciones del repositorio privado se realizaron desde la sesión autorizada de GitHub en el navegador.
- Supabase devolvió `0.01344 por hora` (moneda no indicada) y el usuario aceptó. La creación de la rama fue rechazada porque la organización `Daily Renzo` está en plan Free; no hubo cambios en producción.

## 8. Inventario de lo propuesto que aún no está hecho

- **Backup real de Supabase:** falta. No hay CLI ni acceso de exportación configurado. Snapshot local de código completado. El proyecto original de Vercel se inspeccionó mediante UI; el conector API no tiene alcance.
- **Staging y persistencia compartida:** el proyecto separado de staging tiene el esquema base y `hub_records`, sin datos de producción. Vercel Preview usa credenciales de staging restringidas a Preview/branch. El frontend aún guarda los módulos nuevos en `localStorage`; falta su sincronización con `hub_records`.
- **Permisos y Auth:** en staging `anon` no tiene grants sobre las tablas reproducidas; `authenticated` dispone de CRUD sujeto a RLS por propietario. `hub_records` sigue el mismo patrón. No se modificaron permisos de producción. Leaked Password Protection aparece desactivada y depende del plan.
- **Money completo:** solo hay captura local manual de ingresos/gastos. Nóminas, salario semanal del miércoles, extras, deducciones, combustible, presupuestos, objetivos, subscriptions, recibos/fotos, extracción IA con confianza, validación, análisis planned-vs-actual y proyecciones semanal/mensual/anual requieren modelo de datos, staging y datos validados.
- **Body completo:** Gym, Food y Skin previos siguen disponibles; el nuevo check-in es local. Falta compartir check-ins y unificar entrenamientos, nutrición, compras, peso/medidas, recuperación y tendencias.
- **Work conectado:** Project Slots, Vault, Sprint y registro de aprendizaje son prototipos locales. My Workspace, backlog y estados Today/Blocked/Waiting/Completed, dependencias, tareas enlazadas, Nodalys, Portfolio, Career y skills todavía no comparten registros.
- **Dutch tutor:** solo se pueden anotar sesiones y su etapa. Placement multidimensional, roadmap A1–B1, tutor conversacional, escucha/lectura/escritura/pronunciación, correcciones, repetición espaciada, racha y vocabulario logístico no están implementados; no hay servicio de IA o voz configurado.
- **News y AI Ecosystem:** News conserva la función existente de guardar resúmenes en Supabase; su importación automática no está. ChatGPT/Claude/Calendar, Capture to Hub externo, clasificación IA, AI Inbox compartido y agente semanal/mensual no están conectados porque no hay integraciones ni backend seguro configurados.
- **Shift/Context y Personal Engine completos:** el override de turno cubre solo hoy y el perfil editable es básico. Faltan calendario, excepciones por fecha, semanas mixtas, horario laboral importado, reglas completas de atención/motivación/aprendizaje/decisión/carrera y persistencia compartida.
- **Focus e Intelligence completos:** el prototipo aplica slots y enfriamiento, y muestra estado de sprint. Falta cruzar eventos reales de las áreas, medir project switching y actividad/outputs, generar alertas con evidencia, seguimiento de aceptación y recomendaciones adaptativas. No se calculan patrones porque los datos comparables no existen en esta capa; reportar confianza sería inventarla.
- **Reportes y puntuación del sistema:** existen conteos locales sencillos de aprendizaje y cierre. No están integrados Body/Money/Dutch/Work, score semanal transparente, recuperación, tendencias mensuales por turno, correlaciones ni análisis automatizado. Requieren eventos consistentes y suficiente historial.
- **World Experience y gamificación transversal:** se añadieron la portada y navegación. XP/streaks siguen limitados a Ascend/Gym; quests, milestones, nivel y adaptación visual de todo el Hub aún no existen.
- **PWA y validación integral:** se invalidó el cache antiguo y se incluyó el nuevo módulo en app shell. Preview se verificó visualmente y responde con configuración de staging; offline, login, writes, Safari/PWA y sincronización entre dispositivos quedan pendientes.
- **Publicación:** se creó el proyecto Preview separado y se verificó la URL de Preview protegida. No se promovió la rama Preview a producción. Vercel creó un despliegue inicial de tipo Production dentro del proyecto separado al importar Git; su acceso requiere autenticación Vercel. El proyecto/dominio productivo original permanece intacto.

## 9. Actualización de conexión a staging (7 de octubre de 2026)

- El usuario creó el proyecto Supabase independiente `Renzo Hub Staging` (`zpueziugbezqxompwsol`). Se reprodujeron allí el esquema base de nueve tablas y `hub_records`, con RLS y políticas por propietario; no se copiaron filas ni se consultaron datos personales de producción. Los tres archivos de migración aplicada están en `renzo-hub-news/supabase/migrations/`.
- Se configuraron `SUPABASE_URL` y `SUPABASE_PUBLISHABLE_KEY` en Vercel solo para `Preview` y solo para la rama `renzo-hub-2-1-preview`.
- La rama Preview del repositorio privado ahora carga configuración desde `/api/supabase-config`; el endpoint devuelve las variables del entorno de Vercel sin persistirlas en código. Se añadió `api/supabase-config.js`. Los commits relevantes son `302ab80` y `a1744fd`.
- Vercel generó despliegues `Ready` desde el branch Preview. Se abrió el frontend y el endpoint respondió con la URL de staging y la clave publicable de staging. El navegador no registró errores del frontend durante la carga. No se introdujeron credenciales ni se creó un usuario de prueba.
- El inicio de sesión y escrituras de la app siguen pendientes porque staging no tiene usuarios; el esquema está vacío. `hub_records` acepta los dominios acordados, validación de tipo/confianza y bandera de revisión. La revisión de grants detectó permisos extra heredados; la migración `limit_hub_records_table_grants` (`20261007001022`) los revocó y concedió solo SELECT/INSERT/UPDATE/DELETE a `authenticated`. La consulta posterior confirmó esos cuatro grants y ninguno para `anon` o `PUBLIC`; RLS limita operaciones al propietario. Security advisor informó cero hallazgos. El frontend aún no consume `hub_records`: las capas nuevas siguen usando almacenamiento local.
- GitHub contiene `20261006234511_baseline_renzo_hub_staging.sql`, `20261007000206_add_shared_hub_records.sql` y `20261007001022_limit_hub_records_table_grants.sql`. Se retiró del branch el archivo duplicado cuyo timestamp no coincidía con la versión aplicada.
- El último despliegue de `renzo-hub-2-1-preview` está Ready en [Vercel Preview](https://renzo-hub-2-1-staging-o13kx8zvw-renzojesus99-1996.vercel.app/) (commit `5fbdbe2`) y muestra la pantalla de acceso. La API del conector Vercel sigue limitada por el alcance secundario; la comprobación se hizo desde la sesión del navegador.
- **Protección y estado:** `main`, el proyecto Vercel original y Supabase de producción no se modificaron; no se promovió a Production. El despliegue inicial del proyecto Vercel separado conserva su etiqueta `Production`, pero el dominio estable de staging está asignado al branch Preview. Los datos de producción siguen sin backup exportable.

## 10. Continuación de la mega actualización (7 de octubre de 2026)

Esta sección actualiza el estado anterior, que reflejaba una versión intermedia del código.

- **Persistencia compartida:** `world.js` ahora carga y guarda la capa World en `hub_user_state` y `hub_records` por usuario autenticado; combina caché local con la nube y migra registros locales al abrir sesión. No incluye una service-role key.
- **Migración aplicada solo a staging:** `20261007002619_add_shared_world_state_and_private_storage.sql` añade `hub_user_state` con RLS por propietario y un bucket privado `hub-private`, con permisos por carpeta/usuario. La verificación confirmó RLS habilitado, bucket privado y cuatro políticas owner-only de Storage. No se copiaron filas de producción.
- **Work / Focus / Personal:** tareas y estados Today / This week / Blocked / Waiting / Backlog / Completed, prioridad, fecha, enlace de proyecto y bloqueadores; slots de proyectos; Idea Vault con enfriamiento elegible de 48 o 72 horas; Weekly Sprint, reglas personales editables, overrides de turno por fecha y horario semanal manual explícito. No se infieren turnos.
- **Body / Dutch / Money:** nuevos check-ins Body y sesiones Dutch con dimensiones de habilidad, vocabulario y repetición espaciada básica; registros Money manuales y formulario de nómina con campos de ingresos, horas y deducciones, que exige confirmación humana. Los archivos de Capture to Hub/AI Inbox quedan en Storage privado y requieren revisión del usuario.
- **Intelligence / World:** Focus Alerts solo se forman con datos registrados; informes semanal/mensual y feedback; quests y XP derivan de acciones registradas (10 XP por evento elegible, nivel cada 100 XP). No se inventan patrones; con evidencia limitada se indica insuficiencia. La extracción de facturas/nóminas por IA y las integraciones externas siguen sin proveedor configurado.
- **PWA:** `index.html` conserva navegación elegida y posición de scroll por usuario, presenta aviso de nueva versión disponible y conecta el módulo World a Supabase; `sw.js` usa clave de caché nueva y obtiene la configuración de Supabase desde la red con fallback offline.
- **Verificación de código:** `node --input-type=module --check` pasó para `world.js`, `sw.js` y `api/supabase-config.js`. La inspección HTML estática y la validación visual/autenticada de la nueva versión desplegada todavía están pendientes.
- **Límites externos:** la API de GitHub de este entorno sigue conectada como otra identidad y devuelve 404 para el repo privado. La API Vercel sigue devolviendo 403 para el equipo `renzojesus99-1996`; no se creó un deployment nuevo por esas APIs. El navegador autenticado del propietario de GitHub queda como vía para subir a la rama `renzo-hub-2-1-preview`; se comprobará si el commit dispara el deployment Preview automáticamente.
- **Pendiente de la usuaria:** crear una cuenta propia en el Supabase de staging y confirmar el email si se solicita. Después se podrá validar login real, persistencia en Supabase, RLS de usuario y carga privada de documentos. Producción permanece intacta y no se ha promovido la rama.
