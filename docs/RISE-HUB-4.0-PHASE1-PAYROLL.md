# Fase 1 · Payroll + Shift Tracker · implementación iniciada

Estado: fase 1 **en desarrollo**. El motor inicial está fusionado a main mediante PR #50; esta ampliación con interfaz está en la rama `feature/risehub4-shift-ui` basada en el commit de producción correspondiente. La interfaz aún NO está publicada. El motor puro `microapps/payroll/shifts.js` admite intervalos de plus configurados y una tarifa base por agencia. Nunca presume porcentajes legales; el usuario deberá aportar reglas verificadas antes de mostrar diferencias para reclamar. El motor inicial no alteró datos privados; la nueva interfaz utiliza `hub_records` con RLS para guardar contratos (money/shift_contract) y turnos (work/shift_log). Los valores salariales siempre requieren datos declarados por el usuario.

## Primeras pruebas
- Turno 15:00–00:00 con 30 minutos de descanso no pagado: 3h al 100%, 5h30 al 130%, 8h30 pagadas, estimación bruta 152,25€ con tarifa ficticia de 15€/h.
- Turno que cruza medianoche 23:00–07:00: identifica las franjas 130%, 150% y 100%.
- Descanso pagado frente a no remunerado y rechazos de solapes, datos incompletos y turnos improbables.

## Trabajo aún imprescindible para cerrar la fase 1
1. Confirmar horas base, descansos pagados/no pagados, cortes ORT por agencia, reglas de solapamiento y horas extra/festivos (todos configurables con versiones efectivas de contrato).
2. Resolver zona horaria Europe/Amsterdam y cambios CET/CEST con instantes y offsets explícitos, sin doble contabilización.
3. Diseñar CRUD privado de agencias, condiciones y turnos usando `hub_records` con `owner_id = auth.uid()`; formulario accesible y móvil.
4. Mostrar desglose por turno, semana y período de pago con exportación CSV y reconciliación contra `payroll_payslips` confirmadas. Diferencias son **alertas para revisar** y no reclamaciones legalmente certificadas.
5. Probar RLS y sesiones autenticadas contra staging, casos DST, 15:00–00:00 con descanso variable y viernes 07:00–13:00 sin descanso, contratos múltiples y validación de importes. Comprobar cero regresiones en nóminas.
6. PR, CI, staging, autorización de publicación, producción READY y smoke posterior. Solo entonces marcar fase 1 cerrada y comenzar fase 2.

## Ampliación de interfaz 2.29.0 (NO cerrar la fase)
- Pestaña Nóminas → Turnos, compatible con móvil y escritorio.
- Contratos/agencias con tarifa base, vigencia y franjas 24 h sin huecos ni solapes; porcentajes siempre expresados como multiplicador completo de tarifa (ej.: 130 = 1,30 ×).
- Formulario para turnos nocturnos, descansos individuales pagados/sin pago, historial y totales por semana ISO. Cada turno guarda una instantánea inmutable de las reglas salariales aplicadas, incluso si se crea una versión contractual nueva posteriormente.
- CSV descargable localmente sin servidor; comparación orientativa con conceptos base + ORT de nóminas semanales confirmadas, sin mezclar conceptos de vacaciones, transporte, deducciones u horas extra.
- Protección CET/CEST: turnos solapados con la hora del cambio de horario de marzo/octubre se rechazan con mensaje para revisión; aún NO se admiten instantes con offsets para computar esas horas especiales automáticamente.
- Pruebas: unidad para franjas, descansos, cruces de día, DST, resumen semanal, reconciliación y CSV; navegador de QA staging con cuenta real (guardar → recargar → recuperar en 390 y 1440 px), borrado posterior de datos de prueba; E2E anterior de Nóminas en Chromium y WebKit; smoke 15/15.

### Puntos pendientes antes de cerrar fase 1
- Vinculación explícita y verificada de contratos a las agencias/empleadores oficiales, vigencias, y lógica de festivos/horas extra por convenio/contrato; no inferir reglas sin documentación.
- Resolver cambios CET/CEST con offsets por instante, incluida repetición de horas en otoño y salto de primavera.
- Permitir corrección/edición controlada de turnos (actualmente alta y eliminación con confirmación, más nuevo contrato por vigencia).
- Auditoría completa de un ciclo semanal real con identificación inequívoca de nómina/agencia, tratamiento de correcciones y exportación de informe revisable, no reclamación automática.
- PR/CI, staging, autorización de despliegue, producción READY, verificación posterior y rollback. No cambiar el estado de fase 1 a closed hasta completar esos gates.
