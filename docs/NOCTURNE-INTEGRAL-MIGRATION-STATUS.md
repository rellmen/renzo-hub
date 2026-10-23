# Migración integral Nocturne · estado comprobado el 22-10-2026

Este informe **no declara terminadas las fases 1–5**. El PR es una integración incremental en una sola rama. El texto del último inventario de la conversación no se pudo recuperar: `read_thread` devolvió referencias opacas para las respuestas. Se ha usado el contrato versionado `REACT-MIGRATION-LOVABLE.md`, el código vigente y la petición actual.

## Verificado

- Base GitHub: staging `a29412fda98ed9ac898ea461fe4795683b13c5f9`; rama única `feature/nocturne-integral-migration`.
- Ambos proyectos Supabase `ACTIVE_HEALTHY`; las 22 tablas públicas tienen RLS. Sin DDL ni cambios de producción en esta ejecución.
- Instantáneas privadas de **21 tablas** por entorno: producción **937 filas**, staging **289 filas**. La tabla técnica `selflearn_tutor_quota` queda excluida. Copia completa Git: `git bundle verify` correcto, 127 referencias. También se conserva el diff sin commit del checkout canónico antiguo; no se modificó ese checkout.
- Ensayo PGlite: las 937 y 289 filas recuperan **exactamente sus valores**, comparando cada fila tras restaurar. Se reprodujeron los tipos de columnas; **no** acredita restauración completa de permisos, triggers, claves foráneas, Auth o Storage.
- Pruebas regresivas reproducen y corrigen pérdida del literal `$snap$`, identificadores SQL inseguros, aceptación de copias parciales, rutas de extracción fuera del destino y sobreescritura de archivos existentes.
- Exportación clásica y React con lógica idéntica comprobada: incluye `payroll_balance_imports`, orden estable, paginación de filas y archivos, límite real de 60 MB y filtro de propietario. React no descarga una copia incompleta y descarta resultados si cambia la cuenta.
- Payroll React: consulta de nóminas/contratos/turnos, paginación completa, estados originales, importes agrupados por moneda, acceso al documento y operaciones clásicas. No crea ingresos bancarios.
- Ares React: revisión de `ares_decision`/`ares_operation`, filtro owner/tipo/dominio/estado/updated_at; aprobación registrada sin ejecutar agentes. Inbox financiero conserva revisión clásica. Agent Monitor muestra historial real.
- Staging DB: prueba con rol `authenticated` del propietario, comparación de versión, rechazo de decisión obsoleta y aislamiento de lectura/escritura de otra identidad. **ROLLBACK** al finalizar. No equivale a login real por HTTP.
- Dominio público responde 200 con HTML Nocturne. En la comprobación remota, `/api/deployment-info` devuelve **404**: se añade el contrato a la raíz React y a SSR en este PR, junto con `/release.json`. Corrección local; no está publicada por esta ejecución.
- Alias clásico `/release.json`: 200, versión `2.53.1`.

Las copias personales permanecen fuera de Git, en el directorio privado `work/backups/` del chat (directorio 700, archivos 600). No se incluyen datos personales ni credenciales en este informe o PR. Instantáneas de cada entorno separadas: ninguna se importa al otro entorno.

## Paridad funcional actual y trabajo pendiente

| Módulo | React disponible | Pendiente para paridad completa |
|---|---|---|
| Payroll | Historial, periodos, importes y estados; acceso al clásico | Importación PDF, revisión/corrección, líneas, auditoría anual y saldos nativos; QA autenticada |
| Shift Tracker | Lectura de turnos y contratos originales | Alta/edición, motor semanal, ORT, descansos/DST, vacaciones, reconciliación y CSV nativos |
| Finance | Lectura de bancos/patrimonio/objetivos | Importación, edición de presupuestos/activos/objetivos, ingresos confirmados y reconciliación |
| Gastos | Gastos bancarios resumidos dentro de Money | Flujo dedicado, categorías/reglas, revisión e importación |
| SelfLearn | Práctica, checkpoints, RPC de acreditación/FSRS existentes | Auditoría completa del reproductor, tutor/audio/speaking, múltiples dispositivos, offline y reautenticación |
| Gym | Plan/historial y borrador de sesión existentes | Paridad avanzada de planes, edición concurrente atómica, fotografías y progresión |
| Skin | Rutinas/pasos/notas | Inventario editable y fotos privadas nativas, concurrencia y QA |
| Body / Food | Lectura y entradas existentes | Objetivos, edición avanzada, compras/presupuesto y paridad histórica |
| Career | Datos conservados en clásico / Supabase | Portafolio/casos, skills, evidencias y laboratorios React |
| Notes | Crear/editar/borrar y lectura existentes | Conflictos concurrentes atómicos, paginación completa y QA con cuentas reales |
| Work | Proyectos/tareas y cambios de estado | Idea Vault, sprint, historial, edición de proyecto y cierre completo |
| Ares | Chat y revisiones de registros, decisiones y monitor | Creación de solicitudes, fuentes operativas, contratos backend restantes y QA HTTP autenticada |
| Quest | Datos originales conservados | Portar reglas originales con evidencia de actividad; ninguna recompensa ficticia |
| PWA | Manifest/iconos, SW de recursos públicos, pruebas de guardia | Instalación/cold start/offline/actualización en iPhone real, todos los tamaños y estados de error |

