# RISE HUB · trabajo conjunto Claude + ChatGPT

Decisión de Renzo (17 oct 2026): Claude y ChatGPT trabajan **juntos en una sola actualización**, no en ramas separadas.
Este archivo es el canal de coordinación: cada IA lo lee antes de empezar y lo actualiza al terminar una tarea.

## Rama y PR únicos
- Rama compartida: **`release/gym-ascend-bundle`** · PR **#75**. Todo el trabajo nuevo va aquí.
- PR #74 (`feature/fase2-bc-finance-completa`) queda **sustituido**: ChatGPT ya incorporó su contenido; no se fusiona.
- PR #62 (Skin) queda **sustituido** por el commit `2f66168` de esta rama.
- Publicación (límite Vercel Hobby, `docs/RELEASE_POLICY.md`): una compilación de staging y, tras validarla, una de producción. Antes de fusionar, el PR se redirige a `staging`; después, `staging` → `main`.

## Reglas para no pisarnos
1. `git pull --rebase` (o fetch + merge) **antes** de cada push. Nunca `push --force`, nunca reescribir commits del otro.
2. Commits pequeños y con prefijo de autor en el mensaje: `[claude]` o `[chatgpt]`.
3. Archivos de integración, **un solo dueño** para evitar conflictos:
   - `sw.js` (lista de precache y nombre de caché), `release.json`, `tests/pwa-cache-unique.test.mjs`, `RENZO-HUB-CURRENT.md`: **Claude** los actualiza al final de cada tanda. ChatGPT, si añade un módulo nuevo, lo apunta en "Pendiente de integrar" abajo en vez de tocar `sw.js`.
   - El test `todos los módulos de microapps/ están en la caché sin conexión` debe pasar siempre.
4. Si una IA cambia un archivo del área de la otra, lo dice aquí y en el mensaje del commit.
5. No copiar archivos a mano de otra rama: integrar con `git merge`, para conservar autoría e historial.
6. Sin migraciones de base de datos ni cambios de producción sin "Autorizo" de Renzo. Sin borrar datos.

## Reparto por microapp
| Área | Dueño principal | Revisa |
|---|---|---|
| Gym (Ascend), Skin, Food | ChatGPT | Claude |
| My Finance, Gastos, Nóminas, Banco, Shift Tracker | Claude | ChatGPT |
| Ares AI, Work/roadmap, PWA/caché, CI y tests E2E transversales | Claude | ChatGPT |
| SelfLearn, Notes | ChatGPT | Claude |

## Revisión cruzada
- **Claude → ChatGPT (17 oct):**
  - `sw.js` perdió 4 módulos de My Finance al consolidar (`networth*.js`, `goals*.js`): fallaba el test de caché y My Finance no funcionaría sin conexión. Detectado por Claude y **corregido por ChatGPT** en `15fee22`/`842f9c9` (caché `v28-unified-release`). Desde ahora, el dueño de `sw.js` es Claude (regla 3).
  - Gym · objetivos en `auth.user_metadata`: funciona, pero el resto de la app guarda preferencias en `hub_user_state.state` (SelfLearn) o `hub_records` (con RLS) y `user_metadata` viaja en cada token y lo puede editar el propio usuario. Propuesta: moverlo a `hub_user_state` en la próxima tanda. No bloquea.
  - El comentario de `microapps/gym/goals.js` dice "never upload to Supabase implicitly" y `gym.js` sí sincroniza (de forma explícita al guardar): actualizar el comentario.
- **ChatGPT → Claude:** (pendiente)

## Pendiente de integrar (módulos nuevos para `sw.js`)
- (vacío)

## Tablero de la actualización conjunta
| # | Tarea | Dueño | Estado |
|---|---|---|---|
| 1 | Restaurar módulos de finanzas en la caché sin conexión | ChatGPT (detectó Claude) | hecho |
| 2 | Auditoría E2E de todas las microapps a 390 px (errores, scroll horizontal, tamaño táctil): `tests/e2e/microapps-mobile-audit.mjs`, en CI | Claude | hecho · 16 secciones OK en Chromium y WebKit |
| 3 | Corregir lo que la auditoría encuentre en Finanzas/Nóminas/Ares/Work | Claude | sin hallazgos |
| 4 | Corregir lo que la auditoría encuentre en Gym/Skin/SelfLearn/Notes | ChatGPT | sin hallazgos · si añades pantallas, la auditoría las cubre sola (lee `SECTION_IDS`) |
| 5 | Gym: objetivos a `hub_user_state` | ChatGPT | propuesto |
| 6 | Redirigir PR #75 a `staging` antes de la compilación controlada | Renzo | pendiente |
