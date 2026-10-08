# Jarvis · separación Renzo HUB / Nodalys y autorización técnica (Bloque 4)

Estado: **implementado y probado en borradores/workflows inactivos (2026-10-08).** Nada publicado: falta el OK de Renzo y recargar créditos de IA en n8n.

## Situación verificada (2026-10-08)
- Instancia n8n: `nodalys.app.n8n.cloud` (de Nodalys).
- `Jarvis · asistente personal (Telegram)` (`WH0kGpw0dg83yvdM`): **un solo agente** con herramientas de Renzo HUB y de Nodalys
  (Gmail y Calendar de `info@nodalys.nl`, hojas "Guardar/Leer notas Nodalys", "Guardar/Leer leads", "Registrar/Leer horas").
  Su borrador difiere de la versión publicada (hay trabajo sin publicar: **no se debe editar ese borrador**).
- Acciones sensibles (`Send Email`, `Reply`, `Delete Calendar Event`, `Delete a Task`, `Delete Expense`) protegidas **solo por el prompt**.
- `Renzo HUB · Tools (Jarvis)` (`VOKcnoaLBjVXzTka`): bien diseñado (lista blanca, owner fijo, sin borrado, log), pero apunta solo a producción.
- Los gastos siguen en Google Sheet "Jarvis - Gastos", no en Money.

## Objetivo
```
Telegram (bot personal) → Jarvis personal (n8n) → Renzo HUB Tools → /api/jarvis o Supabase → AI Inbox (revisión) → Renzo HUB
Telegram (bot Nodalys)  → Agente Nodalys (n8n)  → herramientas Nodalys (Gmail/Calendar/Sheets de Nodalys)
```
Sin herramientas, credenciales ni datos compartidos entre ambos agentes.

## Pasos (en orden, todos en workflows nuevos e inactivos hasta probarlos)
| # | Paso | Quién | Riesgo |
|---|---|---|---|
| 1 | Duplicar el workflow publicado de Jarvis como **"Jarvis personal · Renzo HUB (borrador)"**, inactivo | Claude | Nulo (copia inactiva) |
| 2 | En la copia: quitar todas las herramientas Nodalys (Gmail/Calendar `info@nodalys.nl`, notas, leads, horas) y la sección Nodalys del prompt | Claude | Nulo |
| 3 | Sustituir `Send Email`, `Reply`, `Delete *` por una sola herramienta **`request_approval`** (ver abajo) | Claude | Nulo |
| 4 | Cambiar "Create Expense" (Sheets) por `hub_create_record`/`/api/jarvis` → AI Inbox `needs_review` | Claude | Bajo |
| 5 | Parametrizar `Renzo HUB · Tools` por entorno: copia "Tools · staging" con URL y credencial de staging | Claude + Renzo (credencial) | Bajo |
| 6 | Crear **bot de Telegram nuevo** para Nodalys (o mantener el actual solo para Nodalys) y credencial separada | **Renzo** | Bajo |
| 7 | Crear "Agente Nodalys" con solo herramientas Nodalys | Claude | Nulo |
| 8 | Pruebas en staging con datos ficticios (ver checklist) | Claude | Nulo |
| 9 | **Publicar** los dos workflows nuevos y desactivar el antiguo | **Renzo autoriza** | Medio (reversible: reactivar el antiguo) |
| 10 | Fase 2: mover Renzo HUB a una instancia n8n propia | Renzo decide | n/a |

## Autorización técnica (no basada en el prompt)
`request_approval` (sub-workflow) en lugar de herramientas de envío/borrado:
1. El agente solo puede **proponer**: guarda la acción completa (tipo, destinatario, asunto, cuerpo, id del evento…) en
   `hub_records` con `record_type = approval_request`, `status = pending`, y un **nonce aleatorio**.
2. n8n envía a Telegram un mensaje con botones inline `Aprobar` / `Rechazar` cuyo `callback_data` contiene el id y el nonce.
3. Un workflow separado ("Jarvis · ejecutar aprobadas") se activa solo con `callback_query` y **verifica en código**:
   - `from.id` == chat id de Renzo (constante en el workflow, no en el prompt);
   - el registro existe, `status = pending`, nonce coincide y tiene menos de 30 minutos;
   - marca `status = approved` de forma atómica (`PATCH … ?status=eq.pending`) antes de ejecutar → no se ejecuta dos veces.
4. Solo ese workflow tiene las credenciales de Gmail/Calendar con permiso de envío/borrado. El agente no las tiene.
5. Cada ejecución se registra (`jarvis_tool_log`) con el resultado.

Operaciones financieras importadas: siempre `needs_review` en AI Inbox (ya aplicado en `/api/jarvis` desde 2.5.1);
la aprobación se hace en Renzo HUB (System → Inbox), nunca desde el modelo.

