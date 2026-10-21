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
| Gym (Ascend) · versión tipo Symmetry (`docs/GYM-SYMMETRY.md`, rama `feature/gym-symmetry`) | Claude + ChatGPT (reparto en el doc) | ambos |
| Skin, Food | ChatGPT | Claude |
| My Finance, Gastos, Nóminas, Banco, Shift Tracker | Claude | ChatGPT |
| Ares AI, Work/roadmap, PWA/caché, CI y tests E2E transversales | Claude | ChatGPT |
| SelfLearn | Claude (petición de Renzo, 17 oct: SelfLearn 3) | ChatGPT |
| Notes | ChatGPT | Claude |

## Revisión cruzada
- **Claude → ChatGPT (17 oct):**
  - `sw.js` perdió 4 módulos de My Finance al consolidar (`networth*.js`, `goals*.js`): fallaba el test de caché y My Finance no funcionaría sin conexión. Detectado por Claude y **corregido por ChatGPT** en `15fee22`/`842f9c9` (caché `v28-unified-release`). Desde ahora, el dueño de `sw.js` es Claude (regla 3).
  - Gym · objetivos en `auth.user_metadata`: funciona, pero el resto de la app guarda preferencias en `hub_user_state.state` (SelfLearn) o `hub_records` (con RLS) y `user_metadata` viaja en cada token y lo puede editar el propio usuario. Propuesta: moverlo a `hub_user_state` en la próxima tanda. No bloquea.
  - El comentario de `microapps/gym/goals.js` dice "never upload to Supabase implicitly" y `gym.js` sí sincroniza (de forma explícita al guardar): actualizar el comentario.
- **Claude → ChatGPT (17 oct, SelfLearn 3):** rama `feature/selflearn-babbel`. Toca `world.js` (montaje de SelfLearn, fusión local/nube y **sincronización solo de registros cambiados**: afecta a todas las áreas que guardan con `save()` de `world.js`), `index.html` (texto de la tarjeta SelfLearn), `sw.js`, `release.json` y `RENZO-HUB-CURRENT.md`. Se elimina `microapps/selflearn/catalog.js`. Si editas un registro de `world.js` fuera de `save()`, ponle `updatedAt` para que la fusión lo respete.
- **Claude → ChatGPT (17 oct, interfaz editorial 2.35.0):** rama `feature/rise-editorial-ui`. Integra en la app real el rediseño de Lovable (Renzo Sandbox) como capa `assets/rise-editorial.css` + monograma v2 + barra nueva con Ares central. Remapea colores azules en `rise-covers.css`, `rise-home.css`, `ares-chat.css`, `finance.css` y `gastos.css`; cambia `index.html` (nav, hero, iconos), `manifest.webmanifest` y `sw.js`. Para nuevas pantallas: usar `var(--accent)` iris y `var(--card)`, no azules fijos.
- **Claude → ChatGPT (18 oct, 2.40.0):** nueva capa común `assets/rise-microapps-air.css` (más espacio, textos ≥ 12 px, campos de 48 px) que también afecta a la presentación de Gym, Skin, Food y SelfLearn. No toca vuestros archivos; si alguna pantalla vuestra queda peor, se ajusta en esa capa o se excluye con un selector. Ares AI: botón "Salir", barra inferior visible y botón central como interruptor.
- **Claude → ChatGPT (18 oct, 2.42.0):** `app.js` (botón "Cerrar sesión" espera a `world.flush()`) y `world.js` (`flush()`). Datos de `personal_fact` de learning/work/projects/profile/skincare actualizados en producción con `syncId personal-sync-2026-10-18-claude` y los valores previos en `payload.history`: si vuelves a sincronizar, conserva `history` y no reescribas esas filas sin contrastarlas. Detalle en `docs/DATA-SYNC-STATUS.md`.
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

## ChatGPT · 18 oct · sincronización personal autorizada

Rama `feature/authorized-personal-sync`, desde staging vigente. Ares y app.js incorporan una lectura local de `personal_fact`, paneles privados en las áreas existentes y soporte de meta de inglés en perfil. No se modifica el motor de SelfLearn ni su estado. Los datos de producción se guardan en Supabase y las copias de seguridad quedan fuera del repositorio. No se copian datos de producción a staging. Se actualizan release/caché en esta rama para que el PR sea autocontenido; no se fusiona ni se despliega a main.

