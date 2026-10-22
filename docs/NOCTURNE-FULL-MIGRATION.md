# RISE HUB Nocturne — migración integral, única PR

**Estado de este documento:** trabajo en curso, no release; PR #149 (`feature/nocturne-single-pr-complete-migration-20261022` → `staging`). 22-10-2026.

## Objetivo y restricciones

Llevar todas las capacidades clásicas a React/TanStack Start conservando **Supabase producción** como fuente de verdad y una forma de volver al frontend antiguo. Trabajar en **una sola PR**, con commits pequeños, pruebas y gates por fase. La PR continúa **draft** hasta una validación real de datos, auth, PWA y paridad; una compilación verde no autoriza cambiar el dominio. No copiar datos de usuario a Supabase staging. Nunca fusionar a `main` por accidente: esa rama construye el frontend clásico desde la raíz. El dominio público `renzo-hub.vercel.app` apunta hoy al proyecto React Nocturne; su historial de despliegues y aliases se debe revisar antes de toda promoción.

**Privacidad:** se excluyen importaciones automáticas de conversaciones íntimas, vida sentimental, perfiles psicológicos, historial médico sensible, credenciales, documentos de identidad y datos personales de terceros. Datos financieros se sincronizan solo desde orígenes autorizados; las propuestas de memoria de ChatGPT siempre requieren revisión y atribución antes de escribirse. No mezclar Nodalys (negocio) y RISE HUB (personal).

## Fase 1 — Inventario, copias y reconciliación (implementado parcialmente en esta PR)

- [x] `/migracion` comprueba con sesión Supabase que las 21 tablas de usuario son accesibles. Errores de RLS no se muestran como 0.
- [x] Exportación JSON explícita, compatible con el formato `renzo-hub-export` de la app clásica. Incluye las **21 tablas**: `profiles`, `user_settings`, `system_preferences`, `system_records`, `hub_user_state`, `hub_records`, `skin_notes`, `skin_routine_logs`, `gym_plans`, `gym_sessions`, `news_briefs`, `payroll_employers`, `payroll_documents`, `payroll_payslips`, `payroll_payslip_versions`, `payroll_line_items`, `payroll_validations`, `payroll_anomalies`, `payroll_corrections`, `payroll_events`, `payroll_balance_imports`. A diferencia del backup clásico, incluye explícitamente `payroll_balance_imports`.
- [x] Exportación de archivos de 4 buckets privados (payroll, hub-private, portfolio-files, progress-photos), con hard limit de 60 MB, sin generar copias silenciosamente parciales. El JSON con PDF/fotos/bancos **jamás** se envía a GitHub ni al chat.
- [x] Detector del estado local clásico `renzo-world-v2:<uid>` y `renzo-world-preview-v1:<uid>` en el mismo origen, que no imprime contenidos privados.
- [x] Comparador local de una copia histórica por usuario y recuentos; advierte de que la igualdad de recuentos **no** certifica identidad de filas.
- [x] Paginación con orden estable en lecturas de nóminas y backup.
- [x] Reparado el inventario/exportación con columnas contrastadas contra el esquema **actual** de Supabase producción: `payroll_balance_imports.owner_id` (no `user_id`) y ordenación por `gym_plans.user_id` (la tabla no tiene `id`). Pruebas de regresión específicas.
- [x] Comparación opcional de contenido por fila en el mismo navegador: identidad de propietario comprobada, clave estable por tabla, serialización JSON canónica y huellas SHA-256 para contar identificadores faltantes, nuevos o modificados. No imprime datos sensibles ni los envía a servicios externos. La comparación antigua por recuentos ahora falla cerrada si el inventario es incompleto.
- [x] Service Worker React limitado a `/assets/` con tipos admitidos y limpieza de cachés clásicas al activar; sin borrar `localStorage` o IndexedDB.
- [ ] Test **real autenticado**, descarga e inspección offline de una copia completa; restauración ensayada sin sobrescribir producción.
- [ ] Migración consentida de cambios locales de origen antiguo: `localStorage` es aislado por **dominio**; `rise-hub-classic-…` no puede leer el anterior `renzo-hub.vercel.app` automáticamente. Recuperación mediante backup antiguo o procedimiento de navegador verificado, sin copiar sesiones o tokens.
- [ ] Verificar con una **sesión real autorizada** los hashes de filas antes/después; confirmar que la comparación de contenido coincide con la copia histórica y que no hay filas ajenas. El código está implementado, **no** la validación real.
- [ ] Comparar también hash y ruta de cada archivo privado de Storage antes/después; la comparación SHA-256 actual cubre solo las 21 tablas, no los archivos.
- [ ] Resolver conflictos con CAS, auditoría y aprobación explícita, nunca importación ciega.

