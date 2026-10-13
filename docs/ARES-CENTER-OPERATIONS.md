# Ares Center 2.23.0 · primer bloque operacional

## Fuente y seguridad
- Staging en proyecto Vercel renzo-hub-2-1-staging, Supabase zpueziugbezqxompwsol. Producción no se modifica sin autorización.
- Vista autenticada usando hub_records, owner_id = auth.uid(), políticas RLS existentes. Sin nuevas migraciones ni secretos en frontend.
- Enlaces previos ?app=command-center redirigen a ?app=ares-center.
- Límites de las consultas: últimos 450 registros de tipos Ares/Work, no recuentos exhaustivos ni monitorización live.
- Cada acción de Ares guarda una fila/actualiza un registro con la sesión de usuario. Nunca ejecuta cambios en producción por el mero hecho de aprobar un ítem.

## Project Tracker
- Reutiliza las filas existentes renzo_project y renzo_task de Work. No se duplican los proyectos al abrir Ares.
- Crea proyectos en backlog, registra tareas y marca tareas completadas. Tras cambios, refresca el panel Work.
- Cambios de slot, sprints y acciones avanzadas continúan gestionándose desde Work.

## Agent Monitor
- Muestra eventos renzo_event recibidos y asociados a automatización y registros manuales ares_agent_run.
- Consulta GET /api/jarvis para mostrar si los webhooks de entrada/salida están configurados, sin afirmar conectividad o ejecución en vivo.
- Permite registrar resultados manuales de Claude/Hermes/Jarvis, siempre etiquetados como manuales.
- No proporciona estado live, ejecución remota, activación de workflows o acceso real a Claude/Hermes.
- Futuro: adaptadores backend autenticados a las APIs/proveedores que Renzo autorice, con auditoría y aprobación explícita.

## AI Inbox
- Lee renzo_inbox de Work y enlaza a la revisión existente: especialmente gastos, documentos y nóminas, que necesitan revisión humana.
- ares_decision permite crear solicitudes propias, aprobarlas o rechazarlas guardando el estado. Son decisiones registradas, no triggers externos.
- No se duplican las aprobaciones de Jarvis y no se produce ninguna ingesta financiera automática desde Ares.

## Alcance pendiente para Ares 100%
- Integrar estado real de GitHub, Vercel y agentes usando conectores backend autorizados; no exponer tokens.
- Cola de trabajo con ejecuciones seguras, estados, reintentos, idempotencia, auditoría y notificaciones.
- Integraciones de Claude Desktop y Hermes, sujetas a sus capacidades y autorización de Renzo.
- Notificaciones y vista de actividad incremental, paginación/contadores exactos según crecimiento.
- E2E con sesión real en Supabase staging + comprobación de permisos, antes de cualquier promoción.

## Cola de solicitudes 2.23.2 (nueva)
- Formulario Agent Monitor añade solicitudes para Claude/Hermes/Jarvis con estado pending_approval; AI Inbox permite aprobar o rechazar.
- La aprobación solo escribe status approved/rejected en hub_records del propietario. payload.executed=false y executionStatus=not_connected son explícitos: no se ejecuta nada en dispositivos externos.
- La ejecución real necesitará backend firmado, capacidades verificadas del agente, reglas de aprobación y auditoría antes de habilitarla.