## Claude · 19 oct · Body y Gym con el diseño de Lovable (PR #95)

- **Body** (sin dueño asignado): nuevo `microapps/body/overview.js` + `microapps/body/body.css`; `world.js` → `bodyView` solo cambia presentación (mismo `data-form="body"` y mismos campos).
- **Gym** (zona de ChatGPT): **solo CSS** en `assets/gym-lovable.css`, cargado después de `gym-ascend.css` y `rise-microapps-air.css`. No se tocó `gym.js` ni `microapps/gym/*`. Si cambias el marcado de `.gymtabs`, `.setrow`, `.gym-quick-actions` o `.gym-rest`, revisa esa hoja y pasa `tests/e2e/gym-lovable.mjs`.

## Claude · 19 oct · Cambios en Gym (zona de ChatGPT) con permiso de Renzo · 2.46.0

Renzo autorizó a Claude a cambiar Gym sin esperar a ChatGPT ("te doy permiso… solo deja constancia"). Para que ChatGPT se actualice:

- `gym.js`
  - Nuevo import de `./microapps/gym/visuals.js`.
  - Cabecera: el `<select data-more>` ya **no existe**. Ahora es `${moreButtonHtml(view)}` → `<button data-more-open>`. Al pulsarlo se crea `.gym-sheet-host` en `<body>` con `moreSheetHtml(view)`; cada fila es `[data-more-go="<id>"]` y llama a `switchView(id)`.
  - `view==='trends'`: se eliminan las barras `.gym-trend-bar`; se pinta `strengthChartSvg(t.recent)`. Debajo, "Mejores marcas" con `recordsHtml(stats(rows).best)`.
  - `view==='progress'`: "Progresión semanal" = `weeklyBarsHtml(weekBuckets(weekly(),local(),8),goals.sessionsPerWeek)`; las tarjetas por semana de antes siguen dentro de `<details class="gym-week-detail">`. "Mejores marcas" usa `recordsHtml(st.best)`.
- `microapps/gym/visuals.js`: `MORE_SECTIONS` (lista de secciones de "Más": si añades una sección, añádela aquí), gráficas y récords. Funciones puras con tests en `tests/gym-visuals.test.mjs`.
- `assets/gym-lovable.css`: estilos de hoja, línea, barras y récords.
- Tests: `tests/e2e/gym-symmetry.mjs` abre Fotos con `[data-more-open]` → `[data-more-go="photos"]`.

## Claude · 19 oct · Food y Skin (zona de ChatGPT) con permiso de Renzo · 2.47.0

- **Food**
  - `index.html` → `#food`: nuevo `<div id="foodToday">` arriba. `#p1Food` sube por encima del plan diario.
  - `phase1.js` → `renderFood`: el `<select name="meal">` pasa a radios `name="meal"` dentro de `fieldset.food-meals`; el `FormData` y el guardado no cambian.
  - Las comidas de hoy se agrupan por comida (`.food-group`). Al final de cada render se emite `document.dispatchEvent(new CustomEvent("rise:food-changed",{detail:{date,kcal,protein,meals}}))`.
  - `microapps/food/today.js` escucha ese evento y lee `user_settings.settings.bodyProfile` (kcalMin/Max, proteinMin/Max) para pintar "Hoy". También añade casillas a `.food-list` (en `localStorage`, por mes).
  - Estilos en `microapps/food/food.css`.
- **Skin**
  - `index.html` → `#skin`: nuevo `.skin-seg` con `[data-skin-mode="am|pm"]`. `#pill` y `#switchBtn` siguen existiendo dentro de `.skin-legacy-switch`, oculto con CSS.
  - `microapps/skin/skin.js` → `render()`: marca `aria-pressed` del segmentado y, si están todos los pasos, añade `.skin-finished`. En la inicialización, los botones `[data-skin-mode]` cambian `mode` y llaman a `render()`. No cambia el guardado.
  - Estilos en `microapps/skin/skin.css`.
- **Tests**: `tests/e2e/authenticated.mjs` usa `[data-skin-mode="am|pm"]` en vez de `#switchBtn`; nuevos `tests/food-today.test.mjs` y `tests/e2e/food-skin.mjs`.

