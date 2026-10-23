# Work · ejecución Nocturne · 23 octubre 2026

Estado: migración parcial. NO preparada para retirar Classic ni para promover producción.
Base contrastada: `c6e80b4fb314971b3956a0b778ebe33508ed030b`, PR #150 abierta/draft hacia staging.
Se leyeron completos los dos Markdown de /Nodalys y las reglas del repositorio antes de editar.

## A. Terminado y verificado en esta ejecución

- [x] CI remoto del SHA base: CI 39881232799 y React 39881232764 concluyeron success.
- [x] Checkout aislado y revisión del código vigente; sin modificar el checkout original del propietario.
- [x] Pruebas locales finales: 583/583 Node; 15/15 Vitest; TypeScript sin errores; build TanStack correcto; sintaxis JS correcta; deploy-surface 3/3. Los tests incluyen mocks y SQL PGlite, no prueban un login real.
- [x] Siete imágenes originales coinciden con las huellas auditadas; guardia privada y configuración del mismo origen presentes. `react-cutover-audit` sigue indicando ready=false.
- [x] Deployment QA `dpl_6nqQqD11P8s9RTvqX8GoRcL96hQb` READY, metadatos y HTTP acreditan el SHA base y entorno preview.
- [x] Reparado exclusivamente `rise-hub-nocturne-qa.vercel.app`: antes apuntaba a `dpl_3BoLaF3YwnXfvJnmnbGK8TJfcLDw` y devolvía 404; ahora apunta al deployment base correcto. `/api/deployment-info` y `/nominas` devuelven 200. No se reasignó `renzo-hub.vercel.app`.
- [x] Smoke HTTP 200 para 20 rutas: /, /ares, /aprender, /gym, /dinero, /gastos, /piel, /proyectos, /notas, /body, /food, /ajustes, /nominas, /turnos, /migracion, /apps, /quest, /news, /agentes y /career. `/release.json` también 200. Son respuestas HTTP, no certificación CRUD.
- [x] Classic de rescate sigue disponible: `https://rise-hub-classic-renzojesus99-1996.vercel.app/release.json` HTTP 200, versión 2.53.1.
- [x] Comprobación actual Payroll: GET 200, configured=false, maxBytes=3145728. Tutor: GET 200, enabled=false, requiresConsent=true. No se leyó ni copió ninguna clave privilegiada.
- [x] SQL staging de solo lectura: tablas públicas con RLS; policies owner de hub_records y payroll_payslips; cuatro buckets privados; policies de Storage basadas en carpeta del propietario. Esto no sustituye denegaciones HTTP entre dos cuentas.
- [x] Advisors QA: cuota tutor sin policy (INFO), RPC de cuota SECURITY DEFINER ejecutable por authenticated (WARN), protección de contraseñas filtradas desactivada (WARN). La cuota usa auth.uid(), search_path vacío y máximo 12; no se cambiaron permisos ni Auth.
- [x] Corregidos textos desactualizados de importación en Gastos/catálogo; Turnos ya no afirma usar producción en QA. Sin cambios de diseño.
- [x] Árbol de rutas regenerado por el build; ampliada la prueba de navegación simulada con /career.

## B. Código implementado, todavía pendiente de prueba real

