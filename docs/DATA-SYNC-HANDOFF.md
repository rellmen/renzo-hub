# RISE HUB · traspaso de la sincronización de datos (18/10/2026, Claude)

Formato de `AGENTS.md`. Sin valores personales: están solo en Supabase.

## 1. Verificado (con evidencia)

| Qué | Evidencia |
|---|---|
| Hechos personales en producción: 7 filas `personal_fact`, 54 hechos, todos con fecha, procedencia y verificación válida (el lector los acepta) | SQL: 54/54 "renderable" por sección; 0 etiquetas duplicadas por fila |
| Escritura con el usuario autenticado (RLS activa, `set local role authenticated` + claims del propietario) | Script de sincronización; `auth.uid()` en cada `WHERE` |
| No se tocó nada más | md5 de las 140 filas restantes de `hub_records` idéntico antes/después; claves de `hub_user_state` sin cambios |
| Idempotente | Re-ejecución: 0 filas afectadas en `hub_records`, `user_settings` y `hub_user_state` (staging: hash idéntico tras repetir; producción: condiciones de guarda = 0) |
| Privacidad | Staging (2 usuarios reales): B lee 0 filas de A, actualiza 0, INSERT como A → `42501`; `anon` → `42501`. Producción (usuario ficticio): lee 0, actualiza 0; `anon` → `42501` |
| Sin duplicados en Money | 114 `bank_tx`; el único par con misma fecha, importe y concepto tiene saldos distintos (dos compras reales) |
| Staging limpio tras la prueba | Prueba en transacción con ROLLBACK; después: 0 `personal_fact` en staging |
| Arreglo de SelfLearn al cerrar sesión | E2E falla sin el arreglo y pasa con él |
| Suite completa | `npm run check` OK · `npm test` 285/285 · E2E de CI: todos OK (smoke 15/15; un primer intento dio 14/15 por la recarga del service worker al cambiar la caché, 3 repeticiones posteriores 15/15) |
| Producción publicada | `release.json` 2.36.1 · `deployment-info` production/main/`80739b24` |
| Staging publicado | `deployment-info` preview/staging/`76102226` (2.41.0) |

## 2. Preparado, sin aplicar
- PR de este cambio hacia `staging` (rama `feature/claude-data-sync-selflearn`, release 2.42.0, caché `renzo-hub-cloud-v45-data-sync`):
  - `world.js`: `flush()` sube lo pendiente de SelfLearn.
  - `app.js`: "Cerrar sesión" espera a `world.flush()` (máx. 4 s) antes de `signOut()`.
  - `tests/e2e/selflearn.mjs`: caso nuevo "cerrar sesión 0,1 s después de responder → otro dispositivo".
  - Estos dos documentos.

## 3. Pendiente de Renzo
1. Revisar y fusionar el PR de este cambio hacia `staging`.
2. Probar en staging con tu cuenta: responder una pregunta de SelfLearn, cerrar sesión enseguida, entrar desde el móvil → debe aparecer "Lección en curso · Continuar" en el mismo paso.
3. Cuando quieras publicar: PR `staging` → `main`. Hasta entonces **producción no muestra** los paneles "datos con fecha y procedencia" ni tiene el SelfLearn que guarda el progreso.
4. Después de publicar: `./scripts/renzo-hub verify prod 2.42.0 --smoke` y abrir SelfLearn, Skin, Work y System para ver los paneles.

## 4. Necesita autorización o decisión
- **Fusión a producción** (regla permanente: solo Renzo).
- **Turno de tarde:** sigue "hora de fin sin confirmar". Dime la hora y la paso a confirmado.
- **Skin, variante exacta del retinal celimax:** guardado como "celimax Retinal", asociado al producto del catálogo; la variante no se ha verificado en foto.
- **Pauta de retinal / calendario de Skin:** no hay un calendario de retinal guardado; la app usa la fase "barrera" por defecto (adecuada para piel seca con descamación). No he creado pauta médica.
- **Money:** no se ha conciliado nada porque el encargo no traía importes nuevos confirmados. Para conciliar, indica el importe y la fecha de cada cifra.

## Bloqueos y límites conocidos
- No hay credenciales QA en esta sesión: las pruebas de navegador usan Supabase simulado; las de persistencia real, RLS y duplicados se hicieron en SQL directamente contra staging (con ROLLBACK) y producción.
- Si una pestaña antigua de SelfLearn (anterior a hoy) sigue abierta con cambios sin subir, puede volver a escribir sus preferencias (`learningSettings`) al sincronizar. Recarga la app en tus dispositivos.
- Staging no tiene los datos personales (por regla, los datos de un entorno no se copian al otro): allí los paneles aparecen vacíos.
