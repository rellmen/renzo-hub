# SelfLearn Language Academy — diseño de personalización (fase 3, preparación)

**Estado:** especificación de trabajo; NO activar fase 3 ni desplegar. **Lead:** ChatGPT. **Soporte/revisión:** Claude. Issue #93.

## Auditoría de main (19-10-2026)
- `microapps/selflearn/view.js`: ya ofrece dos cursos, rutas por niveles, selección de duración y tema, historial, tarjetas FSRS, TTS del navegador, dictado opcional y autoevaluación.
- `microapps/selflearn/engine.js`: lecciones con ejercicios, reintentos y progreso por curso; `checkTyped` admite artículos opcionales y pequeñas erratas. Esta tolerancia no debe ocultar errores de gramática en ejercicios gramaticales.
- `world.js`: `learningSettings`, `learningRuns`, `learningSkills` y sincronización con Supabase; es compartido y no se debe modificar sin pruebas de regresión.
- El diagnóstico actual usa 3 palabras por nivel: mide vocabulario orientativo, NO gramática, habla o pronunciación.
- El dictado no es una evaluación fiable de pronunciación; la propia interfaz lo advierte.
- `docs/COLABORACION-IA.md` asignaba SelfLearn a Claude; la nueva decisión del usuario (19 oct) establece ChatGPT como lead y Claude como soporte. Actualizar la matriz antes de integrar.

## Alcance
Solo idiomas: **neerlandés A1–B2** e **inglés hacia C1**. El nivel inicial real se debe medir por destreza; no asumir que el objetivo es el nivel actual. SQL, Python, Power BI → Career (fase 7), preservando historial.

## Experiencia propuesta
1. **Inicio por idioma:** objetivo, nivel estimado por destreza, minutos diarios, gramática y pronunciación como prioridades por defecto (configurables), próxima lección y repaso.
2. **Diagnóstico multicompetencia:** 8–12 ejercicios de gramática, comprensión y escritura por idioma; tareas orales optativas, sin atribuir una puntuación de pronunciación a transcripciones ASR. Resultados y confianza separados por destreza.
3. **Ruta semanal adaptativa:** 40% gramática, 30% pronunciación/escucha, 20% uso contextual y 10% repaso como punto de partida; reequilibrar con errores reales, nunca solo por preferencia declarada.
4. **Gramática:** microexplicación → contraste correcto/incorrecto → completar → producir frase → explicación del error → repetir 1/3/7 días. NL: orden V2, inversión, subordinadas, de/het, tiempos y separables; EN: tiempos, artículos, preposiciones, condicionales, preguntas y word order.
5. **Pronunciación:** escuchar voz natural, ritmo reducido, repetir, comparar con modelo y practicar pares mínimos. NL: g/ch, ui, eu, ij/ei, vocales largas/cortas; EN: th, vocales, word stress, schwa y ritmo. Si no hay micrófono o consentimiento, ofrecer práctica sin grabar. TTS/ASR del navegador no equivalen a evaluación fonética.
6. **Feedback personalizado:** clasificar error por idioma/destreza/regla, ofrecer corrección y explicación en español, ejemplo contextual de vida cotidiana/logística, guardar solo los datos necesarios.
7. **Progreso real:** métricas por regla y destreza, no un único nivel autodeclarado; preservar `learningRuns`, `vocabulary`, `entries` y datos legados. Sin certificados ficticios.

## Contrato de datos propuesto (NO migrar aún)
`learningSettings.courses.nl|en.personalization = { goalLevel, priorities: {grammar,pronunciation}, dailyMinutes, preferredContexts, explanationLanguage }`.
`learningErrorLog` separado por usuario/curso con identificador estable, regla, destreza, resultado, marca de tiempo y política de retención. Antes de persistir, decidir entre estructura existente y nueva tabla; revisar RLS, conflictos de sincronización, exportación y borrado.

## Tareas de implementación (orden)
- [ ] Auditoría exhaustiva de `view.js`, `engine.js`, `courses/nl.js`, `courses/en.js`, tests y rutas de persistencia.
- [ ] Añadir configuración de prioridades por curso con valores compatibles hacia atrás.
- [ ] Añadir banco de ejercicios gramaticales etiquetados por regla y nivel, con tests de corrección estricta.
- [ ] Construir planificador determinista que favorezca errores repetidos y sesiones cortas.
- [ ] Mejorar práctica oral opcional con instrucciones de articulación y control explícito de micrófono.
- [ ] Añadir evaluación y dashboard por destreza, accesibilidad móvil, tests unitarios y E2E.
- [ ] Claude: revisar cobertura de tests, edge cases de persistencia y accesibilidad, sin editar `world.js`, `sw.js` o `release.json` sin coordinación.
- [ ] Abrir PR a staging tras revisar políticas vigentes; verificar CI y Vercel preview antes de solicitar autorización de integración.

## Criterios de aceptación
- Los idiomas y sus preferencias se guardan por separado, sobreviven cierre de sesión y no se sobrescriben entre dispositivos.
- Un error gramatical no se marca como correcto por tolerancia ortográfica general.
- Pronunciación practicable sin micrófono, con consentimiento si se usa; nunca presentar puntuación ASR como certificación.
- Sin pérdida de sesiones existentes ni cambios en My Finance, Gym o Work.
- Pruebas verdes, staging autenticado, RLS verificada y revisión móvil antes de producción.
