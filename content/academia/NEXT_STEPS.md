# Academia +25 · Estado real y próximos pasos

Actualizado: 24 octubre 2026 (noche, 3.ª tanda) · Rama `feature/academia-uoc25` · **No terminado.** Ninguna lección está publicada.

## Decisión de ruta (24-10-2026, verificada en la web oficial de la UOC, convocatoria 2026)

**Ruta: Ingeniería (Informática) → específicas Matemáticas + Física.** En la prueba de la UOC en castellano, Ingeniería y Arquitectura elige entre Física, Matemáticas y Química; **Economía de la Empresa no figura en ninguna opción**. Las 10 lecciones de Economía quedan como material **complementario** (no cuentan para el examen). Datos UOC 2026: examen virtual (Google Meet); Comentario 90 min; Castellano + Inglés 105 min; fase específica 180 min para las dos materias; nota final = media de fases, cada fase ≥ 4, aprobado ≥ 5; sin catalán. Fuente: https://www.uoc.edu/es/estudios/acceso-mayores/acceso-universidad-mayores-25 . Revalidar con la convocatoria 2027.

Repositorio de exámenes oficiales (sistema catalán, enlaces a PDF originales; no se copian): bóveda del proyecto `renzo-hub/academia/Repositorio_Examenes_Mayores25.md`. La web de la Generalitat bloquea la lectura automática: Renzo adjuntará los PDF 2024–2025 para calibrar simulacros originales; 2026 se reserva como simulacro final.

## Cobertura verificada (salida de `node tools/academy/build.mjs --check`)

| Materia | Lecciones en catálogo | Con texto | Al estándar | Publicadas |
|---|---|---|---|---|
| Matemáticas | 56 | **56** | **56** | 0 |
| Economía de la Empresa (complementaria) | 10 | **10** | **10** | 0 |
| Lengua castellana | 11 | **11** | **11** | 0 |
| Comentario de texto | 10 | **10** | **10** | 0 |
| Inglés | 10 | **10** | **10** | 0 |
| Física (**específica elegida**) | 23 | 4 | 4 | 0 |
| **Total** | **120** | **101 (84 %)** | **101** | **0** |

Estados editoriales: 19 `planned`, 101 `draft`, 0 `reviewed`, 0 `ready`, 0 `published`.
«Al estándar» = validación automática (11 secciones, ≥600 palabras de teoría, ≥2 ejemplos, error típico, ejercicio guiado con pistas, 6 prácticas resueltas, 5 preguntas de salida). **No sustituye la revisión académica humana.**

Preguntas: 561 (505 de salida + 56 del banco del kit). 342 claves numéricas o algebraicas verificadas por cálculo independiente (`tools/academy/verify_keys.py`, en CI, comprobado con SymPy 1.13.3 y 1.14; una clave alterada a propósito se detecta). 183 de lengua, comprensión o conceptuales requieren revisión humana. Las 7.351 fórmulas compilan con KaTeX en modo estricto (`src/test/academy-katex.test.ts`).

**Matemáticas completa M00–M11** (56 lecciones, todas en `draft`): aritmética, preálgebra y álgebra (M00–M02), sucesiones y finanzas (M03), funciones (M04), trigonometría (M05), álgebra lineal (M06), geometría (M07), derivadas (M08), integrales (M09), estrategia de examen (M10) y puente universitario N4 (M11, fuera del temario +25).

**Fase general completa** (Castellano 11/11, Comentario 10/10, Inglés 10/10, todas en `draft`), incluidas las lecciones de formato de examen (C07, T06, E06) con penalizaciones del perfil de referencia 2026 y los puentes universitarios N4 (C08, T07, E07). Los recuentos de palabras de los textos modelo se han comprobado por script.