Los endpoints clásicos `ares-dispatch`, `ares-sources`, `jarvis`, `payroll-upload` y `selflearn-tutor` aún requieren auditoría/portado dentro de la raíz React y sus pruebas de autorización. No se activan automatizaciones ni se copian secretos para sortear estos pendientes.

## Fases y gates

| Fase | Resultado de esta ejecución | Estado |
|---|---|---|
| F1 · React independiente | Build con 7 originales, guardia privada y 12 rutas; endpoint de metadatos reparado localmente | Implementada parcialmente; QA autenticada pendiente |
| F2 · Núcleo de datos | Datos existentes conservados, respaldo/exportación y comparador offline | Parcial; perfil completo, concurrencia y datos solo locales pendientes |
| F3 · Dominios críticos | Payroll de lectura y revisiones Ares añadidos; matriz anterior | Abierta; no paridad total |
| F4 · Calidad | Tests Node/React, TypeScript y Chromium/WebKit con mocks | Parcial; no acredita cuenta real ni iPhone físico |
| F5 · Corte reversible | Rescate clásico conservado, sin cambios de alias/despliegue público | Bloqueada por F2–F4 y comprobación local |

## Apoyo imprescindible antes del corte

El propietario respondió **«No lo sé; comprobarlo antes del corte»** sobre datos sin sincronizar. No hay autorización técnica ni acceso supuesto a sus almacenes de navegador.

1. En cada dispositivo usado con el clásico, con la cuenta original, conservar una exportación del estado y una copia de «Exportar mis datos» antes de limpiar cachés o reinstalar la PWA. No pegar sesiones ni contraseñas en el chat.
2. Aportar las exportaciones por un canal privado local y una copia actual de la misma cuenta/entorno. El comparador `tools/nocturne-local-data-audit.mjs --local copia-dispositivo.json --cloud copia-actual.json --out plan-privado.json` detecta registros ausentes/conflictos, nunca aplica cambios ni sobrescribe filas. Exige identidad y entorno conocidos; las exportaciones antiguas sin ellos requieren revisión manual.
3. La copia actual SQL no contiene binarios de Storage ni Auth. Completar la descarga autenticada de archivos y el ensayo de recuperación antes de DDL/corte; no copiar cuentas entre bases.
4. Para cerrar QA de login/persistencia, disponer de una sesión/cuenta dedicada de staging mediante configuración local privada. Los tests con mocks y roles SQL no prueban ese recorrido.

## Reversión

No se han ejecutado migraciones de esquema ni importado filas de usuario. Los cambios del PR se revierten con Git antes de publicar. No reasignar el dominio hasta verificar todos los gates; conservar los despliegues de rescate documentados en `NOCTURNE-AI-SELFLEARN-REPAIR.md` y comprobar nuevamente su estado antes de usarlos. Un rollback de frontend no revierte escrituras válidas de Supabase.

Los advisors mantienen dos advertencias heredadas: RPC de cuota `SECURITY DEFINER` invocable por authenticated (necesario revisar su intención antes de cambiarlo) y protección de contraseñas filtradas desactivada. RLS sin políticas de la tabla técnica de cuota restringe su lectura deliberadamente. No se modificaron permisos ni Auth.


## Consolidación de ramas y avances adicionales — 22-10-2026