- [x] Preparado `supabase/pending/20261023124512_payroll_review_cas.sql`: RPC nueva, nombre sin sobrecarga, SECURITY INVOKER, identidad auth.uid(), bloqueo FOR UPDATE y comparación updated_at/pending dentro de la misma transacción antes de llamar al motor Classic. Rechazo con cambios, nota excesiva y payload inválido se bloquean. Conserva correcciones, eventos y compatibilidad del RPC antiguo.
- [x] Adaptador Nocturne usa exclusivamente la RPC CAS y transmite p_expected_updated_at; no vuelve silenciosamente al RPC antiguo. Un conflicto 40001 pide actualizar.
- [x] Prueba PGlite sobre baseline Payroll real: propietario, versión obsoleta, rechazo inválido, campo no permitido, auditoría única, permiso anon, segunda aprobación rechazada y rollback conservando filas; PASS. No es prueba simultánea con dos conexiones ni prueba REST.
- [x] Rollback local elimina solo la función nueva; conserva el RPC Classic y todos los registros. No se ejecutó en Supabase.
- [ ] BLOQUEADO: migración CAS no aplicada a QA ni producción. El flag VITE_PAYROLL_REVIEW_ENABLED continúa apagado. Antes de aplicarla: revisión y OK de staging conforme a AGENTS.md; después, dos conexiones y dos JWT QA. El endpoint Classic conserva su contrato histórico y no queda protegido por este wrapper.
- [ ] BLOQUEADO: Payroll upload requiere SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY y SUPABASE_SECRET_KEY o SUPABASE_SERVICE_ROLE_KEY exclusivamente de staging y de servidor. Configurar mediante operador seguro; este turno no obtuvo credencial ni cambió permisos.

## Paridad funcional: código frente a aceptación real

Todas las escrituras/persistencia multidispositivo de esta tabla permanecen pendientes de sesión QA.

| Área | Implementado según código/pruebas | Falta o bloqueo para certificar |
|---|---|---|
| Money | Resumen, importadores ING CSV/Revolut CSV-PDF, preview, IDs estables, upsert ignoreDuplicates, patrimonio histórico, deudas, metas, presupuestos y conciliación de lectura | Importación real, reintentos parciales, categorías/reglas, historial y persistencia entre cuentas/dispositivos |
| Nóminas | PDF.js local, parser semanal SD Worx, confirmación, handler JWT, deduplicación, listado, detalle, descarga privada; revisión CAS preparada | Credencial QA; PDF sintético de extremo a extremo; aplicar/probar CAS; otros formatos y paridad avanzada |
| Conciliación | Motor Classic reutilizado; no se suma el devengo PDF al ingreso bancario | Casos coincidente/fecha/importe/referencia ausente con filas QA; enlaces manuales y conciliación completa |
| Turnos | Excepciones, plantilla, persistencia con versión, informes contractuales | Motor completo ORT/DST/descansos/contratos y CRUD real; no certificar por calendario visible |
| Ares | Chat, fuentes, revisiones, aprobaciones y registro; aprobación no despacha agentes | Chat con proveedor y consentimiento, cuotas, permisos, errores y contratos dispatch/jarvis; no activar ejecución sensible |
| SelfLearn | Solo NL/EN, objetivos B2/C1, checkpoint, RPC XP/FSRS y tutor opt-in | Tutor apagado, audio/speaking, XP una vez y FSRS con dos sesiones/reintentos/red |
| Quest | Fórmula y XP histórico; SelfLearn separado para evitar duplicados | Misiones, recompensas y eventos globales completos con evidencia |
| Gym | Plan, historial, inicio/guardado/finalización de sesión | Editor avanzado, descansos/superseries, progresión, fotos privadas y conflictos reales |
| Skin | Rutina, pasos, notas, estado de inventario | Catálogo editable completo, compatibilidades/fotos y concurrencia |
| Body/Food | Lectura y entradas de peso/comidas | Objetivos, edición histórica, compras/planificación y fotos |
| Career | Perfil separado de idiomas | Cursos, skills, portfolio, evidencias y laboratorios completos |
| Projects/Notes | Lectura y operaciones básicas | Idea Vault/sprints, adjuntos, paginación y conflictos atómicos completos |
| News/Agent Monitor | Historial/eventos reales | Filtros/alertas/actualización y flujos avanzados |
| Car/AI Inbox | Acceso Classic conservado | Microapps React nativas completas; no se declaran migradas |
| Settings/Migración/PWA | Exportación privada, comparador, manifest y guardias | Restauración integral Auth+Storage+filas, datos locales del origen original, iPhone físico y rollback integral |

## C. Pendientes técnicos para Claude

No se crearon issues ni reasignaciones nuevas. Estas tareas se dejan en Markdown:

