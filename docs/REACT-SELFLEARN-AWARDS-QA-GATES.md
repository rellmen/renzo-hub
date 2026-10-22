# SelfLearn: acreditación y FSRS — PR #141

Estado: preparado en rama; funciones React **desactivadas por defecto**. No es un release ni una migración aplicada.

## Implementado

- Se conserva el motor original NL/EN. Antes de acreditar, React reconstruye los pasos desde curso, unidad, minutos y seed; exige cola completa y respuestas coherentes. La comparación tolera la reordenación de claves JSONB.
- La lectura reconoce `Study path` y los `Daily lesson` históricos mediante `completedUnitIds`, igual que `world.js`/el motor clásico. Un checkpoint terminado se puede recuperar para acreditar tras recargar.
- `selflearn_finalize_lesson` usa un checkpoint del propietario autenticado, rechaza revisiones antiguas y sesiones clásicas conocidas, recalcula score/XP desde las primeras respuestas guardadas y guarda evento y tarjetas en una transacción. Nunca se cae a un insert directo si falta la RPC.
- El guard de `hub_records` serializa checkpoints, acreditaciones y vocabulario por propietario con bloqueo transaccional en READ COMMITTED. Reconoce IDs aleatorios clásicos, impide repetir XP y crear palabras nuevas duplicadas; conserva filas históricas. Un reintento devuelve `already=true`, XP cero y cero tarjetas nuevas.
- Las tarjetas nuevas conservan el contrato legacy (`nextReview`, `intervalDays`, `repetitions`). Las existentes no se reprograman al acreditar desde React.
- Repasos React: mismo bundle FSRS que usa el clásico, conversión de fechas, cuatro calificaciones, historial limitado a 100 y un solo aumento de repetitions. La RPC bloquea la tarjeta, compara `updated_at`, escribe tarjeta+evento juntos y reconoce el ID del reintento tras una respuesta perdida.
- Un cambio FSRS clásico obsoleto no puede reducir repetitions ni sustituir otra revisión con la misma repetitions. Se permite el cambio clásico de **solo adelantar due**, al fallar una palabra durante una lección, conservando el resto de la programación.

## Evidencia de staging — solo lectura, 22 de octubre de 2026

Proyecto existente `zpueziugbezqxompwsol`: RLS de `hub_records` activa; cuatro políticas por `auth.uid()` y `owner_id`; índices primario por id y de propietario/tipo/dominio, sin regla de acreditación. Consulta agregada: 38 `renzo_event` en system y 4 `renzo_vocabulary` en learning; ningún `learning_run` remoto en esa consulta. No se leyeron ni exportaron valores personales ni se escribieron registros.

Advisor de seguridad: avisos existentes del contador del tutor (RLS sin política de lectura y función SECURITY DEFINER autenticada) y protección de contraseñas filtradas desactivada. No se modificó configuración ni privilegios existentes. El contador se documenta como tabla interna intencionadamente no legible.

## Migración preparada, sin aplicar

- `supabase/pending/20261022090000_selflearn_transactions.sql`
- `supabase/pending/20261022090000_selflearn_transactions.rollback.sql`

Solo funciones y trigger nuevos, con permisos invoker y RLS existente; sin tablas nuevas, borrado ni reescritura de historial. Rollback elimina únicamente esas funciones/trigger. Pruebas PGlite ejecutan las funciones con rol authenticated, otro propietario y anon, verifican rollback de lotes fallidos y rollback de la migración conservando filas. CI añade dos conexiones PostgreSQL 17 con créditos simultáneos y vocabulario duplicado.

## Bloqueantes antes de activar

1. **OK explícito de Renzo para aplicar la migración en staging**, según AGENTS.md. Revisar SQL y resultado del rollback antes. Nunca ejecutar en producción con esta autorización.
2. Probar dos dispositivos autenticados del staging existente: clásico y React finalizando la misma unidad, replay de ambos, sesión clásica activa, palabras ya existentes y pérdida de respuesta. Verificar el resultado remoto, no solo la pantalla.
3. Revisar la autorización del registro de aprendizaje: **los checkpoints y las respuestas siguen siendo editables por su propietario**. La RPC compara y deriva score, pero no reconstruye en SQL el catálogo canónico ni verifica respuestas contra él. El tracker personal no constituye un sistema de certificación resistente a manipulación. Si se exige integridad contra un cliente modificado, falta un contrato de evaluación autoritativo en servidor y restringir los writes directos clásicos; no activar mientras se mantenga ese requisito.
4. Probar reconciliación clásica: un cliente offline puede mostrar temporalmente XP/tarjetas locales antes de recargar la versión normalizada por el servidor. Las filas históricas duplicadas se preservan, no se consolidan automáticamente. El guard evita nuevas duplicaciones remotas; no promete corregir el contenido de caches locales antiguos.
5. Los conflictos de repaso se rechazan sin fusionar horarios; recargar y repetir con la versión vigente. Un UPDATE directo puede requerir reintento si PostgreSQL detecta un deadlock con otra operación; los clientes normales usan upsert/RPC.
6. Verificar revisión de código/seguridad, build auténtico y CI en el SHA final; completar QA móvil/iPhone, accesibilidad, offline y PWA. Tutor y audio React continúan fuera de este bloque.

Después de esos gates, habilitar `VITE_ENABLE_SELFLEARN_AWARDS=true` solo en el build controlado de staging. No cambiar flags, fusionar o desplegar producción como parte de este PR.
