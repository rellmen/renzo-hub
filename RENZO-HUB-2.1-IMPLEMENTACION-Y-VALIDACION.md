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
- **Verificación de código:** el parser HTML de Python pasó; `node --input-type=module --check` pasó para `world.js`, `sw.js` y `api/supabase-config.js`. El Preview nuevo abre el formulario de acceso y `/api/supabase-config` devuelve el endpoint del proyecto Supabase de staging. No se probaron operaciones autenticadas ni la carga de archivos, porque aún no hay cuenta de la usuaria en staging.
- **Publicación en Preview:** los commits `ca62b76` (aplicación e informe) y `c324c8f` (migración reproducible) están en la rama privada `renzo-hub-2-1-preview`. El primero activó deployment Preview Ready `https://renzo-hub-2-1-staging-7wsz1mvov-renzojesus99-1996.vercel.app/`. Se verificó que `main` y producción no recibieron el commit.
- **Límites externos:** la API de GitHub de este entorno sigue conectada como otra identidad y devuelve 404 para el repo privado. La API Vercel sigue devolviendo 403 para el equipo `renzojesus99-1996`. Ambos cambios sí se enviaron mediante las sesiones web autorizadas; el webhook GitHub→Vercel generó el Preview. Las APIs de los conectores siguen pendientes de reconexión para facilitar futuras actualizaciones.
- **Pendiente de la usuaria:** crear una cuenta propia en el Supabase de staging y confirmar el email si se solicita. Después se podrá validar login real, persistencia en Supabase, RLS de usuario y carga privada de documentos. Producción permanece intacta y no se ha promovido la rama.

## 11. Despliegue de producción e integración Jarvis (7 de octubre de 2026)

