# SelfLearn 3 · cursos tipo Babbel (RISE HUB 2.34.0)

**Estado**: rama `feature/selflearn-babbel`, PR hacia `staging`. Sin desplegar, sin migraciones.

## Por qué no se guardaba el progreso (2.26–2.33)

1. El quiz solo se guardaba al pulsar **"Guardar intento"** en la pantalla final: salir o cerrar la app antes lo perdía todo.
2. Con sesiones de 5 min había 4 preguntas y el umbral del 80 % exigía **4/4**: un fallo y la unidad no avanzaba.
3. **"Marcar clase completada"** (práctica libre) se registraba como `Daily lesson`, que la ruta no reconoce.
4. `world.js` **sobrescribía siempre el estado local con el de la nube** al recargar, aunque el local fuera más nuevo.
5. Al fusionar registros, la **copia de la nube ganaba siempre**: un repaso FSRS hecho sin conexión se perdía.

6. (2.42.0) Al cerrar sesión, `signOut()` llegaba antes que la subida agrupada (1,2 s): la última respuesta no pasaba a otros dispositivos. Ahora se sube antes de cerrar la sesión.

## Qué cambia

| Antes | Ahora |
|---|---|
| Guardado al final, con botón | Guardado tras **cada respuesta**: local al instante, Supabase agrupado (1,2 s) y forzado al ocultar/cerrar la app |
| Sin reanudar | "Lección en curso · Continuar" en cualquier dispositivo; gana la sesión con la última respuesta |
| Umbral 80 % bloqueante | Como Babbel: los fallos se repiten al final y la lección se completa siempre; la nota es "aciertos a la primera" |
| 4 palabras y quiz de opción múltiple | 8 palabras por lección y 9 tipos de paso (abajo) |
| Solo neerlandés (33 unidades) | **Nederlands A0→B2 (63)** y **English B1→C2 (44)**, con progreso, nivel, foco y diagnóstico propios |
| Se reenviaban todos los registros en cada guardado | Solo los nuevos o modificados (afecta a todo RISE HUB) |

### Flujo de una lección
Palabra nueva (audio TTS + ejemplo) → comprobación inmediata, por bloques de 2 → gramática → emparejar → escuchar y elegir → completar el hueco → ordenar la frase con fichas → escribir (tolera mayúsculas, acentos, artículo y una errata o transposición) → completar el diálogo → (solo sesión de 20 min) decir la frase con dictado voluntario, sin nota de pronunciación.

Duración: corta (5 min, 6 palabras), normal (10 min), extendida (20 min, más frases y habla). Las tres completan la lección.

Al terminar: registro `Study path` (mismo formato que antes, XP = aciertos × 10 solo la primera vez), las 8 palabras pasan a tarjetas FSRS del curso (las falladas, para repasar hoy; el resto, mañana). El **repaso** mezcla opción múltiple, escritura y escucha, y reprograma cada tarjeta con FSRS en el momento de responder.

## Datos (sin migraciones)

- `hub_user_state.state.learningRuns.{nl|en}`: sesión a medias (versión 2, validada al cargar).
- `hub_user_state.state.learningSettings`: `startingLevel`, `focus`, `placement` (neerlandés, claves históricas), `sessionMinutes`, `activeCourse` y `courses.en` para inglés.
- `hub_records` `renzo_event`: `Study path` (lección), `Review session` (repaso), `Free practice` y `Placement`; campo nuevo `course`.
- `hub_records` `renzo_vocabulary`: campo nuevo `course` (las tarjetas antiguas sin campo cuentan como neerlandés).
- Progreso histórico: los **33 IDs** anteriores (`a0-1`…`b2-5`, `a1-legacy-0…6`) siguen existiendo con contenido ampliado, así que lo completado sigue completado; también se reconoce `lessonDay` de las 7 lecciones de logística originales.

## Archivos

- `microapps/selflearn/courses/nl.js` y `courses/en.js`: contenido.
- `microapps/selflearn/engine.js`: lógica pura (generar lección, corregir, repetir fallos, progreso, fusión). Probada en Node.
- `microapps/selflearn/view.js`: interfaz y guardado.
- `world.js`: monta SelfLearn en `study`, fusión local/nube corregida y sincronización solo de cambios.
- Se elimina `catalog.js` (sustituido por `courses/nl.js`).

## Personalización

Pensado solo para Renzo: hispanohablante, vive en Brabante, control de inventario con turnos alternos de mañana y tarde, gimnasio, finanzas personales, camino a análisis/ingeniería de datos (Power BI, Python, SQL) y objetivo internacional (Suiza). Sin datos reales de empleadores ni clientes en las lecciones.

## Límites honestos

- 63 lecciones ≈ 500 palabras de neerlandés y todos los puntos gramaticales clave A0→B2. Un B2 real necesita del orden de 3000–4000 palabras activas y práctica de las cuatro destrezas: usa también tus tarjetas, lectura real y modelos del **Staatsexamen NT2** (Programa I B1, Programa II B2).
- English B1→C2 sigue la misma lógica; para acreditar: Cambridge B2 First / C1 Advanced / C2 Proficiency o IELTS.
- El audio es la voz TTS del navegador (calidad según el dispositivo); el dictado no puntúa pronunciación.
- Sin tutor IA conversacional todavía: requiere decidir proveedor, coste máximo y privacidad.

## Comprobación

```
npm run check && npm test
npm run dev   # en otra terminal
node tests/e2e/selflearn.mjs
# Con credenciales QA de staging (privadas):
# BASE_URL=http://localhost:4181 node tests/e2e/selflearn-staging.mjs
```

FSRS: [ts-fsrs](https://github.com/open-spaced-repetition/ts-fsrs) (MIT), empaquetado en `fsrs-bundle.js`.
