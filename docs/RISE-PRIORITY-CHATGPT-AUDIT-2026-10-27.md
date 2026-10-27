# RISE PRIORITY · auditoría compatible · 27-10-2026

## Fuentes y alcance de la recuperación

Conversación «Opinión crítica ambiciones realidad» (`6ae0533d-9b6c-83ed-b22d-06fd61fa8e3b`): recuperados los mensajes del usuario del 27-10 sobre checklist Home, prioridades emergencia/baja, motivo, deadline y propuestas de ChatGPT/Claude. Las respuestas del asistente se devuelven como referencias opacas; su texto exacto y la lista personal de tareas **no se han recuperado**. No se atribuye una propuesta literal al asistente ni se inventan tareas históricas.

Recuperada la especificación posterior «RISE PRIORITY · especificación y plan de continuación para Claude Code» del 27-10, mediante el chat «Especificar RISE PRIORITY para Noctu». Sirve como comparación verificable; ya declaraba esta limitación. No se ha copiado código de conversaciones.

GitHub consultado: PR [#172](https://github.com/rellmen/renzo-hub/pull/172) fusionado a staging el 27-10 a las 19:21:43 UTC, merge `64af6d28f3a52a8c2e0e1379200e969d993994fb`; PR [#173](https://github.com/rellmen/renzo-hub/pull/173) fusionado a production a las 20:06:48 UTC, merge `f447c5553102158961918886210b2841785f3a8b`. `git diff f447c55 origin/staging --stat` vacío: mismo árbol completo al inicio de la auditoría. Esto compara código, no certifica el deployment servido.

## Comparación punto por punto

«Propuesta» significa requisito recuperable del usuario o de la especificación posterior, no cita de las respuestas opacas.

| Propuesta recuperable | Implementado en f447c55 / #172 / #173 | Diferencia | Decisión | Por qué |
| --- | --- | --- | --- | --- |
| Home delante del roadmap; cinco pendientes, contadores y todas | PriorityBoard montado en Home | Ninguna | Mantener | Ya permite decidir la siguiente acción |
| Checklist editable y persistente | Alta, edición, completar/reabrir; mismo UUID Work | Ninguna | Mantener | Sin tracker paralelo |
| P0–P3, motivo, fecha y origen | Normalización, validación y UI | Ninguna | Mantener | Cambiar etiquetas sería preferencia |
| No subir prioridad por vencimiento | sortPriorityTasks, orden P0–P3 antes de fecha | Ninguna | Mantener | Evita presión artificial |
| Work High/Strategic solo como fallback P1 | normalizePriority; patch conserva priority | Ninguna | Mantener | Compatibilidad histórica |
| Fecha civil y hoy de Ámsterdam | riseToday y validación estricta | Ninguna | Mantener | Medianoche/DST cubiertos |
| Plazo externo con fecha/evidencia comprobada por Renzo | Guardado exige esos campos; importación descarta marca enviada por IA | La marca sobrevivía al editar fecha/fuente/evidencia | Adaptar | La comprobación debe corresponder a los datos finales |
| Propuestas con revisión individual y confirmación | Selección, edición, descarte y botón Aprobar | Ninguna | Mantener | Revisar/cancelar no escribe |
| Duplicados sin modificar tareas existentes | Aviso calculado al pegar; importación solo crea | Aviso obsoleto tras editar/refrescar; reselección permite coincidencias | Adaptar | Recalcular bloqueos reduce altas repetidas evitables |
| Reintentos parciales sin duplicar | UUID estable, persistProposal recupera por UUID | Solo durante la operación; sin idempotencia global por proposalId | Mantener con límite | No añadir garantías de BD ni esquema en este encargo |
| CAS y borrador conservado | patchPriorityTask, conflicto y reaplicación explícita | Ninguna | Mantener | No sobrescribir automáticamente |
| Error offline visible, sin cola | networkMode always, ensureOnline | Ninguna | Mantener | Reintento humano |
| Borradores separados por cuenta | Remount por uid; caché Work por usuario | Ninguna en el alcance revisado | Mantener | Evita mezclar borradores |
| Carga completa o límite visible | Aviso a partir de 300 tareas | Sin paginación; Work comparte límite | Mantener límite declarado | Paginación requiere revisar ambos consumidores de caché |
| RLS, dos sesiones y móvil real | Evidencia histórica de #172: RLS/CAS con rollback y E2E simulado | QA humano Home/Work, iPhone físico y lector pendiente | Proponer QA | Los mocks no certifican esos casos |
| Actualización según conversaciones | Pegado manual; sin lectura automática | Integración automática fuera de Fase 1 | Diferir | Requeriría permisos acotados y conservar aprobación humana |
| Estado de la entrega correcto | Protocolo todavía decía draft/no publicado | #172/#173 ya fusionados | Actualizar documentación | Evita continuar una rama/PR ya cerrado |
| Historial de auditoría | Ver todas incluye completadas; no audit log | Sin registro de cada cambio | Mantener límite explícito | No crear infraestructura paralela por preferencia |

## Cambios y riesgo, por impacto

1. **Comprobación vigente de plazos externos**. Editor borra la marca al cambiar fecha, tipo, referencia o evidencia. patchPriorityTask no hereda una comprobación si cambian esos campos sin comprobación explícita. Motivo/título no invalidan por sí solos la comprobación del plazo. Riesgo bajo: obliga a repetir una acción humana al cambiar esos datos.
2. **Duplicados revalidados**. proposalBlockers admite contexto opcional de tareas y propuestas; reutiliza uniquePriorityProposals. Tarjetas, aprobación y guardado usan los mismos bloqueos. Se excluye el UUID propio para recuperación idempotente. Riesgo bajo/moderado: una coincidencia intencional de título+fecha requiere editar o desmarcar. No se altera la tarea existente.
3. **Estado documental corregido**. Protocolo y tabla de progreso reflejan #172/#173 fusionados y esta candidata sin aplicar. Riesgo bajo.

Reutilizados sin reemplazar: normalizePriority, sortPriorityTasks, validatePriorityInput, createPriorityTask, patchPriorityTask, persistProposal, reviewPriorityProposals, proposalBlockers y riseToday. Se amplía la firma opcional de proposalBlockers sin romper llamadas anteriores. Sin dependencias nuevas.

## Verificación local

Directorio: apps/rise-react. Node 24.21.0, npm 11.19.0, Vitest 4.1.12. Dependencias locales copiadas mediante clonación de archivos del checkout rise-f0-audit; sin actualizar package.json ni generar lockfile. CI instala sus propias dependencias; no hay lockfile específico React en la base.

- Regresión antes de corregir: 8 fallos reproducidos / 46 pruebas pasaban, incluyendo marca obsoleta en UI y patch y duplicado editado.
- Tras corregir: pruebas enfocadas iniciales 54/54; añadidos casos de refresco y selección de duplicados del lote.
- `./node_modules/.bin/tsc --noEmit`: exit 0.
- `npx vitest run`: exit 0, 14 archivos / 126 pruebas (114 de base + 12 casos nuevos).
- `npm run build`: exit 0, cliente/SSR/Nitro construidos. Aviso de vite-tsconfig-paths (resolución nativa disponible); no se cambia configuración ajena.
- `./scripts/renzo-hub status`: ejecutado; producción y preview no accesibles desde la ejecución restringida; no prueba estado del deployment.
- Sin cambios Classic ni migraciones. La construcción genera artefactos locales ignorados, no despliega.

No verificado de nuevo: RLS real, ida y vuelta Home→Work con sesión real, concurrencia entre dispositivos reales, iPhone físico/PWA y lector de pantalla. La evidencia de #172 es histórica y no se presenta como repetida aquí. Lint completo no ejecutado. E2E navegador de esta candidata: pendiente del workflow React del PR.

## Conflictos, opciones y límites

- Una fecha interna elegida por Renzo sigue permitida; proponer fechas o elevar urgencia para producir presión artificial se descarta. El JSON complementario deja dueDate vacío y requiere la casilla Guardar sin fecha y Aprobar.
- Lectura/escritura automática desde chats no se activa. Opción actual: JSON revisado; integración futura requiere autorización aparte y solo propuestas pendientes de revisión.
- No se recrea #172 ni se continúa su rama ya fusionada: la instrucción actual autoriza una nueva rama desde staging y un PR borrador.
- Paginación y auditoría persistente quedan diferidas. Opciones futuras: ampliar carga coherentemente en Home/Work o diseñar historial con plan; no aplicar esquemas ahora.
- Deduplicación limitada a las tareas cargadas y al lote actual. Dos dispositivos, filas fuera del límite o cambios posteriores al último refresco aún pueden crear coincidencias. No hay garantía única por título/fecha en BD.
- La validación cliente y la casilla registran la acción del usuario en la interfaz; no prueban criptográficamente que leyó una fuente ni sustituyen RLS.
- Rollback de la candidata: revertir su commit si se integra a staging. No requiere rollback de BD. No se solicita producción, fusión ni migración.

## Entrega y propuestas

Preparado sin aplicar: rama feature/rise-priority-chatgpt-20261027 y PR borrador a staging. SHA/URL se entregan en el informe del chat para no introducir referencias autorreferenciales en el commit.

Pendiente de Renzo: revisar el PR y ejecutar QA real antes de decidir integración. Ninguna autorización adicional necesaria para esta preparación. Producción y migraciones quedan fuera.

El JSON entregado contiene dos propuestas nuevas de QA derivadas del alcance comprobado; **no es una reconstrucción de tareas personales antiguas**. Sin fechas inventadas ni evidenceCheckedAt; no se ha importado ni guardado ninguna tarea.
