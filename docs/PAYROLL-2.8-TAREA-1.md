# Nóminas 2.8.0 · revisión de Tarea 1

Fecha: 2026-10-09. Rama: `feature/payroll-2.8`, desde `main` (`7c110eb`). Solo desarrollo local. No se han ejecutado las tareas 2 y 3, creado PR, desplegado ni modificado bases de datos.

## Cambios

- Pestaña Mensual, entre Nóminas y Alertas, alimentada por `payroll_v_monthly_nl` mediante el cliente autenticado existente, con filtro `user_id` y orden descendente por `mes`.
- Selector independiente de año con preferencia por el año actual con datos; alternativa al último disponible.
- Total del año: bruto, neto, allowances, banco, horas trabajadas, horas extra y su importe. Si faltan valores de una magnitud se muestra «Sin datos», evitando un total parcial engañoso.
- Tarjetas con pagos, correcciones, pendientes, banco destacado, desglose del bruto sin ceros, retenciones y porcentaje, horas, saldos al cierre y equivalente mensual. No se suma `otros_ingresos` a vacaciones/baja.
- Se mantiene Evolución mensual en Resumen. Errores de la nueva consulta siguen el patrón existente y permiten navegar por las otras pestañas.
- Demo: tres meses sintéticos; bruto menos retenciones igual a neto y neto más allowances igual a banco. Agregados independientes de las nóminas individuales de la demo, sin datos reales.
- Release 2.8.0, caché `renzo-hub-cloud-v5.7-payroll`, documentación actualizada.

## Verificación

| Comando / revisión | Resultado |
|---|---|
| `npm run check` | OK |
| `npm test` | 19/19 |
| `PLAYWRIGHT_ROOT=/Users/Nodalys/Projects/RENZO-HUB/tools/e2e-runner node tests/e2e/payroll.mjs` | Chromium y WebKit OK |
| `git diff --check` | OK |
| Revisión visual de capturas | Móvil y escritorio, sin recortes de contenido |

Las pruebas de navegador interceptan las peticiones y sirven el código local con un adaptador sintético. No conectan a datos reales. Cubren el total, el primer mes, la corrección pendiente, el desglose sin ceros, el cambio de año y sus totales, ausencia de datos y fallo de consulta sin romper Resumen. Se conserva la cobertura anterior de login, revisión, Realtime, PDF y cierre de sesión.

A 390 y 1440 px se comprueba ausencia de desbordamiento horizontal y objetivos de pestañas, selector y desplegables de al menos 44 px. WebKit reveló que el selector nativo ignoraba el mínimo; se corrigió con apariencia controlada y altura de 48 px. Contrastes calculados: texto secundario 9,51:1; texto principal sobre el extremo claro del gradiente 12,82:1; chip pendiente 9,36:1; pestaña activa 7,64:1.

El arranque inicial del navegador fue bloqueado por el sandbox de macOS; las pruebas se completaron con ejecución autorizada fuera del sandbox. Node muestra el aviso preexistente de ausencia de `type: module` en package.json; no afecta a las pruebas.

## Capturas de demo

- [Móvil 390 px · Chromium](screenshots/payroll-monthly-chromium-mobile.png)
- [Escritorio 1440 px · Chromium](screenshots/payroll-monthly-chromium-desktop.png)
- [Móvil 390 px · WebKit](screenshots/payroll-monthly-webkit-mobile.png)
- [Escritorio 1440 px · WebKit](screenshots/payroll-monthly-webkit-desktop.png)

## Pendiente

Revisión de Renzo antes de continuar con Tarea 2. Los importes reales del brief no se han validado en producción: esa comprobación queda para cuando Renzo publique. La pestaña Año y sus capturas corresponden a la Tarea 3 y no están implementadas.
