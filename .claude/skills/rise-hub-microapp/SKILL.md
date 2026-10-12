---
name: rise-hub-microapp
description: Crear o ampliar una microapp de RISE HUB con el generador del repo, el registro y sus pruebas. Úsala cuando Renzo pida una sección, herramienta o pantalla nueva dentro de RISE HUB.
---

# Microapp nueva en RISE HUB

La guía completa está en `docs/MICROAPPS.md`. No construir fuera del registro ni copiar código de conversaciones antiguas, capturas o Lovable: se reimplementa en el repo.

1. Decide con Renzo el área (My Finance, Body, Learning…) y si es pestaña o sección. Si tiene varias opciones razonables, dale 2 o 3 para elegir.
2. `./scripts/renzo-hub new-microapp <id> "<Nombre>" <area> [domain] [--tab]`. Crea el módulo desde la plantilla, lo declara en `microapps/registry.js` y lo añade a la caché de `sw.js`.
3. Datos sencillos: `microapps/records.js` sobre `hub_records`, sin migraciones. Dominios permitidos: personal, work, body, money, learning, news, system. Si hace falta una tabla nueva, es una migración aditiva con rollback y pasa por la skill `rise-hub-release`.
4. Nada inventado en estadísticas: si faltan datos, "sin datos". Datos importados o de Jarvis siempre a revisión humana.
5. Mantén móvil y escritorio y la instalación PWA. Prueba en Chromium y WebKit cuando toque la interfaz.
6. Tests: `npm test` (registro, caché, superficie publicada y kit de datos) y, si aplica, un test propio en `tests/`.
7. Cierra con la skill `rise-hub-release`.

RISE HUB no se mezcla con Nodalys: ni código, ni datos, ni agentes.
