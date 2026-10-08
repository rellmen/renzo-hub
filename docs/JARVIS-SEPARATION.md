# Jarvis · separación Renzo HUB / Nodalys y autorización técnica (Bloque 4)

Estado: **diseño listo, sin aplicar.** Requiere autorización de Renzo para crear credenciales y publicar workflows.

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
