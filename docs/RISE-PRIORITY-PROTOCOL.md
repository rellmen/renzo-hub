# RISE PRIORITY · checklist y propuestas desde asistentes

## Estado del cambio (27 octubre 2026)
- Propuesta funcional **solo en rama feature Nocturne** para revisión en PR hacia `staging`; no publicada en producción.
- No editar Classic, no añadir bases paralelas ni conectores capaces de acceder a todas las conversaciones.
- Reutiliza `public.hub_records`, `domain=work`, `record_type=renzo_task` con RLS existente, misma fuente que `/proyectos`.
- Home `/`: prioridades P0 (emergencia), P1 (alta), P2 (media), P3 (baja), fecha, tipo de deadline, motivo, checkbox, edición, historial visible y refresh.
- Los registros existentes se muestran sin inventar deadlines. Prioridades `High`/`Strategic` anteriores se muestran por defecto como P1; el Work `priority` original se conserva al editar.
- Nuevas tareas no se cargan automáticamente: el usuario las añade o revisa importaciones de JSON con `tasks` de hasta 10 elementos. El origen indicado (manual, ChatGPT, Claude) es procedencia declarada por quien lo pega; no autenticación del asistente.

## Protocolo de propuesta JSON para ChatGPT y Claude
Al hablar de una tarea, la IA puede preparar (sin persistencia directa) un bloque JSON independiente:

```json
{
  "tasks": [
    {
      "title": "Preparar una práctica de SQL con JOIN",
      "urgency": "P2",
      "dueDate": "2026-11-08",
      "deadlineType": "interna",
      "why": "Crear una evidencia técnica aplicable a roles Junior Analyst",
      "origin": "chatgpt"
    }
  ]
}
```

Usar `origin: claude` para Claude. Las fechas externas **solo** pueden declararse `deadlineType: real` si están verificadas; en caso contrario, `interna`. No meter secretos, mensajes completos, fuentes privadas ni cifras no verificadas.

## Sincronización automática real (NO implementada)
ChatGPT y Claude no ofrecen al frontend de RISE acceso pasivo a sus conversaciones. No afirmar sincronización automática por el mero hecho de activar el panel.

Para conseguir integración real:
1. Diseñar endpoint autenticado de propuestas con permiso granular sobre tareas del usuario; sin service_role ni claves en frontend.
2. Configurar por separado una herramienta/connector autorizado de ChatGPT y una integración Claude (MCP/acción, si la cuenta lo permite) que invocan el endpoint *solo* para propuestas autorizadas; jamás ingesta de todas las conversaciones.
3. Almacenar propuesta con `source`, `external_ref` pseudonimizado e idempotencia; expirar solicitudes. Nunca enviar datos de Nodalys ni producción/staging cruzados.
4. Mantener bandeja `Pendiente de revisión`. Solo confirmación del usuario crea/edita tareas; los completados no pueden desmarcarse desde una propuesta nueva sin confirmación explícita.
5. Probar reintentos, concurrencia, políticas RLS y consentimientos antes de habilitar escritura remota.

## Validaciones pendientes
- CI React (lint/test/build) en PR, pruebas autenticadas con Supabase staging y dos sesiones/dispositivos.
- Comprobar guardado, edición, cambios simultáneos CAS y rollback.
- Verificar responsive real en iPhone y errores de red; impedir mostrar datos simulados.
- No fusionar ni desplegar a producción sin autorización explícita. Si se requiere migración, plan + rollback y autorización independiente.

## Resumen para agentes
No duplicar `work-records` ni crear un segundo Task Tracker. Implementar mejoras solo en Nocturne. El objetivo es reducir tiempo invertido en organizarse: inicio muestra una lista breve, sin interruptores automáticos que inventen progreso.
