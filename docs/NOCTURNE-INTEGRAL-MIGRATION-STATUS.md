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
