# SelfLearn · Nederlands A0–B2 (RISE HUB)

**Estado**: desarrollo en rama `feature/selflearn-a0-b2`, destino `staging`. No fusionar ni publicar en producción automáticamente.

## Alcance implementado

- El área visible **Study · Dutch** pasa a **SelfLearn · Courses**; **Nederlands** sigue siendo el primer curso. Se preserva la ruta técnica `study` y la clave de datos existente para no romper los enlaces ni el historial.
- 33 unidades iniciales por niveles: A0 (5), A1 (12, incluyendo las 7 unidades antiguas), A2 (6), B1 (5) y B2 (5).
- Quiz por unidad con selección aleatoria de vocabulario y comprensión de una frase. Umbral de progreso: **80 %**; el intento fallido se guarda pero no desbloquea la unidad siguiente.
- **Diagnóstico orientativo**: 15 preguntas de vocabulario (3 por nivel). Sugerencia de punto de partida editable. **No evalúa comprensión oral auténtica, escritura ni conversación; no certifica MCER**.
- Sesiones de 5, 10 o 20 minutos, con acceso exprés a 5 minutos. Si RISE HUB tiene turno configurado, la interfaz aconseja una práctica breve sin modificar las preferencias elegidas.
- Contextos seleccionables: **Mixto**, **Vida diaria**, **Logística**, **Analítica**. Cambian el escenario de producción escrita/oral en el laboratorio, no la dificultad declarada ni el orden del MCER.
- Audio con síntesis de voz `nl-NL` del navegador para frases; transcripción accesible como alternativa. Dictado opcional con Web Speech API cuando existe: la transcripción **no** se presenta como evaluación de pronunciación.
- Repaso de tarjetas con **FSRS**, 4 calificaciones (Otra vez, Difícil, Bien, Fácil), historial de revisión y vencimientos. Las palabras se incorporan automáticamente cuando se supera la unidad; se preservan tarjetas antiguas.
- `learningSettings` se guarda junto a `learningSkills` en `hub_user_state.state` y el historial en `hub_records` existente. **No requiere migraciones**. No se añaden tablas, nuevas políticas ni nuevos servicios de IA.
- Progreso previo: las 7 lecciones existentes se reconocen por el campo `legacyDay` y las entradas antiguas `lessonDay`. Las entradas nuevas usan `courseLessonId`, de modo que cambiar el orden no confunde lecciones anteriores.

## Personalización inicial

El nivel recomendado **A1 es una sugerencia**, basada en el contexto A1–A2 comunicado anteriormente por el usuario; no es una medición de competencia. Los ejemplos cubren el neerlandés diario en Países Bajos, operar carretillas, seguridad e inventario, y transitar hacia un puesto de Logistics Data Analyst. Se incluyen actividades fuera del trabajo porque el objetivo no se limita al almacén.

## Uso recomendado

1. Realizar el diagnóstico de vocabulario o elegir manualmente A0 si se desea repasar fundamentos.
2. En días de turno: 5 minutos de práctica más tarjetas vencidas; días libres: 10–20 minutos.
3. Repetir una unidad si no llega al 80 %. Hablar en voz alta, registrar un ejemplo propio y practicar en situaciones reales.
4. Revisar la sección de tarjetas sin forzar respuestas «Fácil» cuando no se recuerda.
5. Para validar B1/B2, usar materiales y pruebas auténticas oficiales de NT2. El curso actual es **una base inicial**, no un temario exhaustivo capaz de garantizar B2.

## Base técnica y atribución

- [ts-fsrs](https://github.com/open-spaced-repetition/ts-fsrs) · MIT · algoritmo FSRS. Integrado como dependencia bloqueada en `package-lock.json` y paquete web precompilado (`npm run build:selflearn`). Esto funciona sin depender de CDN en la aplicación.
- [Descriptores MCER (Consejo de Europa)](https://www.coe.int/en/web/common-european-framework-reference-languages/cefr-descriptors).
- [DUO Staatsexamen NT2](https://www.duo.nl/particulier/staatsexamen-nt2/hoe-het-staatsexamen-nt2-werkt.jsp): Programa I B1 y Programa II B2, destrezas Lezen, Luisteren, Spreken y Schrijven.
- No se ha incorporado el código de aplicaciones completas de terceros: sus arquitecturas y licencias no encajan necesariamente con esta PWA privada sin framework.

## Privacidad

Se mantiene el login privado existente. Los datos de estudio se sincronizan con el Supabase de **cada entorno**, sin mezclarlos. Las lecciones no contienen datos reales de empleadores, clientes ni almacenes. La síntesis de voz usa capacidades disponibles en el navegador; el dictado opcional puede usar servicios del proveedor del navegador. No activar grabación en segundo plano ni enviar audio a terceros desde la app.

## Limitaciones y siguiente iteración

La primera fase ofrece práctica guiada con vocabulario, respuestas múltiples, explicación, audio y escritura libre. Todavía **no** hay: calificación fiable de pronunciación, ejercicios de comprensión auditiva con audio humano auténtico, corrección automática de textos largos, tutor conversacional con IA, evaluación equilibrada de las cuatro destrezas, contenidos suficientes para preparar por sí sola el B2 oficial ni emisión de certificados.

Para la siguiente iteración se aconseja ampliar tareas por nivel, detectar errores recurrentes por habilidad, incorporar material auténtico con permisos/licencias, rúbricas de corrección humana/IA y simulacros NT2 comparables con modelos oficiales. Antes de introducir IA para dictado o tutor hay que elegir proveedor, coste máximo mensual, tratamiento de datos y controles de privacidad.

## Comprobación

```
npm run check
npm test
npm run dev
node tests/e2e/selflearn.mjs
```

El E2E de SelfLearn emplea una cuenta ficticia con Supabase simulado, y **no verifica las políticas ni los permisos de la instancia real**. Hacer pruebas autenticadas en staging antes del PR de producción.