## Fase 2 — Paridad funcional de módulos clásicos (implementado parcialmente)

| Área | Lo conectado a React | Paridad aún necesaria |
|---|---|---|
| Home | Métricas/actividad de Supabase | Configuración de tarjetas, indicadores transversales, contexto real y centralización |
| Ares | Lectura privada y endpoint AI operativo | Flujo de aprobación, acciones persistentes, trazas, políticas por herramienta, historial |
| SelfLearn | Cursos NL/EN, checkpoints, XP/FSRS backend producción | Prueba JWT/2 dispositivos, tutor, diagnosis, lecciones completas, gramática, voz, compatibilidad offline |
| My Finance | Resumen read-only de datos bancarios reales | Ingresos y gastos editables, presupuestos, patrimonio, reglas y reconciliación bancaria |
| Gastos | Visible vía catálogo clásico | Importación CSV ING/Revolut, categorías, reglas por comercio, detección de duplicados |
| Nóminas | `/nominas`: historial read-only, validaciones/anomalías y descarga de documentos privados | Modificar anomalías, reextracción, conciliación detallada, importación de PDF |
| Shift Tracker | `/turnos`: fechas/plantillas editables, sin sobrescribir todo el estado; CAS por `updated_at` | Cálculo contractual de bandas, vacaciones, descansos, previsión y matching nóminas |
| Gym | Historial, sesión básica React | Biblioteca, plan Recomp, series avanzadas, descansos, fotos, medidas, progressive overload, edición multi-device |
| Skin | Rutinas/notas | Catálogo y fotos, calendario, exclusiones de ingredientes y reposición |
| Body/Food | Registro básico de peso y comida | Historial extendido, menús, macros, compra, edición y objetivos |
| Proyectos/Notes | Tareas, proyectos, notas | Kanban, sprints, Idea Vault, carpetas, buscador, adjuntos |
| Quest | `/quest`: XP histórico del registro sin duplicados ni XP sintético | Misiones definidas, logros, habilidades, niveles, idempotencia cross-app |
| Agent Monitor | `/agentes`: lectura de ejecuciones/aprobaciones disponibles | Estado actual desde GitHub/n8n, tiempos, errores, costes; nunca inventar agente running |
| News | `/news`: briefs reales y fuente con URL segura | Creación, canales, filtros, suscripciones y notificaciones |
| Car | Enlace al clásico | Importación de gastos/historial, mantenimiento y recordatorios |
| Career/Data Lab | Enlace al clásico Work | Cursos técnicos, skills gap, portfolio, laboratorios y roadmap profesional |
| AI Inbox | Enlace al clásico Ares | Propuestas, revisión, autorizaciones, ejecución y logs |
| System | `/ajustes` y `/migracion` | Backups cifrados opcionales, import/restore real, permisos y recuperación PWA |

- [x] `/apps`: catálogo navegable por áreas y búsqueda; las funciones aún no portadas tienen enlaces explícitos a la versión clásica.
- [ ] Todas las capacidades de la tabla deben migrarse realmente antes de declarar paridad completa. Un enlace externo o dashboard de solo lectura **no equivale** a migración terminada.

## Fase 3 — Orquestación y datos contextuales

