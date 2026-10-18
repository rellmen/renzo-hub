# Gym · Ascend tipo Symmetry (trabajo conjunto Claude + ChatGPT)

Petición de Renzo (17 oct 2026): que la microapp de entrenamiento se parezca a **Symmetry: AI Gym Workout Log** y tenga la mejor experiencia posible. Claude y ChatGPT trabajan juntos **en GitHub**.

- **Rama compartida:** `feature/gym-symmetry` (desde `staging`, que ya incluye 2.35.1 editorial). PR hacia `staging`.
- **Issue de coordinación:** ver el issue "Gym tipo Symmetry" enlazado en el PR.
- Reglas de `docs/COLABORACION-IA.md`: `git pull --rebase` antes de cada push, commits con prefijo `[claude]` / `[chatgpt]`, sin `push --force`, sin migraciones ni producción sin "Autorizo" de Renzo. Claude es dueño de `sw.js`, `release.json`, `tests/pwa-cache-unique.test.mjs` y `RENZO-HUB-CURRENT.md`: si añades un módulo nuevo, apúntalo abajo en "Pendiente de integrar".

## Qué es Symmetry (referencia, no copiar UI ni marca)
App de registro de entrenamiento con IA: planes personalizados, **sobrecarga progresiva automática** (sugiere la carga de cada serie), **sistema de rangos por ejercicio y músculo** (Bronce, Plata, Oro…) visualizado en un **mapa corporal**, registro **sin distracciones**, técnica de cada ejercicio, gráficas y fotos de progreso, métricas avanzadas y parte social. Fuentes: App Store (id6474446718) y screensdesign.com/showcase/symmetry-ai-gym-workout-log.

**Lo que NO traemos (decisión de producto):** paywall, ofertas con cuenta atrás, presión emocional en el onboarding, feed social, escaneo corporal por foto con IA (privacidad y fiabilidad). RISE HUB es privada.

## Reparto
| Bloque | Dueño | Estado |
|---|---|---|
| Motor de progresión automática (`microapps/gym/progression.js`): sugerencia de peso y reps por serie con doble progresión y RIR, precarga al iniciar la sesión | Claude | hecho (2.36.0) |
| Rangos por ejercicio y músculo (`microapps/gym/ranks.js`): niveles Hierro → Élite con subniveles I–III, estándares orientativos por patrón de movimiento, mapa corporal coloreado por rango | Claude | hecho (2.36.0) |
| Experiencia de registro: temporizador de descanso automático (vibración y aviso), calculadora de discos, aviso de récord personal al guardar serie, resumen al finalizar, pestañas simplificadas, técnica por ejercicio (`microapps/gym/exercise-info.js`) | Claude | hecho (2.36.0) |
| Fotos de progreso privadas (bucket `progress-photos` ya existe en Supabase, migración 20261011120000) con comparador antes/después | ChatGPT → Claude | hecho (2.37.0) |
| Ampliar biblioteca de ejercicios (≥80) con músculo, patrón, equipamiento y técnica en `exercise-info.js` + estándares en `ranks.js` | ChatGPT → Claude | hecho (2.37.0) |
| Onboarding opcional (equipamiento disponible, días, objetivo) que genere un plan inicial con `validateGymPlan` | ChatGPT → Claude | hecho (2.37.0) |
| Revisión cruzada de lo de Claude (UX móvil, accesibilidad, cálculos) | ChatGPT → Claude | hecho (2.37.0) |
| Revisión cruzada de lo de ChatGPT | Claude | hecho (2.37.0: onboarding corregido) |

## Contratos para no pisarnos
- Datos: `gym_sessions` y `gym_plans` **sin cambios de esquema**. Cada ejercicio de sesión: `{name,min,max,muscle,compound,notes,sets:[{weight,reps,rir,completed,side,notes}]}`.
- `progression.js` exporta `e1rm(weight,reps)`, `bestE1rm(sessions,name)`, `suggestSets(exercise,previousSets)`.
- `ranks.js` exporta `TIERS`, `standardFor(name)`, `rankFor(ratio)`, `exerciseRanks(sessions,bodyWeight)`, `muscleRanks(exerciseRanks)`.
- `exercise-info.js` exporta `exerciseInfo(name)` → `{pattern,equipment,cues:[…],mistake,barbell}`; si un ejercicio no tiene ficha devuelve `null` (la UI lo tolera).

## Estado 2.37.0 (2026-10-18)
Bloque Gym tipo Symmetry completo. Claude terminó la parte de ChatGPT a petición de Renzo (sin actividad desde el 17-10):
- `photos-view.js` (galería y comparador) y `progress-photos.js` ampliado: carpeta `<usuario>/gym/`, fecha y pose en el nombre, reducción a 1600 px sin EXIF, firmas en bloque.
- `onboarding-view.js` en Rutinas; `onboarding.js` corregido (cardio en el 2.º campo, compuestos marcados, títulos en español).
- `exercise-info.js`: 107 fichas con músculo; `GYM_LIBRARY = exerciseLibrary()`; `ranks.js` sin rango para ejercicios con el propio peso.
Todos los módulos están en el precache (`sw.js` v39). No queda nada pendiente de integrar.

## Estado 2.38.0 (2026-10-18) · microapp terminada
Pack final hecho: calentamiento, gráfica de fuerza, superseries, cambio de ejercicio en sesión, pantalla encendida, semana de descarga, balance semanal por músculo y recordatorio de foto (`coach.js`, `wake-lock.js`).
Formato de ejercicio en el plan: `[nombre, series, repsMin, repsMax, músculo, compuesto(1|0), superserieConSiguiente(1)]`; los campos 6.º y 7.º son opcionales.
