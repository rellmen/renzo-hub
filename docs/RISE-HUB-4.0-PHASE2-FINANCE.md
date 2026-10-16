# RISE HUB 4.0 · Fase 2 · My Finance conectado

Activa desde el 16 oct 2026. Ya en producción antes de la fase: Resumen del mes, Gastos fijos y suscripciones, Presupuesto semanal (2.22.0). Decisiones de Renzo (16 oct): orden **A Ingreso → B Patrimonio → C Objetivos**; patrimonio con **ING y Revolut, inversiones y deudas** (sin efectivo); objetivos: **fondo de emergencia, meta con fecha y aporte mensual a inversión**.

## Principios
- Una sola fuente por cifra: el ingreso y el gasto salen del banco; las nóminas confirman, nunca suman.
- Sin migraciones: `hub_records` (domain money) con RLS por dueño, como el resto de My Finance.
- "Sin datos" antes que una cifra inventada; nada se envía ni se paga desde la app.

## A · Ingreso confirmado (2.31.0)
- Panel "Ingresos del mes" en el Resumen: nómina confirmada frente a lo cobrado de nómina, y otros ingresos.
- Cada cobro de nómina: Confirmada (nómina aprobada e importe ±0,02 €), Diferencia (aprobada, otro importe), Por revisar (nómina pendiente), Sin nómina.
- Nómina aprobada sin cobro en el banco: aviso "No cobrada" solo si el extracto llega a esa fecha; si no, "importa un extracto más reciente".
- Criterios de aceptación: nómina + otros = ingresos del mes; ningún importe de nómina se suma al total; rechazadas o fallidas se ignoran; correcciones con su fecha de pago; mes vacío sin errores. Pruebas: `tests/finance-income.test.mjs` (6) y `tests/e2e/finance-income.mjs` (Chromium y WebKit, 390 px).

## B · Patrimonio (2.32.0, `networth.js` y `networth-panel.js`)
- Saldos ING y Revolut desde el último saldo de cada extracto importado (ING trae saldo resultante); inversiones y deudas como registros manuales con fecha.
- Patrimonio neto = cuentas + inversiones − deudas, con evolución mensual; cada cifra muestra su fecha y su fuente.
- Aceptación: sin saldo conocido se muestra "sin datos"; traspasos entre cuentas no cambian el total.

## C · Objetivos (2.32.0, `goals.js` y `goals-panel.js`; aportes por la categoría nueva "Aporte a inversión")
- Fondo de emergencia: N meses de gastos fijos reales (etapa B de My Finance).
- Meta con fecha: importe, fecha y ahorro semanal necesario (semana de miércoles a martes).
- Aporte mensual a inversión: importe objetivo frente a lo realmente aportado en el banco.
- Aceptación: progreso calculado solo con datos verificables; si falta un dato, el objetivo lo dice.

## Riesgos
- Revolut sin extracto deja el gasto incompleto (ya avisado en el Resumen).
- Inversiones y deudas manuales pueden quedar desactualizadas: se mostrará la fecha del último valor.