1. Revisar la RPC CAS y el cliente preparados; aplicar solo a staging con OK; ensayar dos transacciones simultáneas y fallo parcial, RLS/Storage con JWT A/B. No encender la revisión hasta pasar.
2. Completar brechas de la tabla, en particular Payroll/Turnos avanzados, fotos privadas, Car/AI Inbox, Career y Quest, adaptándolas al shell actual.
3. Revisar avisos Supabase: documentar intención del RPC de cuota y protección de contraseñas; ninguna ampliación de privilegios como atajo.
4. Validar main/staging y APIs clásicas restantes; no interpretar que el wrapper CAS vuelve seguro el RPC Classic sin versión.
5. Completar recuperación integral y comparación de datos locales originales; no copiar producción a QA.

No hay exclusividad técnica inherente a Claude: el código CAS ya se implementó por Work. La frontera pendiente es revisión/aplicación y evidencia real, no el nombre del agente.

## D. Dependencias del propietario / autorizaciones

- Cuenta QA A y B con credenciales mediante formulario seguro; nunca por chat.
- Operador para credencial backend QA, sin reutilizar producción.
- OK específico para aplicar migración CAS en staging después de revisar SQL/rollback. Producción sigue prohibida.
- iPhone físico para PWA y exportación de datos solo locales desde su origen original.
- Autorización de lanzamiento únicamente cuando todos los gates estén cerrados; autorización separada para retirar Classic.

## Limitaciones de entorno y evidencias negativas

- El navegador abrió inicialmente la URL versionada en login Vercel. Tras reparar el alias corto, /nominas carga el login propio de RISE HUB y confirma staging. No hay sesión QA autenticada; no se enviaron credenciales.
- Chromium/WebKit locales: instalación Playwright falló al descargar Chrome (archivo ZIP truncado). No se declara ejecución del E2E ampliado ni QA móvil en este turno; las pruebas de CI base sí constan success.
- Desktop Commander anuncia Mac online, pero la llamada de ejecución no devolvió resultado dentro del tiempo disponible. No se supone que el dispositivo ejecutó pruebas ni se modificó su checkout.
- No se restauró un backup completo real en este turno. PGlite valida el rollback de CAS y hay pruebas automatizadas de exportación; no acreditan recuperación de Auth/Storage/producción.
- No se leyó ni modificó ninguna fila personal, clave de proveedor, contraseña, bucket ni política remota. Consultas Supabase únicamente de catálogo.

## Rollback y requisitos exactos de lanzamiento

Alias QA: si hiciera falta revertir solo la asignación, destino anterior `dpl_3BoLaF3YwnXfvJnmnbGK8TJfcLDw`; ese destino tenía 404. Se prefiere conservar el QA reparado. No cambiar el dominio público por esto.

Código: revertir por commit nuevo, sin reset/force. Base versionada y Classic se conservan.
CAS: apagar flag, ejecutar rollback de la función nueva únicamente tras revisar dependencias; las decisiones ya guardadas no se deshacen. Un rollback frontend no revierte datos.

- [ ] Paridad por operación de todas las microapps, sin enlaces Classic obligatorios.
- [ ] Dos cuentas QA reales: Auth, JWT, privacidad RLS y Storage, lectura/escritura/descarga, reload/logout y dos dispositivos.
- [ ] PDF sintético completo, duplicado, límite 3 MiB, red fallida, corrección CAS concurrente y conciliación sin doble salario.
- [ ] SelfLearn NL/EN: checkpoint, XP una vez, FSRS concurrente; Quest sin duplicación; Ares con límites y aprobación segura.
- [ ] Backup completo restaurado en entorno aislado autorizado, incluidos Auth, Storage, permisos y filas; comparar hashes y datos locales.
- [ ] CI verde y deploy READY del mismo SHA final, QA visual móvil/escritorio e iPhone PWA real.
- [ ] main/staging conciliados, plan de vuelta ensayado, aprobación expresa del propietario. Mantener Classic durante observación y retirarlo solo tras aprobación separada.
