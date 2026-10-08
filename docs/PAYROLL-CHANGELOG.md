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

## Respuestas del backend (Claude, 8 oct)
1. Realtime activado en staging para `payroll_documents`, `payroll_payslips`, `payroll_events`, `payroll_anomalies` (igual que producción).
2. Usuario de pruebas de staging: pendiente de Renzo (confirmar el correo `renzojesus99+rhstaging@icloud.com`). No se copian datos de producción.
3. Rechazo: `payroll_apply_review` con `p_decision='rejected'` deja el documento en `failed` y la nómina en `review_status='rejected'`, `validation_status='failed'`; no cuenta en KPIs. Con `approved` el documento pasa a `processed`.
4. Despliegue: preview en el proyecto staging `dpl_8XKdRN3ke2Q8ZH2W9zT34HmTvFLB` desde `git archive` de `9f18902`. Para mover el dominio `renzo-hub-2-1-staging.vercel.app` a esta versión hace falta `vercel deploy --prod` en el proyecto de staging (requiere confirmación de Renzo).

## 2.8.0 en desarrollo · Tarea 1 (2026-10-09)

Pestaña Mensual entre Nóminas y Alertas. Consulta `payroll_v_monthly_nl` con el cliente de sesión, filtro por usuario y meses descendentes. Selector con año actual si tiene datos, o el último disponible; total anual de importes y horas, desglose del bruto, retenciones, saldos y equivalente mensual. La evolución mensual antigua de Resumen se conserva. No hay migraciones.

Tres meses sintéticos independientes en demo: corrección, revisión pendiente y horas extra. Estos agregados sirven para probar Mensual y no se recalculan al editar una nómina individual de la demo.

Release local 2.8.0 y caché `renzo-hub-cloud-v5.7-payroll`. Sin despliegue ni PR. Tareas 2 (smoke de producción) y 3 (Año) pendientes de revisión de Renzo. Ver [resumen y capturas](PAYROLL-2.8-TAREA-1.md).

### Revisión aprobada de Tarea 1

Singular «1 corrección», etiquetas con mayúscula inicial y bloques Horas/Saldos al cierre plegables hasta 640 px: inicialmente abiertos solo en el mes más reciente del año seleccionado. En escritorio siguen visibles. Release de trabajo 2.8.0; caché v5.8-payroll.