**Economía de la Empresa completa** (10/10, todas en `draft`): empresa y formas jurídicas, contabilidad, análisis financiero, financiación, inversiones, estrategia, plan de negocio y punto muerto, formato de examen (B08: 4 de 5 ejercicios de 2,5; test con −0,15 por fallo, valor de las preguntas a confirmar en la convocatoria) y puente universitario (B09). Los datos legales de B01 (capital mínimo de SL y SA) son orientativos y deben comprobarse con la normativa vigente.

M10, C07, T06 y E06 usan el formato de referencia 2026 de `exam-profiles.json` (Matemáticas: 4 de 6 cuestiones a 1,5 y 1 de 2 problemas a 4; Castellano: −0,16 por fallo en cuatro opciones y −0,1 por error; Comentario: 6 + 4 puntos; Inglés: −0,33 y −0,05). **Revalidar con la convocatoria 2027**; la duración oficial no está incluida porque no se pudo verificar (la página oficial bloquea la lectura automática).

## Infraestructura

- Migración `supabase/pending/20261024090000_academy_foundation.sql`: aplicada **solo en staging** (`20261024000925`). Producción: no aplicada.
- Claves cargadas en staging: 557 filas, MD5 idéntico al seed local (`64f4f433488988bb5bb7ea4ccbc5f1be`).
- Prueba de corrección en staging con usuario sintético en transacción revertida: corrección en servidor, idempotencia, claves invisibles, cierre de evaluación 4/5 = 80 % → completada y repaso a +1 día (repetida con M09-L01, incluida respuesta decimal con coma; y con Castellano C00-L01: respuesta abierta sin tilde ni mayúsculas aceptada, 4/5 = 80 %; Inglés: texto *Was Delivered* aceptado y decimal *0,335* aceptado; Economía B07: *1.200* con punto de miles aceptado, 4/5 = 80 %). Las preguntas de salida se rechazan en modo práctica. Sin datos residuales.
- Réplica PostgreSQL local (`tools/db-replica/academy_test.sh`): RLS entre cuentas A/B, CAS de autoguardado, simulacros inmutables, rollback.
- QA visual con datos sintéticos (Chromium): escritorio, iPhone 13, iPad, sin scroll horizontal. Corregido: las tablas tenían un ancho mínimo de 420 px y se cortaban en iPhone; ahora se ajustan y las anchas desplazan dentro de su marco. Segunda corrección: en móvil, las tablas de tres columnas con texto largo seguían 39 px más anchas que la pantalla; ahora usan menos relleno lateral y guionado automático, y caben (314 px en un iPhone 13). Tercera corrección: las tablas de formas jurídicas (B01) y de ratios (B03) se rehicieron con celdas cortas y notas debajo; comprobadas en móvil junto con las de C01 y E02.

## Pendiente, en este orden

1. **Física: 19 lecciones** (F00, F01-L02..L04, F02-L02..L05, F03-L02..L05, F04–F07, F09, F10, F11), en el orden del plan de estudio (F00–F03 primero).
2. **Simulacros originales** de Matemáticas, Física, Comentario, Castellano e Inglés, calibrados con los PDF 2024–2025 que adjunte Renzo (sin copiar enunciados).
3. Ajustar M10 y F10 con la duración real de la fase específica (180 min para dos materias) y marcar Economía como complementaria en la interfaz.
4. **Revisión humana** de las lecciones en staging (botones de revisión editorial).
5. **QA con sesión real** (cuenta A y B) y en iPhone físico.
6. Confirmar la convocatoria 2027 de la UOC cuando se publique.
7. Solo después: autorización de Renzo para producción.

## Cómo añadir una lección sin tocar código

1. Crear `content/academia/lessons/<id>.md` con el frontmatter de `kit/CONTRATOS_CONTENIDO.md` y las 11 secciones.
2. Crear `content/academia/questions/<id>.json` con 5 preguntas de salida.
3. Si hay preguntas numéricas, añadir su cálculo en `tools/academy/verify_keys.py`.
4. `node tools/academy/build.mjs` y `python3 tools/academy/verify_keys.py`.
5. Cargar `supabase/seed/academy_question_keys.sql` en staging (idempotente).
