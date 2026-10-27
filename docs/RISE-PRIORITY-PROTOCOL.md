# RISE PRIORITY · checklist y propuestas desde asistentes

## Estado del cambio (27 octubre 2026)
- Fase 1 integrada en `staging` por PR #172 (`64af6d2`) y en `production` por PR #173 (`f447c55`) el 27-10-2026. Esta auditoría prepara mejoras en `feature/rise-priority-chatgpt-20261027`, con PR borrador hacia `staging`; no las publica ni aplica migraciones.
- No editar Classic, no añadir bases paralelas ni conectores capaces de acceder a todas las conversaciones.
- Reutiliza `public.hub_records`, `domain=work`, `record_type=renzo_task` con RLS existente: misma fuente y misma caché React Query (`['work-records', uid]`) que `/proyectos`.
- Home `/`: prioridades P0 (emergencia), P1 (alta), P2 (media), P3 (baja), fecha, tipo de plazo, motivo, procedencia declarada, checkbox para completar y reabrir, edición, «Actualizar» y «Ver todas, incluidas completadas». **No hay historial de auditoría de cambios**: «Ver todas» solo muestra también las completadas.
- Los registros existentes se muestran sin inventar fechas. Prioridades Work `High`/`Strategic` se muestran como P1 y el resto como P2; esa conversión es **solo de lectura** y no se guarda. El `priority` original de Work (`Normal|High|Strategic`) se conserva al editar la urgencia RISE.
- Tareas antiguas sin motivo se muestran como «Motivo pendiente de definir». Las nuevas tareas y cualquier edición de prioridad exigen motivo.
- Reabrir una completada la devuelve al estado Work que tenía antes de completarse (`payload.reopenStatus`); si no se conoce (por ejemplo, completada desde Work), vuelve a `Today` y el panel lo indica.
- «Hoy» se calcula en `Europe/Amsterdam` (`riseToday()`), igual para orden, avisos de vencida y fecha de alta.
- El panel carga como máximo las 300 tareas modificadas más recientemente (límite compartido con Work). Si se alcanza, lo avisa y los contadores se refieren solo a esas.

## Reglas de datos (Fase 1)
| Campo | Regla |
| --- | --- |
| `title` | Texto 1–180 caracteres. Más largo = error (no se recorta). |
| `urgency` | `P0`–`P3`. Valor desconocido = error. |
| `dueDate` | Fecha civil `AAAA-MM-DD` real o vacío. Sin sufijos ni zona horaria. Vacío solo por decisión explícita. |
| `deadlineType` | `interna` (objetivo personal) o `real` (plazo externo). `real` exige fecha, evidencia y comprobación humana. |
| `why` | Obligatorio en altas y ediciones; máximo 400. |
| `origin` | `manual`, `chatgpt` o `claude`. Es procedencia **declarada** por quien pega la propuesta, no una firma. |
| `proposalEvidence` | Objeto opcional en el payload: `proposalId`, `sourceRef` (texto o `https://`), `evidenceSummary`, `evidenceCheckedAt` (fecha de **tu** comprobación). |

## Protocolo de propuesta JSON para ChatGPT y Claude
Al hablar de una tarea, la IA puede preparar (sin persistencia directa) un bloque JSON independiente. Formato: objeto con una única propiedad `tasks`, 1–10 tareas, máximo 15.000 caracteres. Campos admitidos por tarea: `title`, `urgency`, `dueDate`, `deadlineType`, `why`, `origin`, `proposalId`, `sourceRef`, `evidenceSummary`, `evidenceCheckedAt`. Cualquier otro campo hace que se rechace la propuesta entera.

```json
{
  "tasks": [
    {
      "title": "Preparar una práctica de SQL con JOIN",
      "urgency": "P2",
      "dueDate": "2026-11-08",
      "deadlineType": "interna",
      "why": "Crear una evidencia técnica para practicar entrevistas",
      "origin": "claude",
      "proposalId": "ejemplo-sql-20261027-01",
      "sourceRef": "Referencia manual aportada por el usuario",
      "evidenceSummary": "Objetivo personal propuesto; la fecha es interna",
      "evidenceCheckedAt": ""
    }
  ]
}
```