- [ ] Ares Orchestrator con identidad, herramientas con allowlist, aprobaciones antes de escribir, límites y logs.
- [ ] Integración n8n verificada: idempotencia, firmas, backoff, DLQ, monitor y costes; cero secretos en browser.
- [ ] Contexto autorizado por área: perfil, trabajo, formación, gym, Skin, proyectos, finanzas; sin envío automático de información sensible a LLM.
- [ ] Sincronizar datos confirmados del usuario con `user_settings.settings.personalContext` / `hub_records.personal_fact` sin replicar ni sobrescribir lo histórico. Preservar NL B2, EN C1; SQL/Power BI **fuera** de SelfLearn.
- [ ] Definir XP/Quest cross-app con fuentes verificadas; no usar diferentes módulos para otorgar dos veces el mismo premio.
- [ ] Actualizar `/apps` y command palette después de cada migración efectiva.

## Fase 4 — Aceptación y seguridad

- [ ] Ejecutar unit tests, TypeScript, build y prueba browser React en CI.
- [ ] RLS row by owner + Storage buckets privados, sin roles privilegiados en cliente; tests owner ajeno y `anon`.
- [ ] E2E autenticado real, sin cuentas ni datos personales copiados a staging. Si no hay identidad QA, registrar gate bloqueado, **no inventar el resultado**.
- [ ] Pruebas CRUD antes/después de migración, pagos salariales sin distorsión, validaciones por nómina, XP/FSRS idempotente.
- [ ] Dos dispositivos concurrentes, refresh/revisión RLS, sincronización de notas, turnos, planes, archivos y locales.
- [ ] iPhone real (PWA, audio, almacenamiento/caché, logout, deep links) y WebKit/Chromium en CI.
- [ ] Comprobar transiciones de worker `renzo-hub-*` a `rise-nocturne-static-*` y ausencia de caché privada, sin borrar datos locales no exportados.
- [ ] Desplegar solo tras pasar puertas de cierre del módulo y test de migración integral.

## Fase 5 — Despliegue y reversión

1. Mantener esta PR única **draft**, sin merge ni despliegue automático de producción hasta que los gates pendientes estén resueltos.
2. Verificar staging y candidata aislada `READY`, backend correspondiente, JWT/RLS, operaciones y PWA.
3. Verificar el alias clásico independiente `https://rise-hub-classic-renzojesus99-1996.vercel.app/` y el despliegue `dpl_5Rh9Ram6QBVr8LFVXDx6eyXEueLr` **antes** de cualquier nuevo cutover.
4. Guardar IDs/SHA de las versiones de los dos proyectos y snapshot privado restaurable de la base, sin introducir ficheros de usuario en repositorio.
5. Promover al dominio `renzo-hub.vercel.app` solo si se supera paridad autenticada y smoke/rollback. Confirmar retorno 200 de rutas/APIs y Supabase producción; monitorizar.
6. Ante fallos bloquear nuevas escrituras de las áreas afectadas y restaurar frontend por alias al despliegue válido. **Rollback frontend no revierte datos escritos**: migraciones SQL aditivas y reversión separada y revisada.

## Evidencia real y reglas de cierre

Las comprobaciones del 22-10-2026 mostraron en el proyecto Supabase producción 21 tablas privadas y 4 buckets; también se encontraron 211 `hub_records`, 27 `payroll_documents`, 22 checkpoints de idiomas y 114 `bank_tx`. Son recuentos de **base entera**, no conciliación completa de una cuenta, y podrían cambiar tras nuevos guardados. Las tablas de nóminas y el Storage mantienen documentos privados que hay que preservar. Los siguientes commits implementan adaptadores sin copiar ni tocar datos reales de Supabase. Todo el trabajo de esta PR se debe probar con sesión autorizada antes de desplegarlo.

**Cierre final = paridad funcional, igualdad de los registros/hashes originales y archivos, ausencia de conflictos, pruebas de autenticación+iPhone y rollback confirmado.** No utilizar porcentajes estimados ni cerrar gates sin evidencia reproducible.
