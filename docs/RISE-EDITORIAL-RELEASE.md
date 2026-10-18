# RISE HUB · integración editorial selectiva · 2026-10-18

## Alcance

Producción identificada por API de Vercel: `rise-hub` (`prj_G7Rzu7cpQuKo3wnByqNVgQ6gpjDd`), dominio `renzo-hub.vercel.app`, commit inicial `3124b706aaf1e6a32718df453988cc5daa5f6210`. La documentación antigua aún la llama renzo-hub.

Lovable `8698f153-f1ae-4d00-92fd-7ed2eb6718f2`, revisión `352f46f6903b388408d2eaf47785a95d064a648a`, usa React/TanStack/Tailwind y datos simulados. Producción es HTML/JS con autenticación y datos reales. Se conserva esa arquitectura y se adapta solo la presentación.

La integración visual ya existía en staging (PR #78, commits f31cf4c y 5f977d0), mezclada con funciones posteriores de Gym y SelfLearn. Esta rama reaplica solo esos cambios visuales sobre main y corrige sus conflictos de navegación. No se promueven esas funciones adicionales.

Logo SVG idéntico al de Lovable. Portada exacta del publicado, servida localmente como `assets/rise/editorial-v2.jpg`. Tipografía Manrope local y licencia incluidas. Marca PWA e iconos versionados. Caché `renzo-hub-cloud-v39-editorial-production`, 105 recursos.

## Correcciones detectadas en QA

- Ctrl/⌘K abría búsqueda y Ares: la búsqueda consume el atajo antes del listener de Ares.
- El launcher de Ares se ocultaba en microapps fullscreen: ahora solo se oculta cuando la navegación visible lo sustituye.
- La búsqueda anuncia su selección con combobox/listbox, mantiene la opción activa visible y gestiona búsquedas sin resultados.
- Ares devuelve el foco al control visible que lo abrió, sin forzar teclado en táctil.
- La capa editorial elimina los reflejos desbordados de los iconos del catálogo.

## Evidencia local

- `npm run check`: OK; sintaxis adicional palette.js y ares-ai.js: OK.
- `npm test`: 259/259, cero fallos.
- `node tests/deploy-surface.test.mjs`: 3/3, sin documentos internos ni secretos publicados.
- Smoke: 15/15, móvil y escritorio, cabeceras CSP y acceso privado.
- PWA: Chromium/WebKit activan SW y guardan los 105 recursos únicos.
- Nóminas: Chromium/WebKit, login simulado, PDF, revisión, KPIs, módulos y logout: OK.
- Finance income y finance complete: Chromium/WebKit: OK.
- Auditoría: 16 secciones a 390 px, más búsqueda/Ares/teclado a 320,390,768,1440 px en Chromium y WebKit, modos táctil y escritorio: OK.
- Ares AI: móvil/escritorio, fixtures de permisos, aprobaciones y logout: OK.
- Las regresiones de selección accesible y retorno de foco fallaron antes de corregirlas y pasan después.
- Revisión independiente del diff: hallazgos de navegación y accesibilidad corregidos.

Las pruebas de navegador usan datos ficticios; no certifican una sesión real de Supabase. No se han cambiado APIs, autenticación, esquema ni datos. Staging remoto, CI y producción se verificarán antes de declarar publicación. No se ha aplicado ninguna migración.
