# RISE HUB · NOCTURNE ASCENDANCY — implementación y entrega para QA

**21 de octubre de 2026 · rama:** `feature/nocturne-ascendancy-ui` → PR a `staging`  
**Estado:** implementación visual de primera fase, NO aprobada para publicación.  
**Responsable de la propuesta:** ChatGPT. **Revisión final:** Work y Renzo.

## Visión aprobada

RISE HUB es un sistema operativo personal con presencia cinematográfica, no una plantilla SaaS ni un juego. Equilibrio de 70 % sofisticación, 20 % futurismo y 10 % dramatismo. Identidad **NOCTURNE ASCENDANCY**: Luxury Tech × Dark Academia × futurismo cinematográfico.

| Token | Valor | Uso |
|---|---|---|
| Obsidiana | `#111116` | fondo general |
| Borgoña | `#481D35` | profundidad, fondos y acentos de identidad |
| Violeta imperial | `#6149A6` | identidad Ares y matices |
| Platino | `#C5C9D4` | textos secundarios importantes |
| Oro antiguo | `#C6A16C` | hitos y CTA puntuales, nunca todas las acciones |
| Violeta de interacción | `#BBA6EF` | controles con mayor contraste |
| Fondo de panel | `#1B1920` | tarjetas |
| Foco | `#E8D7FF` | foco de teclado visible |

El código vive en `assets/nocturne-ascendancy.css`, enlazado **después de los estilos originales**, sin alterar datos, permisos, guardado, rutas, handlers ni el sistema de autenticación. Mantener el sistema de componentes actual hasta sustituirlo de forma incremental y visualmente probada. No copiar el prototipo React de Lovable sobre la app vanilla JS.

## Áreas implementadas en esta fase

- **Shell y navegación:** sidebar premium en escritorio, barra segura en móvil y Ares como punto central, sin neón invasivo.
- **Home:** hero editorial, CTA funcional hacia Gym, fondos recortados dentro de sus tarjetas y acceso a áreas existentes. Se muestran exclusivamente estadísticas reales.
- **Ares Center — Imperial Intelligence:** violeta/obsidiana; no se inventan herramientas operativas ni permisos de ejecución.
- **Money — Obsidian Wealth:** oro champán y superficie profunda; cálculos, datos bancarios, balances, importes y flujos originales intactos.
- **Gym — Crimson Protocol:** carmesí y grafito; se mantiene sesión activa, guardado de series, reloj, progreso, fotos privadas y recuperación.
- **SelfLearn — Emerald Academy:** verde oscuro y marfil; solo idiomas. Mantener NL hasta B2 e inglés hacia C1 sin afectar sincronización, XP, FSRS o audio.
- **Skin Routine:** amatista/rosa mineral, pasos y estados completados; no alterar productos ni fotos privadas.
- **Food:** arenisca cálida; cálculos reales de calorías, proteína y consumos sin modificaciones.
- **Body / Work / System:** platino, jerarquía ejecutiva y campos legibles.
- **Notas, Agent Monitor, AI Inbox y Project Tracker:** no fingir módulos inexistentes. Aplicar estos conceptos únicamente a las pantallas existentes; futuras microapps deben atravesar `microapps/registry.js`, diseño, QA y autorización.

## Archivos modificados

- `assets/nocturne-ascendancy.css`: identidad visual adaptativa; sin scripts.
- `index.html`: import final de la hoja visual, copy editorial de Home, CTA y color PWA.
- `manifest.webmanifest`: fondo y theme color obsidiana.
- `sw.js`: versión `renzo-hub-cloud-v58-nocturne-ascendancy` y precaché de hoja nueva.
- `release.json`: versión propuesta 2.54.0, nunca significa publicada.
- `tests/nocturne-ui.test.mjs`: contratos visuales y PWA.
- `tests/e2e/microapps-mobile-audit.mjs`: comprobación geométrica de Home en 320, 390, 768, 1440 px y Chromium/WebKit.

## Gates obligatorios antes de staging y publicación

- [ ] `npm run check`, `npm test`, `node tests/deploy-surface.test.mjs` en limpio sobre el SHA del PR.
- [ ] CI de GitHub verde en los trabajos `test` y `db-migrations`.
- [ ] Verificar Home y todas las microapps a 320/375/390/430/768/1440px con capturas antes/después.
- [ ] Imagen de cada tarjeta siempre dentro del contenedor; nada de absolute bleed, scroll lateral, overlays o botones tapados por el dock.
- [ ] Contrastes WCAG AA en texto normal, focus, selected, hover, error, loading y disabled; `prefers-reduced-motion` respetado.
- [ ] Autenticación y privacidad reales en **staging**; no datos de producción.
- [ ] SelfLearn: respuesta guardada → salir → iniciar sesión → progreso intacto y sin duplicados.
- [ ] Gym: sesión/serie/temporizador/guardar/salir/volver → datos idénticos.
- [ ] Finanzas y nóminas: importes idénticos antes/después; estados vacíos sin números inventados.
- [ ] Skin, Food, Body, Work, Ares y notas: navegación y guardado existente sin regresión.
- [ ] PWA iPhone: instalación, actualización del service worker, recarga fría, nuevo CSS tras borrar caché vieja y zonas seguras.
- [ ] Revisar que el nuevo tema no degrade estilos internos de tarjetas, gráficos o secciones de accesibilidad.
- [ ] Producción **prohibida** sin revisión visual y autorización explícita de Renzo; jamás fusionar este PR directo a `main`.

## Handoff a Work

1. Leer este documento, `AGENTS.md`, `docs/UI-VNEXT-DESIGN-CONTRACT.md`, `docs/RELEASE-CHECKLIST.md` y `docs/COLABORACION-IA.md`.
2. Inspeccionar la rama y el PR resultante; registrar el SHA exacto y el estado de CI antes de cambiar nada.
3. **Trabajar solo en validación y últimos retoques**: probar, comparar, corregir errores visuales y añadir capturas. No reescribir la arquitectura ni sustituir los módulos actuales.
4. Mantener `staging` y `main` sin tocar. Informar hallazgos con capturas y enlaces a commits; pedir aprobación antes de integrar.
5. Después del visto bueno: PR → staging, validar en Vercel preview y en iPhone; publicación a producción por aprobación separada.

**Limitación importante al entregar:** los archivos pueden revisarse en GitHub y la auditoría está añadida, pero la ejecución de tests y capturas E2E todavía requiere CI/browser real. Sin esas evidencias, el diseño sigue en estado «preparado, sin publicar».