- **Autorización:** la usuaria autorizó promover la mega actualización y confirmó que las ocho fotos de skincare pueden incluirse en producción.
- **Repositorio y rama:** el repo privado `rellmen/renzo-hub` quedó conectado al proyecto Vercel original `renzo-hub`. Se creó `renzo-hub-2-1-production` desde la rama Preview y se configuró como Production Branch. El commit de producción `bcf5f0b87911ba60564171043a1cb3e38fa369d2` generó un despliegue Vercel `Ready` en [despliegue de producción](https://renzo-l8v9ik0y4-renzojesus99-1996.vercel.app/).
- **Variables de producción:** se guardaron `SUPABASE_URL` y `SUPABASE_PUBLISHABLE_KEY` en el entorno Production de Vercel. El endpoint `/api/supabase-config` del dominio estable devuelve la URL del Supabase de producción; la clave no se incluye en este informe.
- **Estado real del dominio:** el detalle de Vercel muestra `renzo-hub.vercel.app` entre los dominios del nuevo despliegue. Sin embargo, al abrir ese dominio en una sesión nueva, la página aún muestra la interfaz anterior “PERSONAL MICROAPPS”; la URL directa del nuevo despliegue muestra la pantalla privada de inicio de sesión. Por tanto, no doy por validado el contenido que reciben los usuarios en el dominio estable. La opción Promote aparece deshabilitada en Vercel. Queda pendiente resolver esta discrepancia de alias/caché o configuración de salida y volver a comprobar el dominio.
- **Fotos:** se autorizaron explícitamente para producción. La página estable todavía sirve una interfaz anterior; no se ha verificado que las ocho imágenes sean accesibles desde el despliegue efectivo del dominio estable.
- **Supabase producción:** en `mgncykyrhavpepfggmng` se aplicaron migraciones aditivas de `hub_records`, grants limitados, `hub_user_state` y bucket privado `hub-private` con RLS y políticas por propietario. Se verificó que el recuento de filas existentes en tablas originales no cambió; no se copiaron ni borraron filas. Sigue pendiente un backup exportable completo.
- **Validación:** el despliegue está listo y el URL directo muestra autenticación, pero no se ha probado un inicio de sesión real, escrituras RLS o carga de archivos con la cuenta de la propietaria. El producto completo de la Master Specification sigue parcialmente implementado; véase el inventario de pendientes de la sección 8.
- **Jarvis / n8n:** está confirmado que usa n8n, APIs de Google y Telegram, y que se desea flujo en ambos sentidos. Aún faltan la URL base de n8n, webhooks/rutas de entrada y salida, método de autenticación y contrato de datos/acciones. No se han transmitido datos de nómina, calendario o Hub a n8n, Google o Telegram.
- **Bloqueo concreto para Jarvis:** entregar la URL pública de n8n y las rutas de webhook, configurar el secreto de acceso en variables seguras de Vercel y definir el alcance de Calendar y los mensajes permitidos por Telegram. La integración bidireccional no puede conectarse de forma verificable sin esos datos.


## 12. Auditoría de Jarvis desde el portátil y cambios locales (7 de octubre de 2026)

- **Sesión local:** se abrió la sesión existente de Safari en `nodalys.app.n8n.cloud`; no se copiaron ni se mostraron valores de credenciales.
- **Workflow principal:** `Jarvis · asistente personal (Telegram)` aparece publicado. El canvas muestra Telegram Trigger, entrada de texto/audio/PDF, el agente Jarvis y herramientas de Gmail, Calendar, Google Tasks, Sheets y Contacts. La nota del workflow indica que solo acepta el chat propio y que los PDF de nómina pasan al Payroll Agent.
- **Entrada de nóminas:** `Payroll Agent · Entrada (Drive, webhook, reintentos)` todavía no está publicado. Su nota documenta `POST /webhook/payroll/intake` con cabecera de token; la propia configuración pide completar valores `PEGAR_`. Por eso no lo usé como webhook de Hub ni mandé documentos allí.
- **Código local:** `/api/jarvis` implementa salida autenticada Hub→n8n y entrada n8n→`hub_records` en Supabase, limitada a una cuenta y con `needs_review`; `jarvis-ui.js` añade captura manual desde System/AI Inbox; `world-extensions.js` sincroniza Portfolio y los resúmenes semanales/mensuales/anuales de Money; `index.html` ya monta ambos módulos. Nóminas y eventos de Calendar que entren quedan pendientes de revisión; no cambian datos de Money, Shift o Google Calendar automáticamente.
- **PWA:** el service worker ahora incluye los dos módulos nuevos en el app shell y cambia la clave de caché para que los dispositivos descarten el shell anterior.
- **Verificación ejecutada en local:** sintaxis JavaScript de los módulos nuevos y endpoints, validación del HTML y el módulo inline. No se pudo validar flujo autenticado extremo a extremo porque todavía no hay usuario de staging ni variables de Jarvis configuradas.
- **Por hacer para activar la conexión:** publicar y completar la entrada segura del Payroll Agent; añadir un webhook Hub→Jarvis que enrute la captura al agente; configurar en Vercel Preview los secretos requeridos por `/api/jarvis`; y probar con datos ficticios. El webhook existente de nóminas espera un archivo binario y no es compatible con el evento estructurado que emite el Hub.
- **Publicación:** no se promovieron estos cambios locales a ninguna rama o dominio. Primero deben revisarse en Preview y luego validarse login, RLS y los dos sentidos de integración. La resolución del dominio estable de producción sigue pendiente.

## 13. Actualización de Preview y validación de la conexión Jarvis (7 de octubre de 2026)

- La rama privada `renzo-hub-2-1-preview` contiene la API y la interfaz de Jarvis, Portfolio/ Money, la inicialización única de ambos módulos y el cambio del service worker para precargar los nuevos módulos. Commits verificados: `1dd14c3` (montaje), `1435be7` (elimina montaje duplicado) y `e619e82` (caché PWA); los módulos `api/jarvis.js`, `jarvis-ui.js` y `world-extensions.js` ya estaban en esa rama.
- Vercel muestra el Preview de staging en estado `Ready`, sin errores de función observados. La pantalla privada de inicio carga correctamente en el último deployment. `GET /api/jarvis` responde solo con estado: `outboundConfigured:false` e `inboundConfigured:false`; por tanto no se envían datos ni se da por conectada la integración.
- En Safari del portátil sigue abierta la sesión del workflow de n8n `Payroll Agent · Entrada`. El workflow no está publicado y la nota confirma que aún hay valores `PEGAR_` por completar. La ruta existente espera un PDF binario y no es el contrato JSON del Hub. No se cambió el workflow ni se activó un webhook público.
- El endpoint del Hub autentica la salida con sesión Supabase y token secreto hacia HTTPS. La entrada exige token independiente, guarda en Supabase staging bajo propietario configurado y marca los elementos como `needs_review`; nómina/calendario no actualizan automáticamente Money, Shift ni Google Calendar. Falta enlazar un flujo JSON de n8n al nuevo endpoint.
- **Validación pendiente:** no se creó un usuario de staging ni se probó login, RLS con sesión real, captura saliente, entrada de n8n o recepción en AI Inbox. Para completar Jarvis hacen falta los valores de conexión en Vercel Preview y n8n y publicar el webhook protegido; la publicación puede hacer accesible una URL pública autenticada y requiere confirmación en el momento de activarla. Producción permanece sin estos cambios y no se promovió.

## 14. Study/Dutch, Car y presentación móvil (7 de octubre de 2026)

- Se movió Dutch fuera de Work y se añadió la app Study, con una clase por día en una ruta de siete temas rotativos: almacén, cantidades, entregas, conversación, hora, incidencias y repaso. Cada clase reúne vocabulario, frase modelo, gramática, aplicación escrita y registro de minutos/respuesta en el historial existente de aprendizaje. No se presupone nivel, turno ni horario; la autoevaluación es opcional y el avance se guarda en `hub_records`/estado compartido existentes, sin nueva tabla ni pérdida de registros anteriores.
- El módulo Study incluye las dimensiones de evaluación ya previstas, tarjetas personales y repaso espaciado básico. La corrección adaptativa, audio, pronunciación y tutor conversacional de IA quedan pendientes: no hay proveedor de IA/voz configurado para evaluar respuestas.
- Se activó Car como una página separada. El único formulario de esa app envía un gasto de categoría `car` a `/api/jarvis`; el endpoint valida importe positivo en EUR y no lo escribe directamente en Money. El panel deja claro que el retorno a AI Inbox depende de la conexión de entrada. La conexión Hub→Jarvis estaba sin configurar (`outboundConfigured:false` en la última consulta), por lo que no se ha enviado ningún gasto y el botón permanece deshabilitado.
- Se retiró Habits de la portada. Home ahora agrupa las apps en zonas de aprender/construir, cuidar energía y mantenerse al día, con espacio táctil, jerarquía y emojis. El estado real, alertas y quests de Home quedan plegados y compactos. Se renovaron los iconos PNG de la pantalla de inicio y el nombre/colores de PWA; el service worker usa una clave nueva para invalidar el shell anterior.
- **Copia de seguridad:** snapshot local previo en `/private/tmp/renzo-hub-pre-study-car-20261007-035626` (la hora exacta está en el nombre real del directorio).
- **Verificación local:** parseo correcto de `world.js`, `jarvis-ui.js`, `api/jarvis.js`, `sw.js` y del módulo inline de `index.html`; JSON del manifest válido; PNGs verificados a 180, 192 y 512 px. Un envío simulado confirmó que un gasto Car válido llega al webhook mock y que importe inválido se rechaza antes del envío. No se probó login, RLS, persistencia entre dispositivos ni envío real a n8n porque no hay una cuenta de staging y webhook de salida funcionales en este entorno.
- **Publicación y herramientas de diseño:** el directorio local no tiene commits ni remote configurado, por lo que estos cambios no se han enviado al repositorio privado ni a Vercel Preview. Figma devolvió el límite de llamadas MCP del plan Starter al inspeccionar el archivo creado anteriormente; no se pudo completar el diseño allí. No hay conexión ni herramienta Lovable en esta sesión. Producción no se modificó.
