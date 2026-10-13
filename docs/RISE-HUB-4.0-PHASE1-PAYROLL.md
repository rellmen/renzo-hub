# Fase 1 · Payroll + Shift Tracker · implementación iniciada

Estado: desarrollo local, **NO publicada**. Rama `feature/risehub4-payroll` basada en producción 2.28.0. El motor puro `microapps/payroll/shifts.js` admite intervalos de plus configurados y una tarifa base por agencia. Nunca presume porcentajes legales; el usuario deberá aportar reglas verificadas antes de mostrar diferencias para reclamar. No hay migraciones ni acceso a datos personales en esta primera tarea.

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
