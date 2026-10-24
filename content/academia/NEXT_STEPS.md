# Academia +25 · Estado real y próximos pasos

Actualizado: 24 octubre 2026 (tarde) · Rama `feature/academia-uoc25` · **No terminado.** Ninguna lección está publicada.

## Cobertura verificada (salida de `node tools/academy/build.mjs --check`)

| Materia | Lecciones en catálogo | Con texto | Al estándar | Publicadas |
|---|---|---|---|---|
| Matemáticas | 56 | 24 | 24 | 0 |
| Economía de la Empresa | 10 | 3 | 3 | 0 |
| Lengua castellana | 11 | 4 | 4 | 0 |
| Comentario de texto | 10 | 3 | 3 | 0 |
| Inglés | 10 | 4 | 4 | 0 |
| Física (optativa) | 23 | 4 | 4 | 0 |
| **Total** | **120** | **42 (35 %)** | **42** | **0** |

Estados editoriales: 78 `planned`, 42 `draft`, 0 `reviewed`, 0 `ready`, 0 `published`.
«Al estándar» = validación automática (11 secciones, ≥600 palabras de teoría, ≥2 ejemplos, error típico, ejercicio guiado con pistas, 6 prácticas resueltas, 5 preguntas de salida). **No sustituye la revisión académica humana.**

Preguntas: 266 (210 de salida + 56 del banco del kit). 159 claves numéricas o algebraicas verificadas por cálculo independiente (`tools/academy/verify_keys.py`, en CI, comprobado con SymPy 1.13.3 y 1.14). 71 de lengua, comprensión o conceptuales requieren revisión humana. Las 3.293 fórmulas compilan con KaTeX en modo estricto (`src/test/academy-katex.test.ts`).

**Matemáticas M00–M02 completas** (aritmética de rescate, preálgebra y álgebra intermedia): 21 lecciones, todas en `draft`.

## Infraestructura

- Migración `supabase/pending/20261024090000_academy_foundation.sql`: aplicada **solo en staging** (`20261024000925`). Producción: no aplicada.
- Claves cargadas en staging: 262 filas, MD5 idéntico al seed local (`264f0d52f56c0c86fc71c61f037407d9`).
- Prueba de corrección en staging con usuario sintético en transacción revertida: corrección en servidor, idempotencia, claves invisibles, cierre de evaluación 4/5 = 80 % → completada y repaso a +1 día. Sin datos residuales.
- Réplica PostgreSQL local (`tools/db-replica/academy_test.sh`): RLS entre cuentas A/B, CAS de autoguardado, simulacros inmutables, rollback.
- QA visual con datos sintéticos (Chromium): escritorio, iPhone 13, iPad, sin scroll horizontal.

## Pendiente, en este orden

1. **Revisión humana de las 42 lecciones** (Renzo o revisor): botón «He revisado esta versión» en cada lección → estado `reviewed`. Cambiar `editorial_status` en el frontmatter solo tras esa revisión.
2. ~~Matemáticas M00–M02~~ (hecho el 24-10-2026).
3. **Bloque general mínimo**: C03-L02, C04, C05; T01, T02, T04; E02, E04, E06.
4. **Economía** (segunda específica elegida, pendiente de confirmar en matrícula): B01, B03, B04, B06–B08.
5. **Matemáticas M03–M10** (sucesiones, funciones avanzadas, trigonometría, matrices, geometría, derivadas, integrales, entrenamiento de examen).
6. **Simulacros originales** por perfil (`exam-profiles.json`), etiquetados por año, temario y competencia, calibrados contra los exámenes oficiales 2024–2026 **enlazados** (no copiados).
7. **Diagnóstico de Física** (sin datos) y del resto de materias con ≥5 preguntas por habilidad crítica.
8. **QA con sesión real** en staging (cuenta A y cuenta B) y en iPhone físico.
9. **Confirmar con la UOC** la fórmula de nota, plazos y específicas disponibles de 2027 en castellano.
10. Solo después: autorización de Renzo para producción (migración en producción + fusión del PR).

## Cómo añadir una lección sin tocar código

1. Crear `content/academia/lessons/<id>.md` con el frontmatter de `kit/CONTRATOS_CONTENIDO.md` y las 11 secciones.
2. Crear `content/academia/questions/<id>.json` con 5 preguntas de salida.
3. Si hay preguntas numéricas, añadir su cálculo en `tools/academy/verify_keys.py`.
4. `node tools/academy/build.mjs` y `python3 tools/academy/verify_keys.py`.
5. Cargar `supabase/seed/academy_question_keys.sql` en staging (idempotente).
