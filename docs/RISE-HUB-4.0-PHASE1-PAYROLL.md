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

## Datos confirmados por el propietario · 14 de octubre de 2026
- Rotación semanal: semana ISO del **12–18 octubre 2026 = mañana**; 19–25 octubre = tarde, alternándose sucesivamente los lunes. Propuesta laboral lunes-viernes, pero **sin registrar horas hasta confirmarlas**.
- Horarios habituales: **mañana 06:00–15:00**, **tarde 15:00–00:00**. Normalmente **30 minutos de descanso no remunerado**, cuya ubicación exacta puede variar; no descontar una franja automática sin confirmar cuándo descansó. Se pueden editar el inicio, la salida y los descansos, incluidos viernes especiales y días que sale antes.
- Horas extraordinarias: **150 % de tarifa total únicamente a partir de 40 horas trabajadas dentro de una misma semana por agencia**; no sumar 130 % + 150 %. Una hora nocturna a 150 % u otro plus superior conserva su porcentaje más alto. Las vacaciones y festivos cargados al saldo acumulado no computan como trabajo efectivo para ese umbral.
- Festivos y días libres: registrar como **uso de horas acumuladas de vacaciones** según lo declarado por el usuario; no atribuir automáticamente un extra de festivo en € ni inventar horas de saldo. Pendiente saldo inicial validado en SD Worx.
- Interpretación del 150 % sujeta a confirmación documental del convenio y cortes de nómina (alguna agencia puede seguir otra política o tratar descansos pagados de otra manera); campos ajustables por contrato.

### Progreso adicional fase 1 (PR #51 sigue en borrador)
- Motor `microapps/payroll/shift-schedule.js`: rotación anclada a 2026-10-12; propuesta de turno editable, sin presumir que todos los días se trabajaron.
- Motor `microapps/payroll/weekly-pay.js`: cálculo minuto a minuto del bruto semanal por agencia, con umbral 40 h/150 % configurable en el contrato y prioridad exclusiva sobre otros pluses. También control del saldo de vacaciones a partir de movimientos reales.
- UI: botón de plantilla rotativa, edición de turnos con historial de revisiones, formularios para saldo inicial, horas acumuladas, horas consumidas por festivo/día libre y ajustes justificados. Si falta el saldo inicial, muestra «desconocido».
- CSV ahora refleja tarifa extraordinaria efectiva del turno, en lugar del bruto aislado que excluía horas extra.
- E2E autenticado staging cubre mañana/tarde, salida anticipada, recuperación de datos tras recarga y saldo 20→12 horas; borrado de la información ficticia.
- Esta entrega no queda cerrada ni publicada en `main` por sí sola. Faltan comprobación de correspondencia entre agencia y nómina, cálculo para cambios de horario con offsets y verificación de un ciclo completo contra PDF real.

## 2.29.0 WIP · Importación de saldos SD Worx (14/10/2026)

- El documento 27 de la semana 41 es la **fuente documental**: saldo `Vakantiedagen` **49 h 24 min** al 11/10/2026, y `Keuzebudget` **333,22 €**. Estas cantidades son *privadas* y no están codificadas en la aplicación ni guardadas como ejemplo público. El usuario confirma los valores tras consultar el PDF.
- La migración `supabase/pending/20261014090000_payroll_balance_import.sql` crea `payroll_balance_imports`: una instantánea por usuario, vinculada a nómina y documento autenticados. RLS de lectura y escritura por propietario, verificación de SHA/documento/fecha, verificación de confirmación, bloqueo de duplicados, y corte temporal de cambios en vacaciones al cierre de la nómina. Sin modificar pagos ni nóminas.
- Valores de vacaciones y Keuzebudget tienen unidades separadas (`leave_minutes`, `keuzebudget_cents`); no sumar el budget a vacaciones ni al ingreso ordinario. El cierre incorpora ya los festivos y ausencias pasados, de modo que solo se suman o descuentan movimientos posteriores.
- **Staging**: migración aplicada el 14/10/2026; Supabase staging `zpueziugbezqxompwsol` verificado con RLS activo, 2 políticas y guard de corte. E2E autenticado con nómina sintética en Chromium móvil 390px y WebKit escritorio 1440px: confirmación, saldos separados, persistencia, protección retroactiva, rechazo de duplicados y estado recargado. Se borraron los 2 movimientos QA y la única instantánea QA; conteos posteriores = 0/0. No se tocó el PDF o saldo del usuario en producción.
- Comprobaciones de regresión: **186/186** unitarias, **15/15** smoke, Nóminas E2E Chromium/WebKit, base de datos PGlite con rollback de QA y RLS.
- **Producción NO migrada**: PR #51 sigue `draft`; no exponer interfaz de importación en producción sin aplicar antes la migración de modo autorizado y verificarlo. El saldo real tampoco está importado: el usuario deberá confirmar sus 49 h 24 min y 333,22 € en la pantalla tras abrir su PDF.
- Antes de cerrar la fase 1: finalizar auditoría de nóminas semanal por agencia, reglas específicas por convenio y festivos, DST con offsets explícitos, CI y rollout de producción con rollback documentado. No avanzar a My Finance hasta que esté cerrada.
