---
name: rise-hub-finanzas
description: Importar y categorizar movimientos de ING o Revolut y nóminas de SD Worx en My Finance de RISE HUB, aplicando las decisiones de Renzo ya guardadas en las reglas. Úsala con extractos, nóminas, gastos por categoría o comercios sin reconocer.
---

# Finanzas en RISE HUB (My Finance)

## Fuente de verdad
- Reglas y categorías: `microapps/gastos/categories.js`. Prioridad: 1) categoría que Renzo puso al movimiento, 2) sus reglas por comercio, 3) reglas por defecto, 4) "Sin categoría". No se inventa nada.
- Importadores: `microapps/bank/` (ING CSV, Revolut PDF/CSV) con tests en `tests/bank.test.mjs`, `tests/revolut.test.mjs` y `tests/gastos.test.mjs`.
- Nóminas: `payroll.js` y `payroll-pdf.js`. Renzo cobra cada semana, los miércoles: los meses se cuentan por fecha de cobro.

## Cómo trabajar
1. Antes de categorizar, lee las reglas existentes: las decisiones de Renzo (alquiler compartido que resta del gasto de alquiler, pagos a familia como deuda, dinero con su hermana como préstamo o reembolso) ya están ahí o en sus categorías por movimiento. No las vuelvas a preguntar.
2. Comercios que no encajan: no adivines. Haz una lista corta "Comercios sin reconocer" con importe y fecha y pregunta a Renzo de una vez, con opciones de categoría.
3. Una decisión nueva de Renzo se convierte en regla en `categories.js` con su test, nunca en un arreglo manual de datos.
4. Movimientos que llegan de Jarvis o de un import van siempre a revisión (AI Inbox / needs_review), nunca directos.
5. Cifras: calcúlalas con código sobre los datos, no a ojo. Cruza nómina neta con el ingreso en el banco cuando estén los dos.
6. Datos reales de Renzo nunca en tests ni fixtures: usa los ficticios de `tests/fixtures/`.
7. Cambios de código: skill `rise-hub-release`.
