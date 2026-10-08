# Nóminas · release 2.7.0 · staging antes de producción

## Cambios
- Módulo ES `payroll.js`, `mountPayroll(root, db, getUser, go)`, estilos y fixture sintético separado.
- Tarjeta en Home y entrada System > Finanzas. La barra inferior ya tiene seis entradas; Nóminas se abre como microapp con regreso a System.
- Bandeja de documentos con estados, origen, intentos, errores y timeline; detalle de nómina con líneas, validaciones, confianza, versiones y PDF privado.
- Resumen anual y mensual, gráfico de 12 nóminas semanales confirmadas, última nómina, filtros por año/empresa e historial de tarifa.
- Revisión con todos los campos de la lista blanca, tipos de error y nota. Escrituras solo mediante `payroll_apply_review` y actualización de estado de anomalías.
- Realtime con debounce en documentos, nóminas, eventos y anomalías. Polling a 20 s si falla el canal o hay documentos recibidos/procesándose. Limpieza de canal, temporizadores, datos y URLs de Blob al salir/cambiar sesión.
- Deep link `?app=payroll&payslip=<uuid>` conservado durante login y query limpiada. Demo `?demo=1` limitada al hostname exacto de staging; no escribe en Supabase.
- Caché del service worker `renzo-hub-cloud-v5.5-payroll`; release 2.7.0.
- La fuente actual ya usa app.js/world.js; no se recuperó system.js de copias antiguas.

## Aislamiento
Rama `feature/payroll`, basada en el último commit de Fase 1 `2cc8ca6`. No incluye ni altera los cambios sin commit de `e2e/fase1-2.6.2`. No se cambió esquema, configuración, n8n ni producción. Staging conserva su Supabase `zpueziugbezqxompwsol`; producción conserva `mgncykyrhavpepfggmng`.

## Verificación
- `npm run check` y `npm test`: 15 pruebas aprobadas.
- Pruebas de integración de navegador con adaptador Supabase simulado; detalles del resultado final en el resumen de despliegue.
- Inspección de contrato real en ambos Supabase (solo lectura): tablas/vistas existentes; RPC con firma esperada; vistas de producción con security_invoker; RLS forzado en tablas de producción.
- No se ha enviado un documento por Telegram ni aprobado una nómina real. La prueba de extremo a extremo Jarvis → Supabase → Hub requiere una nómina autorizada y sesión real. Safari/WebKit automatizado no sustituye la aceptación en iPhone físico.

## Peticiones al backend (Claude)
1. Activar para pruebas Realtime en staging sobre `payroll_documents`, `payroll_payslips`, `payroll_events`, `payroll_anomalies`. Consulta del 8 octubre: ninguna en `supabase_realtime` de staging; las cuatro sí aparecen en producción. No se ha modificado la publicación.
2. Preparar/confirmar un recorrido de prueba en staging con usuario autenticado, documento de prueba y PDF privado. No copiar datos personales de producción ni cambiar Jarvis productivo. Necesario para comprobar RLS, Storage y RPC reales con el usuario final.
3. Confirmar semántica del rechazo: el contrato indica que la RPC pone el documento en processed incluso al rechazar. La interfaz muestra por separado estado del documento y review_status; no reescribe la lógica del backend.

Producción queda pendiente del OK explícito de Renzo tras revisar staging. El repositorio exige PR aprobado antes de actualizar main.