## Checklist de pruebas (staging, datos ficticios)
- [ ] Mensaje "registra 81,2 kg" → `body_weight` en Supabase staging, respuesta con id.
- [ ] Ticket de gasolina ficticio → AI Inbox `needs_review`; reenviarlo no duplica.
- [ ] "Envía un correo a X" → llega petición con botones; sin pulsar, no se envía nada.
- [ ] Pulsar `Aprobar` desde otro chat id → rechazado.
- [ ] Pulsar `Aprobar` dos veces → se ejecuta una sola vez.
- [ ] Pedir una nota de Nodalys al Jarvis personal → responde que no tiene acceso.

## Implementación (2026-10-08, todo inactivo o en borrador)

### Jarvis personal (bot JarvisBot)
| Workflow | Id | Estado | Contenido |
|---|---|---|---|
| Jarvis personal · Renzo HUB | `WH0kGpw0dg83yvdM` | Borrador sin publicar (la versión activa sigue siendo el Jarvis antiguo) | Sin Gmail/Calendar/Contacts/hojas de Nodalys ni borrados. Herramientas Renzo HUB + `solicitar_aprobacion` + `registrar_gasto`. Rama de botones verificada en código |
| Jarvis personal · solicitar aprobación | `SywZnEOaNGyPxeZ9` | Inactivo, solo invocable por Jarvis | Guarda `approval_request` (pendiente, nonce 16 hex, 30 min) y envía botones |
| Jarvis personal · registrar gasto (revisión) | `mjsSXt7gKsV4S9cn` | Inactivo, solo invocable por Jarvis | `renzo_inbox` con `needs_review`, id determinista desde `source_ref` (sin duplicados) |

Pulsación `apr:<uuid>:<nonce>` → chat id fijo en código → PATCH atómico en `hub_records`
(`status=pending`, nonce, `occurred_at >= now-30m`) → solo entonces Google Tasks borrar.

### Nodalys (bot Nodalys, un solo flujo)
| Workflow | Id | Estado | Contenido |
|---|---|---|---|
| Nodalys · Telegram → borrador LinkedIn | `v9C8W9OtTw1bSzFJ` | **Activo con la versión anterior**; los cambios están en borrador | Pulsaciones `apr`/`rej` → ejecutor; mensajes sin enlace → agente. Botones LinkedIn (`ap`, `rj`, `ok`, `ro`, `te/ts/tn`) sin cambios |
| Nodalys · asistente (agente) | `CHOL3mZnIrtM3rPy` | Inactivo, solo invocable por el flujo Nodalys | Gmail/Calendar `info@nodalys.nl` (leer, etiquetar, borradores, crear/mover eventos), Contacts, hojas de notas/leads/horas, Tasks. Sin herramientas de envío ni borrado. Memoria `nodalys-<chat_id>` |
| Nodalys · solicitar aprobación | `JcR9iVa4U3FHqMQN` | Inactivo, solo invocable por el agente | `send_email`, `reply_email`, `delete_event` → fila en data table `nodalys_approvals` + botones |
| Nodalys · ejecutar aprobada | `FzkNt6hfo57hSG87` | Inactivo, solo invocable por el flujo Nodalys | CAS sobre `nodalys_approvals` (pendiente, nonce, sin caducar, un solo uso); único sitio con nodos Gmail enviar/responder y Calendar borrar |

### Pruebas realizadas
- [x] Jarvis personal, lectura real: peso leído con `hub_search_records`.
- [x] Jarvis personal rechaza peticiones de Nodalys.
- [x] Sub-workflows de aprobación y gasto con datos fijados.
- [x] Rama de botones de Jarvis: usuario no autorizado, válido, usado/caducado (3/3).
- [x] Ejecutor Nodalys: CAS real sobre la data table, un solo uso.
- [x] Flujo Nodalys (borrador): mensaje sin enlace → agente → respuesta (ejec. 134).
- [x] Flujo Nodalys (borrador): `rej` con id inexistente → "Solicitud caducada, ya usada o no válida. No se ha hecho nada." (ejec. 136).
- [x] Regresión LinkedIn: `ap:` sigue yendo a "Cargar borrador (botón)" (ejec. 138). Nota: esta prueba envió un mensaje real "No encuentro ese borrador." al chat de Renzo.
- [ ] Respuestas reales del modelo: **bloqueado**, n8n devuelve "Payment required" (créditos de IA agotados; afecta también al Jarvis y al LinkedIn activos).

### Para publicar (requiere OK de Renzo)
1. Recargar créditos de IA de n8n o asignar una credencial Anthropic propia a los nodos de modelo.
2. Publicar en este orden: sub-workflows (`SywZnEOaNGyPxeZ9`, `mjsSXt7gKsV4S9cn`, `JcR9iVa4U3FHqMQN`, `FzkNt6hfo57hSG87`, `CHOL3mZnIrtM3rPy`), después `WH0kGpw0dg83yvdM` y `v9C8W9OtTw1bSzFJ`.
3. Reversión: restaurar la versión anterior de cada workflow desde su historial.
