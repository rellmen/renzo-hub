# RISE HUB React · informe técnico de avance (22 octubre 2026)

## Hechos verificados

- PR **#128** (fundación React Lovable) está fusionado en la rama `staging`; commit de merge `6d927871fe9efe90e9c9da13cef60af9560fe52e`.
- **No significa React desplegado**: la raíz sigue cargando `index.html` y `app.js`; `vercel.json` no construye React y `.vercelignore` excluye `apps/`.
- Diseño original aprobado en Lovable: proyecto `ca43e152-f7c7-4c8e-b925-01476b9053da`, commit `c68f0b618b59c16930bf1f6ad0e1b44e0bf81deb`.
- Hay siete JPEG originales en Lovable no copiados como bytes verificables al repositorio. Su API `read_file` los expone con caracteres UTF-8 de sustitución; no se puede reconstruir el binario. La invocación al agente Lovable para exportarlos se bloqueó por falta de créditos.
- Historias `main` y `staging` están divergentes. Ningún PR React debe llegar a `main` hasta reconciliarse.

## Trabajo nuevo en PR #129 · rama `feature/react-nocturne-real-projects`

La UI React aprobada **permanece**: fotos y sistema visual Cormorant/Manrope, shell y componentes Lovable originales. Las siguientes pantallas han perdido las cifras simuladas y usan datos reales **sin consultar la base de producción desde CI**:

1. **Proyectos**: `work-records.mjs` + `src/routes/proyectos.tsx`. Proyectos y tareas de `hub_records` del usuario mediante RLS. Alta y cambio de estado conservando semántica `Today, This Week, Blocked, Waiting, Backlog, Completed`; optimistic concurrency por `updated_at`; no pérdida intencionada de campos adicionales del payload.
2. **Ares**: `ares-records.mjs` + `src/routes/ares.tsx`. Consultas determinísticas privadas sobre proyectos, tareas, revisiones y eventos. Sin respuestas guionizadas, aprobaciones falsas, ejecución de agentes o modelo externo. Las aprobaciones quedan en **solo lectura** hasta integrar los contratos originales de seguridad.
3. **Home**: `src/routes/index.tsx` reemplaza los KPI inventados, XP de demo, gráficos y timeline ficticios por contadores reales de Ares/Work y estados vacíos, conservando el héroe eclipse, módulos premium y temporizador.
4. **SelfLearn (solo lectura inicial)**: `selflearn-snapshot.mjs` consulta `hub_user_state` y `hub_records` con filtro de propietario y paginación, conserva los IDs de unidades completadas, runs activos y vencimientos FSRS. Home muestra unidades NL/EN confirmadas. **No reemplaza aún al motor de lecciones ni a sus escrituras.** Tests `react-selflearn-snapshot.test.mjs`.
5. **Cuenta**: `AppShell.tsx` muestra usuario real, menú de cuenta y cierre de sesión; notificaciones desactivadas hasta que haya servicio.
6. **Tarjetas**: `PhotoModuleCard.tsx` ya no presenta porcentajes inventados; la barra solo se muestra cuando existe progreso verificado.

## Protecciones, pruebas y release

- Tests de contratos reales: `tests/react-work-records.test.mjs`, `tests/react-ares-records.test.mjs`, `tests/react-selflearn-snapshot.test.mjs`, `tests/react-nocturne-syntax.test.mjs`.
- Informador de bloqueo: `node tools/react-cutover-audit.mjs`; `--strict` falla si faltan condiciones.
- Workflow independiente `.github/workflows/react-nocturne.yml`: instalación de dependencias y `tsc --noEmit` sobre React, SIN desplegar ni servir datos privados.
- Auditoría E2E clásica en CI no prueba aún persistencia de React. Las pruebas de dominios en Node usan clientes simulados; no equivalen a datos reales autenticados de Supabase.

## Pendientes imprescindibles antes de producción

- [ ] Exportar los siete JPG **originales** byte a byte, idealmente con *GitHub Sync* del proyecto Lovable a una rama aislada, sin sobrescribir el repositorio RISE HUB.
- [ ] Build React completo y CI React verde, con capturas reales de todas las rutas.
- [ ] Migrar SelfLearn (FSRS/sync/XP/tutor/audio), Gym (plan/sesiones/fotos), Money/Nóminas, Skin/Food/Body, System/Notes/Car y Ares con aprobaciones, manteniendo controles existentes.
- [ ] Eliminar datos demostrativos de todas las pantallas autenticadas, incluida su configuración de ajustes.
- [ ] Pruebas reales con cuentas independientes en **Supabase staging**: autenticación, RLS, guardado, restauración, conflictos de edición, cambio de cuenta y respaldo.
- [ ] Vercel preview React aislada, iPhone PWA WebKit/safe areas/actualización SW y reconciliación `main`↔`staging`.
- [ ] Una vez todo verificado, aprobar y fusionar por el flujo `feature → staging → main` con rollback listo.

**Estado real:** implementación React parcial, no publicada. Está prohibido cortar a producción antes de resolver los gates. El prototipo Lovable no es una fuente de datos del usuario.


## Actualización de integración Skin e imágenes originales

- **Skin React** ahora lee la rutina **original** (19 productos de `microapps/skin/skin.js`), conservando los índices de cada sesión AM/PM, incluyendo la noche de retinal programada originalmente el **viernes** y la fase de reparación de barrera. El componente permite marcar pasos, guardar observaciones personales y consultar el progreso real de siete días usando `skin_routine_logs`, `skin_notes` y `user_settings`, con RLS. El inventario se presenta en **solo lectura** para evitar conflictos con ajustes compartidos; las fotografías privadas siguen pendientes.
- Contratos `apps/rise-react/src/lib/skin-catalog.mjs`, `skin-records.mjs`, `.d.mts` y pruebas `tests/react-skin-real.test.mjs`; la compilación de tipos React incluye `piel.tsx`.
- Herramienta **`tools/import-lovable-assets.mjs`** lista para importar los siete JPG byte a byte desde un ZIP/exportación del proyecto Lovable. Se verifican archivos y hashes SHA-256, y la importación se detiene sin escribir si falta cualquiera. Las imágenes originales aún **NO** han sido entregadas a este repositorio: el conector Lovable retorna los archivos binarios como texto potencialmente corrupto, su agente carece de créditos y el ordenador autorizado aparece desconectado.
- Guía oficial para descargar el original: https://docs.lovable.dev/integrations/github (Project settings → Git → Download codebase; o Code editor → Download codebase en planes elegibles).
- El documento `apps/rise-react/README.md` contiene instrucciones exactas para ejecutar el importador tras obtener el ZIP. **No publicar React mientras falten assets y QA autenticado.**
