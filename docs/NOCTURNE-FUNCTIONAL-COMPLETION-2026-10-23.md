# Nocturne · funciones nativas y cierre de esta ejecución · 23 octubre 2026

Decisión vigente: único staging Nocturne, Classic exclusivamente respaldo y consulta. Producción y Classic no se modifican. PR #150 permanece draft hacia `staging`.

Renzo pidió omitir «la segunda quinta de QA», interpretado y comunicado como **segunda cuenta de QA**. Se omite esa prueba real en esta ejecución; no se registra como superada ni se elimina el requisito de aislamiento antes de producción.

## A. Terminado y verificado por Work

- [x] `/car` nativa: historial completo paginado de documentos `renzo_money`, combustible y parking del banco mediante las reglas originales, y capturas del coche pendientes. No suma recibos y banco como si fueran dos compras distintas.
- [x] `/inbox` nativa: historial paginado privado, filtros, creación con ID estable y reintento `ignoreDuplicates`, archivo y restauración mediante CAS. No borra registros.
- [x] Adjuntos de capturas: PDF, JPEG/PNG/WebP, texto y Office admitidos hasta 10 MB, bucket privado `hub-private`, carpeta del propietario, ruta con hash de contenido, sin reemplazar archivos; descarga autenticada y rechazo de rutas ajenas/traversal. El guardado de la captura precede a adjuntar, por lo que un fallo de subida no pierde la nota.
- [x] Revisión explícita y transaccional de capturas: RPC `nocturne_review_capture(uuid,timestamptz)`, `SECURITY INVOKER`, `auth.uid()`, bloqueo de fila y versión. Conserva payload/adjuntos y registra un evento de auditoría. No ejecuta agentes.
- [x] Recibos/gastos EUR de Jarvis con importe válido: confirmación humana muestra importe/fecha; una transacción guarda documento `renzo_money`, evento y revisión. Reintentos no crean otra entrada; no crea `bank_tx` ni aumenta el saldo bancario. Nóminas/ingresos y extracciones incompletas se rechazan y conservan pendientes.
- [x] RPC instalada **solo staging**: historial `20261023160009 nocturne_capture_review`; SQL fuente en `supabase/pending/20261023155335_nocturne_capture_review.sql`. No reaplicar por diferencia de timestamp.
- [x] PGlite con esquema real: propietario, rechazo anónimo/ajeno, versión obsoleta, doble revisión, fallo de auditoría con rollback atómico, rechazo salarial, recibo una vez, ausencia de movimiento bancario inventado y rollback conservando todas las filas.
- [x] Ensayo SQL staging con identidad sintética y `SET ROLE authenticated`: versión obsoleta rechazada, revisión correcta, repetición rechazada, exactamente un evento. `ROLLBACK`; `fixture_rolled_back=true`, `security_invoker=true`, `anonymous_denied=true`, `authenticated_allowed=true`. No equivale a login/JWT de navegador.
- [x] SelfLearn: corregido bypass del probe en hosts staging sin target explícito; ahora todos los entornos exigen opt-in **y** contrato autenticado listo, y se rechazan discrepancias host/target. SQL staging devuelve `{ready:true,version:1}`.
- [x] Configurados exclusivamente en Vercel staging, target `preview`: `VITE_NOCTURNE_RELEASE_TARGET=preview` y `VITE_ENABLE_SELFLEARN_AWARDS=true`. Contratos/RLS y RPC atómicas siguen siendo obligatorios. Ningún target production modificado. Payroll review permanece desactivado.
- [x] Car/Inbox accesibles desde catálogo, paleta y navegación; Ares abre las capturas en Inbox nativa. Móvil mantiene estado activo de Más. Misma UI/componentes/estilos, sin rediseño.
- [x] Nóminas explica el aislamiento de staging; no promete tener datos recientes de producción ni los copia.
- [x] Verificación local: **589 Node PASS**, **18 Vitest PASS**, build TanStack PASS; TypeScript y sintaxis JS comprobados. Prueba de rutas simuladas ampliada de 20 a 22 rutas; ejecución de navegador pendiente del entorno/CI.
- [x] Advisors staging tras migración: sin aviso para la RPC nueva; persisten los tres avisos previos de cuota/SECURITY DEFINER/contraseñas filtradas. No alteradas políticas/buckets/secretos.

## B. Implementado y pendiente de prueba real

- [ ] Navegador autenticado: crear/reintentar/revisar/archivar/restaurar captura, adjuntar y descargar PDF/foto, y confirmar recibo Jarvis. Las pruebas React usan mocks y las de DB usan roles SQL; no atribuirles validación HTTP/Storage real.
- [ ] SelfLearn: completar unidad NL/EN, acreditar una vez, recuperar en otra sesión y repasar tarjeta FSRS con respuesta perdida. Habilitado solo para probar en staging; pendiente cierre real del flujo, no acreditación automática ni XP ficticio.
- [ ] BLOQUEADO Payroll upload: falta credencial privilegiada de servidor **exclusiva de staging** (`SUPABASE_SECRET_KEY` o `SUPABASE_SERVICE_ROLE_KEY`). Herramientas disponibles no la proporcionan. No usar producción ni ampliar permisos para eludirlo. Comprobar `configured:true` antes de E2E.
- [ ] Payroll CAS: ya instalada anteriormente en staging, flag de revisión apagado. Falta ensayo simultáneo de dos conexiones HTTP antes de habilitarlo.
- [ ] Chromium/WebKit local: descarga de Chrome v1248 vuelve a fallar; no declarar Playwright ejecutado. CI debe ejecutar matriz ampliada.
- [ ] Gate de migración sigue `ready=false`: faltan paridad avanzada de Gym/Skin/fotos, Career/portafolio, Quest/misiones, Turnos/conciliación y recuperación integral Auth+Storage+datos locales. Esta entrega no los declara completos.

## C. Continuación para Claude

No hay trabajo técnicamente exclusivo de Claude. Continuar desde la rama de #150; no volver a implementar Car/Inbox ni aplicar otra vez la migración ya registrada. Validar flujos reales de B, completar brechas avanzadas de la matriz existente en `WORK-NOCTURNE-QA-2026-10-23.md` **dentro de Nocturne**. La segunda cuenta QA real se ha omitido por instrucción de Renzo; no convertir esa omisión en resultado PASS.

Para documentos financieros incompletos, ingreso/factura genérica y nómina en Inbox, falta revisión/edición especializada: no crear salario `renzo_money` desde la bandeja ni alterar saldos bancarios para aparentar paridad.

## D. Autorizaciones y condiciones para producción

No se necesita nueva autorización para continuar código y pruebas reversibles en staging. Un operador debe configurar la credencial Payroll de staging de forma segura; nunca por chat. Producción y retirada de Classic requieren autorización explícita independiente después de cerrar paridad, CI completo del SHA, aislamiento real y restauración integral probada. No se ha ensayado restauración integral.

Rollback: revertir código mediante commit nuevo; restaurar aliases al deployment staging anterior registrado en `NOCTURNE-STAGING-CLASSIC-READONLY.md`; apagar flags de pruebas si falla SelfLearn. Rollback de la RPC elimina **solo la función**, no capturas/eventos/documentos/archivos ya guardados. Classic sigue accesible y sin cambios.
