# Contratos de contenido — no aceptar «temario = curso terminado»

## Estados editoriales por lección
`planned` (solo título) → `draft` (texto preliminar) → `reviewed` (validación académica) → `ready` (QA técnico + contenido) → `published` (visible); dejar audit trail con revisor/fecha. Este kit contiene catálogo `planned` y 24 lecciones piloto `draft`; **NO publicar drafts**.

## Lección importable: estructura requerida
```yaml
---
id: math-m00-l02
course: matematicas
module: M00
level: N0
title: Fracciones y operaciones
learning_objectives:
  - Sumar fracciones con mcm
  - Justificar procedimiento
prerequisites: [math-m00-l01]
exam_alignment: [arithmetica-algebra]
estimated_minutes: 35
source_kind: original
source_urls: [https://universitats.gencat.cat/es/proves-majors/25-anys/temaris-estructura/fase-especifica/matematiques/]
content_version: 1
editorial_status: draft
---
```

### Orden obligatorio de cuerpo
1. «Qué aprenderás y para qué sirve». 2. Recordatorio de conocimientos mínimos. 3. Explicación intuitiva. 4. Definición rigurosa. 5. **Al menos dos ejemplos desarrollados línea a línea** y un contraejemplo/error típico. 6. Ejercicio guiado con pista. 7. Ejercicios 3 fáciles + 2 medios + 1 tipo examen o transferencia. 8. Corrección paso a paso, errores y cómo revisarlos. 9. Mini evaluación (5 ítems independientes). 10. Resumen, vocabulario y repaso a 1/3/7/14/30 días. 11. Procedencia del temario y nivel.

### Longitud/rigor mínimo recomendado
- 600–1200 palabras **por lección** (algunos temas requieren más) sin contar ejercicios/soluciones.
- Inglés: explicaciones en español con ejemplos de estructuras auténticas en inglés, la práctica exam en inglés.
- Teoría y tareas: 6–10 actividades por lección + 5 ítems de salida, con soluciones independientes y verificadas.
- No añadir hechos falsos sobre la frecuencia estadística de temas.
- Prohibido copiar íntegros enunciados de años anteriores; enlazarlos desde índice.

## JSON del ejercicio, esquema conceptual
```json
{
  "id": "mat-frac-002",
  "lesson_id": "math-m00-l02",
  "kind": "multiple_choice",
  "difficulty": 1,
  "skill_ids": ["fraction_add"],
  "prompt_md": "Calcula: $1/2 + 1/3$",
  "choices": [
    {"id":"a","text":"2/5"},
    {"id":"b","text":"5/6"},
    {"id":"c","text":"1/6"},
    {"id":"d","text":"3/5"}
  ],
  "grading_private": {
    "correct_choice_id": "b",
    "points": 1,
    "explanation_md": "mcm(2,3)=6; 3/6 + 2/6 = 5/6"
  },
  "source_kind":"original",
  "license":"original",
  "editorial_status":"draft"
}
```
`grading_private` se extrae a tabla no accesible para usuario antes de entregar, NO enviarla con GET lesson.

## Evaluación por tipo
- `multiple_choice`: 4 alternativas, una sola correcta, rationale para distractores. En examen usar penalización configurable.
- `numeric`: valor, unidad, tolerancia absoluta/relativa, sig figs si procede; mantener clave en servidor.
- `math_expression`: equivalencia simbólica en entorno seguro (whitelist), no eval arbitrario ni JS.
- `multi_step`: pasos/hitos y parcial + revisión humana o herramienta robusta; no basarse únicamente en comparación de texto.
- `short_text`: rúbrica/comprobación contextual y revisión.
- `essay`: recuento palabras, rúbrica por criterios, evidencia textual, feedback IA como **orientación**, no «nota oficial».
- `reading_passage`: texto **original** con sus preguntas, etiquetado y versión.

## Controles académicos automáticos + revisión humana
- Esquemas JSON validan `id`, `course`, `source_kind`, `learning_objectives`, `prerequisites`, tipos soportados, marcado N0..N4.
- Comprobaciones algorítmicas de matemáticas y unidades, gramática de respuestas, consistencia de distractores y costes de IA.
- Ninguna lección `ready` si `prerequisites` apunta a ID inexistente, falta una solución, no respeta longitud o tiene material ajeno sin licencia.
- Un revisor verifica soluciones y ejemplos a mano para problemas no deterministas.
