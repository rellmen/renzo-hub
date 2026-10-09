# Nóminas 2.8.0 · revisión de Tareas 2 y 3

Fecha: 2026-10-09. Rama: `feature/payroll-2.8`. Codex completó la Tarea 2 y dejó la Tarea 3 implementada sin commitear al quedarse sin créditos; Claude la revisó, corrigió dos casos límite, verificó y la commiteó. Sin PR, sin despliegue, sin cambios en base de datos.

## Tarea 2 · smoke por entorno (commit 1663313)

- `tests/e2e/smoke.mjs` espera `production` si el hostname de `BASE_URL` es `renzo-hub.vercel.app` y `preview` en cualquier otro caso. `EXPECT_ENV` tiene prioridad; un valor distinto de production/preview se rechaza.
- `PLAYWRIGHT_ROOT` opcional para usar el runner externo.
- Verificado de nuevo por Claude: `BASE_URL=https://renzo-hub.vercel.app node tests/e2e/smoke.mjs` da **15/15** (solo lectura, sin login).

## Tarea 3 · pestaña Año

- Pestaña «Año» entre «Mensual» y «Alertas», con consulta `payroll_v_jaaropgave_nl`.
- Orden de cada tarjeta: control de completitud, valores oficiales para la jaaropgave/aangifte, lo registrado en el Hub, nota informativa.
- Ajustes de Claude sobre el trabajo de Codex:
  - El aviso de completitud se movió arriba: en móvil quedaba al final de una tarjeta muy larga.
  - Si `completo=false` pero no hay acumulado oficial, se muestra «sin datos» en vez de una diferencia negativa engañosa.
  - Si lo registrado supera al oficial (diferencia negativa), el texto pide revisar duplicados o correcciones.
  - Dos pruebas unitarias nuevas para esos casos.

## Verificación

| Comando / revisión | Resultado |
|---|---|
| `npm run check` | OK |
| `npm test` | 21/21 |
| `PLAYWRIGHT_ROOT=… node tests/e2e/payroll.mjs` | Chromium y WebKit OK (incluye Año, fallo aislado, sin datos y estado desconocido) |
| `BASE_URL=https://renzo-hub.vercel.app node tests/e2e/smoke.mjs` | 15/15 |
| `git diff --check` | OK |
| Vista real `payroll_v_jaaropgave_nl` (producción, 2026) | 24 nóminas · bruto registrado 13.812,81 · acumulado oficial 14.209,90 · diferencia 397,09 · completo false · loonheffing oficial 1.626,14 · horas extra 12,5 (coincide con el brief) |

## Capturas de demo

- [Año móvil 390 px · WebKit](screenshots/payroll-year-webkit-mobile.png)
- [Año escritorio 1440 px · WebKit](screenshots/payroll-year-webkit-desktop.png)
- [Año móvil 390 px · Chromium](screenshots/payroll-year-chromium-mobile.png)
- [Año escritorio 1440 px · Chromium](screenshots/payroll-year-chromium-desktop.png)

## Pendiente

Revisión de Renzo. Con su OK: PR `feature/payroll-2.8` → `main`, preview, y despliegue a producción ejecutado por Renzo.