## Claude · 19 oct · Gym · Entrenar con un ejercicio a la vez (con permiso de Renzo) · 2.48.0

- `gym.js`: nuevo import de `./microapps/gym/player.js`. Al final del pintado de la sesión (tras `form.onsubmit`) se llama a `enhanceSession(content,{active,previous,startRest,saveDraft,rankOf,info})`. **No cambia** la plantilla del formulario, sus `name`, ni `save()`.
- `player.js` mueve nodos ya pintados: añade `.gp-bar`, `.gp-strip`, `.gp-hero` por ejercicio y `.gp-nav`. Mete el botón `[data-quick-done]` dentro de la fila como `.gp-tick` y agrupa repetir, lado y nota en `.gp-set-extra`. Oculta la casilla `c-i-j` (sigue en el formulario). El estado (ejercicio activo, vista) se guarda en memoria por id de sesión.
- Si cambias la plantilla de sesión (orden `.setrow` → `.gym-quick-actions` → lado → nota), revisa `player.js` y pasa `tests/e2e/gym-lovable.mjs`. Para pruebas que recorren todos los ejercicios, pulsa antes `[data-gp-list]` (vista completa).

## Claude · 19 oct · Validación y arreglo del PR #94 (SelfLearn Language Academy) · 2.49.0

Renzo pidió a Claude validar, arreglar y publicar el #94 (rama de ChatGPT). Cambios de Claude en la rama:
- Merge de `staging` (Body/Gym/Food/Skin 2.44–2.48) con conflictos resueltos en `sw.js` y `tests/pwa-cache-unique.test.mjs`. Se mantiene el test genérico de ChatGPT; `CORE` = lista de staging + los 11 módulos nuevos de `microapps/selflearn/`.
- `supabase/migrations/20261019030000_selflearn_tutor_quota.sql` → `supabase/pending/` + `.rollback.sql`, porque no está aplicada (por eso fallaba `tests/backup.test.mjs`). `tests/selflearn-ai-quota.test.mjs` apunta a `pending/`.
- Para activar el tutor IA hace falta, en este orden: aplicar la migración en staging con OK de Renzo, poner las variables solo en preview y probar. En producción sigue apagado por código (`VERCEL_ENV==="preview"`).
- Versión 2.49.0 y `RENZO-HUB-CURRENT.md`.

## ChatGPT · 21 oct · Nocturne Ascendancy (desarrollo aislado UI)

Rama `feature/nocturne-ascendancy-ui` desde `staging`. ChatGPT creó `assets/nocturne-ascendancy.css` (paleta obsidiana/borgoña/violeta/platino/oro, shell, navegación, portada, tarjetas y estilos internos de Ares/Finance/Gym/SelfLearn/Skin/Food/Body), conectó la hoja en `index.html` y preparó tests + contrato visual. **Solo presentación, sin tocar lógica o Supabase.** Para no pisar al dueño de integración, no cambió `sw.js`, `release.json`, ni `RENZO-HUB-CURRENT.md`; antes de merge deben añadirse el nuevo CSS a la caché offline, renovarse la versión y pasar QA visual 320–1440 px y en iPhone. PR draft hacia `staging`; no despliegue a producción. Ver `docs/NOCTURNE-ASCENDANCY-IMPLEMENTATION.md`.


### Actualización de la misma rama — cierre técnico de integración (21 oct)

Por petición expresa de Renzo de continuar directamente sin Work, ChatGPT completó **en la misma rama Nocturne** los pasos que figuraban pendientes en el párrafo anterior: `sw.js` incluye el CSS nuevo y la caché v58, `release.json` y `RENZO-HUB-CURRENT.md` reflejan 2.54.0 (solo propuesta), `manifest.webmanifest` utiliza obsidiana y se añadió auditoría de clipping en Chromium/WebKit. También se extendió el estilo al **chat modal** de Ares, Notas, Noticias y Más. Se respetó que la rama es independiente, no se fusionó con otros trabajos ni se tocó Supabase.

**Pendientes reales:** resultado CI del SHA más reciente, QA visual con capturas, verificación de la PWA instalada en iPhone, pruebas de persistencia autenticada en staging y autorización de Renzo. PR #125 queda en borrador, con destino `staging`; no publicar en `main`. El checklist actualizado es `docs/NOCTURNE-ASCENDANCY.md`.
