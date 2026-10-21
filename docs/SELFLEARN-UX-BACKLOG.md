# SelfLearn — backlog de rediseño UX/UI (aplazado)
Fecha: 2026-10-21. Estado: **documentado, no implementar ahora**.

## Diagnóstico
La base funcional es más completa que la experiencia visual. La interfaz actual en `microapps/selflearn/view.js` y `microapps/selflearn/selflearn.css` contiene cursos NL/EN, estadísticas, lecciones, repaso, FSRS, tutor y progreso; compiten múltiples acciones en Home. La evaluación 6,5/10 fue heurística de código, no test visual autenticado.

## Trabajo futuro (por prioridad)
- **P0 — Integridad de datos:** pruebas autenticadas de persistencia después de cada respuesta, recuperar `learningRuns`, sincronización entre dispositivos, fallos offline/reintentos, sin borrar progreso. Revisar `sync.js` y contratos.
- **P1 — Home:** CTA único «Continuar aprendiendo», estado de lección guardada, siguiente lección, racha y repasos reales; evitar CTA redundantes.
- **P1 — Reproductor:** una pregunta por pantalla, controles táctiles >=44px, feedback inmediato, progreso y estados de carga/error; preservar engine.js.
- **P1 — Ruta CEFR:** mapa visual A1/A2/B1/B2 para NL y niveles correspondientes hasta C1 para inglés; separar unidades cursadas del nivel real estimado; no inventar métricas.
- **P2 — Habilidades:** progreso real por gramática, lectura, escritura, conversación, pronunciación y errores recurrentes.
- **P2 — Tutor Ares AI:** integración solo con backend autorizado, límites, privacidad, costes y estados de disponibilidad.

## Reglas de diseño
Mantener naranja como acento de Learn, pero compartir tokens, espaciados, tipografía, navegación, accesibilidad, estados vacíos y componentes con Body y demás módulos. Mobile first 320/375/390/430px. No datos ficticios en producción. Sin cambios en producción hasta revisión y pruebas.

## Foco actual
Auditoría global UX/UI de **todas** las secciones de RISE HUB en Lovable. Este backlog se retoma después, no se implementa en este ciclo.