- Usar `origin: claude` para Claude y `chatgpt` para ChatGPT.
- `deadlineType: real` solo si el plazo externo es real; aun así **llega sin comprobar**. El `evidenceCheckedAt` que mande un asistente se descarta y se avisa: solo cuenta la casilla «He comprobado este plazo en la fuente» que marca la persona.
- No meter secretos, mensajes completos, fuentes privadas ni cifras no verificadas.

### Revisión antes de guardar
1. Pegar y pulsar «Revisar propuestas» **no escribe nada**.
2. Cada propuesta muestra todos los campos que se guardarán, avisos y bloqueos. Se puede seleccionar, editar o descartar una a una.
3. Al editar fecha, tipo de plazo, referencia o evidencia, se desmarca la comprobación anterior. Un plazo externo requiere volver a comprobar los datos finales antes de guardarlo.
4. Bloqueos: falta de motivo; sin fecha sin marcar «Guardar sin fecha»; plazo externo sin evidencia comprobada (se puede «Convertir en objetivo interno»).
5. Una coincidencia con una tarea existente (título normalizado + fecha) se marca como posible duplicado, no se selecciona y **nunca modifica** la existente; se ofrece abrirla para editarla a mano. La importación no reabre completadas. Los bloqueos se recalculan al editar una propuesta o refrescar las tareas: una coincidencia con tareas cargadas o con otra propuesta seleccionada impide aprobarla hasta editarla o desmarcarla. El UUID propio se excluye para permitir recuperar respuestas perdidas.
6. Cada propuesta tiene un UUID estable durante toda la operación. Si falla una, las confirmadas se quedan guardadas y «Reintentar pendientes» solo reintenta las que faltan; antes de reinsertar una que pudo llegar al servidor, consulta su UUID.
7. Limitación explícita: la deduplicación por título y fecha **no es** idempotencia global entre dispositivos. Dos dispositivos que importen el mismo JSON por separado generan UUID distintos. No garantiza detectar tareas fuera de las 300 cargadas ni escrituras remotas posteriores al último refresco.

## Conflictos y escrituras
- Toda escritura filtra por `id`, `owner_id`, `domain`, `record_type` y el `updated_at` leído (compare-and-swap). El trigger `hub_records_set_updated_at` lo renueva en cada `UPDATE`.
- Cero filas actualizadas nunca es éxito: si la tarea existe, es un conflicto y el editor conserva tu borrador, muestra la versión guardada y solo reaplica si pulsas «Guardar mi borrador sobre la versión nueva». Si no existe, se dice.
- Un alta solo se da por buena con la fila devuelta por el servidor.
- Sin conexión no se intenta nada ni se pone en cola: se avisa y el borrador queda abierto para reintentar a mano.
- Actualizar y recuperar el foco revalidan los datos; **no** hay sincronización instantánea entre dispositivos.

## Sincronización automática real (NO implementada · Fase 2)
ChatGPT y Claude no ofrecen al frontend de RISE acceso pasivo a sus conversaciones. No afirmar sincronización automática por el mero hecho de activar el panel; pegar JSON a mano no es sincronización.

Para conseguir integración real:
1. Diseñar endpoint autenticado de propuestas con permiso granular sobre tareas del usuario; sin service_role ni claves en frontend.
2. Configurar por separado una herramienta/connector autorizado de ChatGPT y una integración Claude (MCP/acción, si la cuenta lo permite) que invocan el endpoint *solo* para propuestas autorizadas; jamás ingesta de todas las conversaciones.
3. Almacenar propuesta con `source`, `external_ref` pseudonimizado e idempotencia persistente; expirar solicitudes y permitir revocación. Nunca enviar datos de Nodalys ni producción/staging cruzados.
4. Mantener bandeja `Pendiente de revisión`. Solo confirmación del usuario crea/edita tareas; los completados no pueden desmarcarse desde una propuesta nueva sin confirmación explícita.
5. Probar reintentos, concurrencia, políticas RLS y consentimientos antes de habilitar escritura remota; añadir auditoría.

## Validaciones
Evidencia, matriz de requisitos y gates de Fase 1: `docs/RISE-PRIORITY-F1-QA-2026-10-27.md`.

## Resumen para agentes
No duplicar `work-records` ni crear un segundo Task Tracker. Implementar mejoras solo en Nocturne. El objetivo es reducir tiempo invertido en organizarse: inicio muestra una lista breve, sin interruptores automáticos que inventen progreso. No fusionar ni desplegar a producción sin autorización explícita; si se requiere migración, plan + rollback y autorización independiente.