- [x] `feature/nocturne-integral-migration` reconciliada con el merge `#149` integrado en `staging`, conservando el router React, las 18 rutas anteriores y el Service Worker Nocturne. La PR #150 ahora es fusionable y sigue **draft**. Se usó un commit de reconciliación con dos padres para no perder historial.
- [x] Integradas las funciones nuevas de la segunda línea: exportador mejorado para 21 tablas/cuatro buckets, controles de restauración, revisión Ares sin ejecución, metadatos del despliegue, documentación y pruebas. El código no se ha desplegado en el dominio público.
- [x] Corregida la caché de la aplicación clásica para incluir el módulo del exportador y alineados los manifiestos de versión React/clásico; los tests de CI deben confirmarlo.
- [x] Payroll React conserva el historial original y descarga de PDF de la PR #149 y ahora también muestra los contratos y turnos originales de la PR #150 (sin inventar importes).
- [x] Nueva ruta React `/gastos`, accesible desde Money y el catálogo. Reutiliza las reglas de clasificación del sistema clásico; permite asignar una categoría a un movimiento bancario existente con `owner_id`, `domain`, `record_type` y versión CAS `updated_at`, conservando el resto del payload. Pruebas unitarias incluidas. No importa bancos, no ejecuta automatizaciones y no reescribe importes.
- [x] React Shift Tracker reutiliza los cuatro módulos **originales** de motor salarial (`amsterdam-time`, `dst-timeline`, `shifts`, `weekly-pay`) para consultar turnos guardados y mostrar bruto semanal, ORT, descansos, DST y extras sólo cuando hay snapshots contractuales válidos. Sin contratos, bloquea el importe; no escribe nóminas ni bancos.
- [x] React Skin permite editar disponibilidad de productos del catálogo original. Guarda sólo `user_settings.settings.skinInventory` y preserva el resto mediante condición optimista sobre `updated_at`.
- [x] React My Finance ofrece límites semanales reales por categoría (miércoles a martes) mediante `hub_records.money_budget` con CAS, ID estable para creación y conservación del payload histórico. No importa extractos ni genera ingresos.
- [x] React Quest recupera la fórmula cuadrática de niveles y rangos del clásico sin crear nuevos eventos XP.
- [x] Backend SelfLearn: se incorporó el handler original de tutor en TanStack, con JWT, consentimiento, cuota RPC y cierre por defecto, además de interfaz opt-in NL/EN. No se exponen secretos en el navegador.
- [ ] Validar estas funcionalidades con sesiones autenticadas, entradas reales, multi-dispositivo y pruebas de iPhone. Los tests unitarios/CI no sustituyen QA real.
- [ ] Validar el CI general, TypeScript, build y navegador sobre **el último commit** (no sobre versiones previas).
- [ ] Conciliar backups completos con archivos Storage, Auth y datos sólo locales. Las instantáneas descritas por Work no son un sustituto de una restauración privada comprobada desde esta sesión.
- [ ] Paridad real de Payroll/Shift Tracker, importadores, presupuesto y reglas por comercio, SelfLearn, Gym, Skin, Career, Quest, agente y funciones clásicas restantes. Una ruta accesible no equivale a paridad.
- [ ] Validación real en escritorio y teléfono, incluidas escrituras, sesión autenticada, PWA y conflictos entre dispositivos.
- [ ] Sólo después de cerrar estos gates podrá evaluarse retirar el proyecto Vercel `rise-hub`; el rollback clásico sigue siendo necesario mientras tanto. **No borrar el clásico antes de recuperar el almacenamiento local y tener una copia privada restaurable.**

El Desktop Commander del propietario figuraba **sin conexión** durante esta revisión. No se ha leído ni alterado su dispositivo, ni se le deben pedir contraseñas o tokens en chat.


## Verificación con Mac reconectado · 22 de octubre de 2026

- Desktop Commander: equipo Mac **online** y accesible mediante sesión autorizada. Checkout temporal independiente de la rama `feature/nocturne-integral-migration` para no modificar directorios originales del usuario.
- `npm test` después de instalar dependencias: **538/538 pruebas Node correctas** para el commit que añade `/api/ares-sources`. `npm test` en React: **15/15 pruebas Vitest correctas**. `npm run build` y `npx tsc --noEmit`: **correctos** para la rama con Ares Sources y su tarjeta React.
- Rutas adicionales: `/api/ares-sources` reutiliza el controlador público de desarrollo del clásico; sesión Supabase obligatoria, sin escritura, filtrado de títulos sensibles. Ares Center puede mostrar commits y metadatos de despliegue verificados, sin confundirlos con paridad funcional.
- Búsqueda limitada por nombre y metadatos de exportaciones en rutas de usuario y perfiles convencionales de Chrome/Safari: **no apareció un JSON de exportación de RISE HUB ni un perfil de Chrome con almacenamiento identificable**. Esto **no prueba** ausencia de datos en Safari, PWA o navegador integrado; no se leyeron tokens ni registros personales. La recogida desde el origen clásico sigue requiriendo exportación autenticada en el propio navegador.
- La nueva vista previa Vercel `dpl_Fx5VLsbUUvFKP8iNQZwUnbVzvDkV` se compiló y responde a las rutas, conectada a Supabase **staging**, pero contiene el commit anterior `670f61d`; no contiene las rutas de servidor añadidas después. Una solicitud de nuevo despliegue para el último SHA devolvió **HTTP 402** por el límite de 100 despliegues gratuitos por día. La máquina Mac no tiene CLI Vercel instalado ni un proyecto Vercel local enlazado; por ello no existe un despliegue del último SHA verificado por HTTP.
- **Bloqueadores para retirar el clásico:** exportación/local-only real, reconciliación Storage + Auth, flujo auténtico QA entre dispositivos e iPhone, paridad de importaciones, nóminas y módulos avanzados; cuota de despliegues y cierre seguro de la PR. No se reasignó ningún alias ni se borró el proyecto clásico.
