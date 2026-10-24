# Análisis contrastado de tipologías — muestra de 2024 a 2026

**Alcance analizado:** convocatoria ordinaria de Matemáticas 2024/2025/2026; primera cuestión de Física 2025/2026 y ejemplos 2026 de Física, Castellano, Comentario e Inglés. **No se ha hecho censo de todas las preguntas de todas las series ni de Economía.** Prioridades cualitativas, no porcentajes especulativos de probabilidad de aparición.

## Matemáticas: comparación de convocatorias ordinarias

| Año | Tipologías observadas en fuentes oficiales | Cursos enlazados | Evidencia |
| --- | --- | --- | --- |
| 2024 | Dominio real de función radical/racional; raíces de polinomio; geometría de rectas/planos | M02, M04, M07 | [Enunciado 2024](https://universitats.gencat.cat/web/.content/01_acces_i_admissio/acces-universitat/acces-segons-perfils-estudiants/tinc-mes-25-anys/models-examens/convocatoria-2024/documents_pdf/25a_mate24et.pdf) |
| 2025 | Dominio de suma de radicales; comprobar primitiva; cuadrática con parámetro; puntos coplanarios; matrices, sistemas con parámetro; problema baricentro u optimización | M02, M04, M06, M07, M08, M09 | [Enunciado 2025](https://universitats.gencat.cat/web/.content/01_acces_i_admissio/acces-universitat/acces-segons-perfils-estudiants/tinc-mes-25-anys/models-examens/convocatoria-2025/documents_pdf/25a_mate25et.pdf) |
| 2026 | Dominio de radical; primitivas/derivadas; geometría analítica en plano; planos paralelos y vector normal; matriz inversa/traspuesta; ecuación radical; tangentes o sistema de nutrientes | M02, M04, M06, M07, M08, M09 | [Enunciado 2026](https://universitats.gencat.cat/web/.content/01_acces_i_admissio/acces-universitat/acces-segons-perfils-estudiants/tinc-mes-25-anys/models-examens/convocatoria-2026/documents_pdf/25a_mate26et.pdf) |

**Conclusión pedagógica limitada pero sólida:** las cuestiones de **dominio de funciones están presentes en estos 3 exámenes ordinarios**. Esto merece prioridad alta, pero **no garantiza** que aparezcan en 2027. También aparecen con claridad problemas que requieren dominar álgebra básica antes de matrices, cálculo o geometría.

## Física
- **2025**, primera cuestión: factores de conversión (L→m³, Hz→GHz, μg→kg, días→minutos, rad→grados, m/s→km/h). Evidencia: [2025](https://universitats.gencat.cat/web/.content/01_acces_i_admissio/acces-universitat/acces-segons-perfils-estudiants/tinc-mes-25-anys/models-examens/convocatoria-2025/documents_pdf/25a_fisi25et.pdf).
- **2026**, primera cuestión: unidades SI de masa, campo magnético, corriente, velocidad, temperatura y gravedad; otras cuestiones muestran caída en la Luna sin atmósfera, ley de Ohm/tabla de medidas, periodo y velocidad de onda, efecto Joule. Evidencia: [2026](https://universitats.gencat.cat/web/.content/01_acces_i_admissio/acces-universitat/acces-segons-perfils-estudiants/tinc-mes-25-anys/models-examens/convocatoria-2026/documents_pdf/25a_fisi26et.pdf).
- **Recomendación académica**: empezar siempre por F01 (SI/conversión) antes de saltar a fórmulas; añadir preguntas conceptuales «justifica por qué», no solo cálculo.

## Castellano / Comentario / Inglés 2026
- **Castellano:** texto con preguntas explícitas e inferencias; identificación de recursos, semántica y reflexión gramatical, más respuesta escrita. Fuente: [Castellano 2026](https://universitats.gencat.cat/web/.content/01_acces_i_admissio/acces-universitat/acces-segons-perfils-estudiants/tinc-mes-25-anys/models-examens/convocatoria-2026/documents_pdf/25_45a_lles26et.pdf).
- **Comentario:** texto de opinión; bloques de comprensión y producción argumentativa; la corrección de lenguaje afecta la puntuación. Fuente: [Comentario 2026](https://universitats.gencat.cat/web/.content/01_acces_i_admissio/acces-universitat/acces-segons-perfils-estudiants/tinc-mes-25-anys/models-examens/convocatoria-2026/documents_pdf/25_45a_cmtx26et.pdf).
- **Inglés:** lectura general sobre comparación de recetas humanas frente a sistemas de IA; distractores sobre detalles y sinónimos; redacciones de respuesta comprensiva. Fuente: [Inglés 2026](https://universitats.gencat.cat/web/.content/01_acces_i_admissio/acces-universitat/acces-segons-perfils-estudiants/tinc-mes-25-anys/models-examens/convocatoria-2026/documents_pdf/25a_angl26et.pdf).

## Metodología de clasificación para ampliar en Claude
- Crear `past_exam_map` con `year`, `series`, `subject`, `official_question_id`, `page`, `skills[]`, `difficulty_qualitative`, `points`, `exam_url`, `correction_url`.
- Contar número de apariciones **solo** tras auditar todas las series y años incluidos, desglosando ordinaria vs incidencias y mostrando denominador.
- Mantener el contenido **original** del banco en una tabla distinta de los enlaces a preguntas oficiales. Evitar copiar enunciados íntegros a la aplicación.
- Comparar las rúbricas de corrección: descomponer problemas en planteamiento, ejecución y verificación.
