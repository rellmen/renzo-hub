# RISE HUB · estado real de la sincronización de datos (18/10/2026)

Comprobado contra Supabase y las URLs publicadas el 18/10/2026 entre las 22:35 y 22:50 (hora de Ámsterdam).
Este archivo **no contiene valores personales**: solo dónde están, cuántos son y cómo se verificaron.
Los valores viven únicamente en Supabase (producción `mgncykyrhavpepfggmng`), protegidos por RLS.

## Resumen

| Módulo | Datos en Supabase (producción) | Se ve en la app publicada (2.36.1) | Se ve en staging (2.41.0) |
|---|---|---|---|
| SelfLearn · formación | ✅ 6 hechos confirmados (`personal_fact` learning) | ❌ falta el código de lectura (PR #87) | ✅ panel "Formación" (código), datos solo en producción |
| SelfLearn · progreso | ✅ 2 lecciones, 4 tarjetas, ajustes (A1 nl / B1 en) | ⚠️ motor antiguo: pierde progreso (ver abajo) | ✅ motor SelfLearn 3 + arreglo de cierre de sesión de este PR |
| Skin Routine | ✅ 21 hechos + inventario (3 productos "Lo tengo") + 4 registros de rutina | ⚠️ inventario sí; hechos no (falta PR #87) | ✅ |
| Perfil profesional | ✅ trabajo 9 hechos, perfil 7, proyectos 2 | ❌ falta PR #87 | ✅ |
| Money | ✅ 114 movimientos, 0 duplicados, 6 referencias históricas | ✅ | ✅ |
| Gym | ✅ 1 sesión, 0 planes, sin cambios | ✅ | ✅ |

**Conclusión:** los datos están guardados y verificados. La app publicada en producción todavía no los muestra porque el código que los lee (y el SelfLearn que guarda el progreso) solo está en `staging`. Falta que Renzo fusione `staging` → `main`.

## Producción publicada (verificado)
- `https://renzo-hub.vercel.app/release.json` → `2.36.1`
- `/api/deployment-info` → `production · main · 80739b24` (merge del PR #83)
- `world.js` publicado: 0 apariciones de `persistLearning` (no tiene SelfLearn 3). `app.js` publicado: 0 apariciones de `confirmedContext`.

## Staging publicado (verificado)
- `/api/deployment-info` → `preview · staging · 76102226` (merge del PR #87). El PR #88 (`321bd57`) aún no está desplegado en staging.

## SelfLearn · por qué no conservaba el progreso
1. **Producción ejecuta el motor anterior a SelfLearn 3.** Los 5 fallos documentados en `docs/SELFLEARN.md` (guardado solo al final, la nube pisaba siempre lo local, etc.) siguen activos en producción. Corregidos en `staging` desde 2.34.0, sin publicar.
2. **Cierre de sesión (nuevo, corregido en este PR, 2.42.0).** SelfLearn agrupa la subida 1,2 s. Al pulsar "Cerrar sesión", `signOut()` llegaba antes que la subida: la última respuesta quedaba solo en el dispositivo y no aparecía en otro. Ahora se sube lo pendiente antes de cerrar la sesión (espera máxima 4 s).
   - Reproducido sin el arreglo: el E2E falla con "la respuesta previa a cerrar sesión no llegó a Supabase".
   - Con el arreglo: pasa (`tests/e2e/selflearn.mjs`, último bloque).
3. Recargar la página y cambiar de dispositivo: cubiertos por el E2E existente (lección a medias recuperada desde Supabase tras borrar la copia local).

## Registros escritos hoy por Claude (producción)
- 5 filas `hub_records` `personal_fact` actualizadas (learning, work, projects, profile, skincare). `syncId = personal-sync-2026-10-18-claude`. Los hechos anteriores quedan en `payload.history` (nada se borra).
- `user_settings.settings.skinInventory`: 3 claves añadidas; lo existente gana.
- `hub_user_state.state.learningSettings`: punto de partida del curso (neerlandés A0 → A1, inglés B1). No marca lecciones como completadas.
- Las otras 140 filas de `hub_records`: huella md5 idéntica antes y después.
- Sin migraciones, sin cambios de políticas ni de roles.

## Lo que no se tocó a propósito
- Money: no había importes nuevos confirmados en el encargo. Las 6 referencias históricas (deudas, alquiler) siguen marcadas como "histórico · vigencia pendiente", separadas de los movimientos del banco.
- Gym: sin datos nuevos; se conserva la sesión existente.
- Nodalys: solo un hecho de referencia ("proyecto independiente"); ningún dato ni código de Nodalys.
- Productos de Skin sin confirmar (Isntree, AXIS-Y Eye, Ondo, Differin): siguen sin confirmar.
