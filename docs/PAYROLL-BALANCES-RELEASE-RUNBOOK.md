# RISE HUB 4.0 · Nóminas · Importación de saldos · Runbook de publicación

**Estado (14/10/2026): preparado y probado en staging, producción NO autorizada ni modificada.** Rama `feature/risehub4-shift-ui`; PR [#51](https://github.com/rellmen/renzo-hub/pull/51) en borrador, versión candidata 2.29.1. **La fase 1 continúa abierta.** No fusionar ni ejecutar acciones productivas basándose solo en este documento.

## Alcance exacto
Una importación documentada por titular desde `payroll_payslips` + `payroll_documents` del PDF original: `leave_minutes` (minutos de vacaciones al cierre del período) y `keuzebudget_cents` (saldo independiente en euros). La interfaz requiere abrir el PDF, transcribir ambas cifras y marcar confirmación. El origen, usuario, fecha y SHA se verifican del lado de PostgreSQL. La tabla `payroll_balance_imports` permite una única instantánea inicial por titular y evita duplicados. El trigger de `hub_records` impide registrar después movimientos de vacaciones ya comprendidos en el saldo inicial fechado.

El usuario identificó la nómina de SD Worx **semana 41, número 27** (fecha de cierre **11/10/2026**), con **49 h 24 min** de vacaciones y **333,22 €** de Keuzebudget. **No incluir estos números en código, fixtures, SQL ni escrituras automatizadas de producción**. Son valores para que el propietario confirme en su sesión. La cifra disponible en una fecha posterior solo será estimable después de incorporar los movimientos posteriores realmente comprobados.

## Evidencia de preparación
- Migración fuente: `supabase/pending/20261014090000_payroll_balance_import.sql`; rollback: `supabase/rollbacks/20261014090000_payroll_balance_import.rollback.sql`. La migración se ejecutó únicamente en Supabase Staging `zpueziugbezqxompwsol` mediante la herramienta de migraciones.
- Verificado en staging: tabla + RPC, RLS activo, dos políticas de propietario y trigger de bloqueo retroactivo. Cero importaciones y cero movimientos QA después del E2E (se eliminaron registros ficticios por ID exacto).
- QA sintético vinculado a un PDF ficticio: Chromium móvil 390px + WebKit escritorio 1440px. Prueba sin confirmar, SHA/versión anterior, duplicados, corte de fechas y persistencia tras recarga. `tests/e2e/payroll-balances-staging.mjs`.
- Pruebas locales en el commit anterior: `npm run check`, **186/186** `npm test`, **15/15** smoke, regresión Nóminas Chromium/WebKit.
- Producción Supabase `mgncykyrhavpepfggmng`: nómina fuente 41/27 única, fecha de cierre 2026-10-11, PDF con huella SHA y ruta archivada, 0 registros de apertura existentes. Esquema de las tablas de origen compatible. La nueva tabla y RPC **no** existen todavía en producción.

## 1. Antes de tocar producción (obligatorio)
1. Obtener autorización **explícita y específica** del propietario para (a) aplicar esta migración en Supabase **producción** y (b) fusionar el release desde staging a `main` una vez CI/E2E/preview estén validados. Autorizar la fase 1 no equivale a autorizar el deploy.
2. Revisar PR #51 y CI del SHA exacto; no fusionar un borrador. Resolver la diferencia actual de ramas: en la fecha del análisis `staging` es ancestro de `main` (~20 commits detrás). No hacer merge directo de #51 a `staging` sin revisar primero los commits adicionales. **No forzar historia ni sobrescribir staging**.
3. Conseguir un despliegue `READY` del código en el proyecto de staging, incluyendo la migración ya aplicada, ejecutar E2E autenticado contra esa **URL real** con cookie de Vercel Protection Bypass, y documentar URL+SHA. Una prueba de dev server con base de staging no sustituye este paso.
4. Confirmar que `payroll_balance_imports` **no** existe en producción, que no hay un opening manual para el usuario y que el PDF de origen está vinculado. Si existe cualquier dato conflictivo, detenerse y conciliarlo en vez de sobrescribir.
5. Verificar un plan de rollback **seguro**: primero Vercel Instant Rollback del código si hay un error; NO borrar la tabla productiva si ya contiene saldos. El rollback SQL rechaza ejecutarse si hay importaciones, precisamente para no destruir registros financieros.

## 2. Publicación autorizada y verificación
1. Aplicar el SQL exacto de `supabase/pending/20261014090000_payroll_balance_import.sql` con el mecanismo de migraciones de Supabase al proyecto de **producción**. No ejecutar SQL desde una sesión anónima ni copiar datos de staging. Documentar ID/fecha de la migración. Como efecto se añaden una tabla RLS y dos funciones, y un trigger de seguridad sobre `hub_records` (todas las altas/ediciones de vacaciones pasan a estar validadas).
2. Ejecutar comprobación **solo lectura** de existencia de la tabla, RLS, dos políticas, RPC, trigger y ausencia de importaciones inesperadas.
3. Tras las pruebas de la **URL de staging** y las aprobaciones correspondientes, fusionar la rama aprobada a `main` mediante PR. Vercel debe publicar en el proyecto `rise-hub` versión `2.29.1` (o la versión final establecida), estado **READY**, SHA del merge verificado y `GET /release.json` / `/api/deployment-info` correctos. Ejecutar smoke público sin autenticarse.
4. Propietario: abrir **Nóminas → nómina 41/27 → Importar saldos del PDF**, verificar el documento real, introducir **49 h 24 min** y **333,22 €**, marcar confirmación y enviar. No automatizar ese consentimiento ni afirmarlo efectuado por anticipado.
5. Verificar con lectura por sesión autenticada que existe **una sola** instantánea ligada a esa nómina/propietario y que aparecen dos saldos independientes; la pantalla de Turnos muestra saldo de vacaciones inicial sin descontar de nuevo movimientos anteriores. Validar que posteriores consumos de vacaciones rebajen horas, no el Keuzebudget.

## 3. Retroceso y alertas
- **Antes de importaciones reales:** revertir la app mediante Instant Rollback Vercel. Solo si está confirmado que la tabla sigue vacía, el rollback SQL de la migración puede retirarla con su guard.
- **Después de un saldo confirmado:** NO ejecutar `DROP TABLE`, `TRUNCATE` ni el rollback SQL para silenciar el fallo. Conservar el registro; revertir primero la interfaz y planificar una corrección aditiva específica, probada en staging y autorizada.
- No usar una nómina con estado `rejected` o validación `failed`. La importación de saldos no equivale a aprobar la nómina entera; el bruto y la reclamación salarial aún requieren auditoría aparte.
- Problemas a reportar al propietario: PDF incorrecto, SHA cambiado, fecha/nómina duplicada, horas vacacionales anteriores cargadas otra vez, importación de otro usuario, error de permiso, pérdida de datos o estados distintos entre pantalla y base. Detener el rollout ante cualquier problema de estos.

## 4. Cierre que NO hace este release
Aún faltan el análisis de festivos y convenio por empleador/agencia, resolución de turnos en transición CET/CEST con offsets y auditoría de una semana completa para permitir la comparación/reclamación con SD Worx. Mantener **fase 1 `active`**, y My Finance (fase 2) sin iniciar.
