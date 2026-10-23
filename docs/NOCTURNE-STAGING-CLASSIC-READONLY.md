# RISE HUB · Nocturne staging único / Classic solo consulta

Decisión explícita de Renzo, 23 octubre 2026: «Haz staging con nocturne y el classic de respaldo no quiero que trabajes en el solo saques información de ahí. Empieza el proceso y deja constancia para cuando trabaje Claude.»

## Regla vigente para Claude y Work

Todo desarrollo funcional nuevo se hace en **Nocturne**, conservando su interfaz aprobada por Renzo en iPhone. Classic se consulta como especificación de datos, reglas y comportamiento; permanece como respaldo de acceso. No modificar, rediseñar ni desplegar nuevas funcionalidades Classic. No cambiar su release/caché para registrar esta decisión.

| Función | Destino |
| --- | --- |
| Único staging de desarrollo | Vercel `renzo-hub-2-1-staging`, ID `prj_kt9EGP7NvU1SghR5wJrbXMptDJMl`, raíz `apps/rise-react` |
| URL canónica staging | https://renzo-hub-2-1-staging.vercel.app |
| URL QA compatible | https://rise-hub-nocturne-qa.vercel.app · mismo deployment del staging, no otro entorno |
| Base de pruebas | Supabase `zpueziugbezqxompwsol`; no contiene una copia de datos personales de producción |
| Integración Git actual | `feature/nocturne-integral-migration`, PR #150 hacia `staging`; no fusionada por esta operación |
| Classic de respaldo | https://rise-hub-classic-renzojesus99-1996.vercel.app · solo lectura y referencia |
| Dominio público existente | https://renzo-hub.vercel.app · intacto; sirve deployment `dpl_J2eYcpZGUjaawQfwpYhA637QXKwm` del proyecto antiguo QA |

## Operaciones realizadas y evidencia

- [x] Configurado el proyecto staging para TanStack Start, Node 24, raíz `apps/rise-react`, fuentes fuera de raíz permitidas, `npm run build`; sin copiar claves de otro proyecto.
- [x] Nueva preview staging `dpl_5GFFAqEeTRQF1DL5sW5qayeMtkcv` READY desde SHA `6a8d854226afdeb26da4f0e94aa558251eccec86`.
- [x] URL versionada: https://renzo-hub-2-1-staging-1qeemepca-renzojesus99-1996.vercel.app.
- [x] HTTP: `/api/deployment-info` 200 con proyecto staging, entorno preview y SHA exacto; `/api/supabase-config` 200 con URL de Supabase staging; `/release.json`, `/dinero` y `/nominas` 200.
- [x] Alias staging y QA asignados al mismo deployment Nocturne. Destinos anteriores conservados: alias staging → `dpl_FYjzMV3thUnqDW35Fhw5W2rm7XBs`; alias QA → `dpl_9GZ7YTT3uQKgVpwAgcB89wt7VaPC`. Ningún deployment eliminado.
- [x] Deshabilitadas previews automáticas en `rise-hub` y antiguo `rise-hub-nocturne-qa` para evitar líneas paralelas de pruebas; cambios de no producción, sin pausar los sitios existentes ni alterar protección.
- [x] Instrucciones visibles para cualquier agente en `AGENTS.md`, `CLAUDE.md`, `docs/COLABORACION-IA.md` y `RENZO-HUB-CURRENT.md`.

## Por qué siguen existiendo proyectos antiguos

La consolidación es de **desarrollo y staging**, no un borrado de infraestructura. El proyecto antiguo llamado QA también aloja el dominio público actual; borrarlo o congelar indiscriminadamente sus despliegues de producción podría romper la app habitual. Se conserva para alojamiento/compatibilidad, sin previews nuevas. `rise-hub` mantiene Classic de respaldo, sin nuevas previews. No renombrar ni eliminar ninguno sin una operación de producción expresamente aprobada y reversible.

## Cómo debe continuar Claude

1. Leer este documento y `AGENTS.md`; contrastar HEAD remoto y PR #150 antes de editar.
2. Desarrollar solo en `apps/rise-react/` y pruebas/servidor/migraciones de Nocturne. Consultar Classic sin editarlo. Si se requiere lógica suya, portarla o adaptarla en Nocturne.
3. Usar únicamente el proyecto staging canónico para previews nuevas. No restaurar previews del antiguo QA ni crear otro staging por comodidad.
4. PR #150 sigue hacia `staging`; resolver los gates CI antes del merge. El SHA desplegado en staging no significa que la rama Git staging ya contenga la migración.
5. Tras cualquier integración aprobada a la rama `staging`, generar preview explícita desde su SHA, comprobar entorno/BD/rutas y actualizar el alias canónico. No promover target production ni usar variables de producción.
6. Mantener pendientes reales del informe `WORK-NOCTURNE-QA-2026-10-23.md`: Payroll backend, revisión concurrente HTTP, segunda identidad, privacidad Storage, XP/FSRS y recuperación integral. No reaplicar CAS ya instalada en staging.
7. La validación de interfaz en iPhone comunicada por Renzo se registra como aceptación visual/uso observado, no como prueba completa de PWA/offline ni aprobación de producción.

## Estado de integración y rollback

El CI general `39963036358` del SHA inicial terminó **cancelled**; React `39963036484` terminó **success**. No se fusionó PR #150. Debe repetirse/completarse CI antes de integrar código a staging. La consolidación configura y sirve una preview aislada de código ya probado localmente; no declara paridad terminada.

Rollback de alias: volver al deployment anterior de cada alias si aparece un problema; no borrar registros ni proyectos. Para volver al esquema de previews anterior, revertir `previewDeploymentsDisabled` de los proyectos antiguos solo si Renzo cambia esta decisión. No usar rollback para volver a desarrollar Classic por iniciativa propia.

Sin cambios en tablas, buckets, datos, secretos, flags de revisión/XP o dominio público en esta operación. No se ha retirado Classic ni publicado producción.
