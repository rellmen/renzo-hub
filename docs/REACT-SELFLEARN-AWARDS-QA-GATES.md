# RISE HUB React — finalización oficial de SelfLearn

## Estado de implementación

- Lecciones y respuestas: motor original NL/EN, sin cursos SQL/Power BI ni lecciones ficticias.
- Checkpoints: registros append-only en `hub_records` por usuario, sesión y respuesta.
- Preparación de XP: `score(run).correct * 10`, únicamente en la primera acreditación de unidad (regla original de SelfLearn).
- Tarjetas nuevas: `renzo_vocabulary` para vocabulario de la unidad aún no registrado, con la fecha de repaso heredada del motor clásico. Las tarjetas FSRS existentes **no** se reprograman ni se sobrescriben.
- Persistencia: el evento `renzo_event` y las tarjetas nuevas se insertan en **un solo lote** de `hub_records.upsert` con `ignoreDuplicates` y IDs criptográficos determinísticos. Permite reintentos de la misma implementación React sin crear dos premios.
- Se exige último checkpoint confirmado en la misma cuenta, ausencia de sesión clásica activa y validación de respuestas.

## Limitación de concurrencia entre clientes (bloqueante)

**El cliente clásico utiliza IDs UUID aleatorios y se sincroniza por otro flujo**, mientras que React ahora usa IDs determinísticos. La detección previa de lecciones completadas no es una transacción distribuida entre los dos clientes.

**No activar la finalización oficial** mientras una persona pueda acabar simultáneamente la misma unidad en la interfaz antigua y la nueva. El botón React está oculto salvo que la variable de compilación `VITE_ENABLE_SELFLEARN_AWARDS=true` esté presente. El valor predeterminado y requerido para builds generales es **false**.

La validación de RLS con clientes simulados y CI **no sustituye** a una prueba autenticada con el Supabase `staging` existente. Tampoco evita que el código cliente modificado localmente falsifique un checkpoint: la acreditación definitiva debería validarse en una función/RPC del servidor antes de autorizar su uso en producción.

## Gate mínimo sin contratar otro proyecto Supabase

1. En la cuenta de prueba del Supabase `staging` actual, finalizar una unidad que aún no figure completada.
2. Repetir la misma llamada tres veces y verificar que solo existe **un** evento de la unidad, una sola asignación de XP y ninguna tarjeta duplicada.
3. Preparar otra sesión de navegador; forzar un checkpoint antiguo y verificar que se rechaza sin escritura.
4. Probar que un intento concurrente entre cliente clásico y React no otorga doble XP. Si no es posible garantizarlo, dejar el flag desactivado hasta portar la finalización al servidor.
5. Revisar `renzo_vocabulary` y tarjetas con FSRS existente: fecha, estabilidad y reviewHistory no deben alterarse inadvertidamente.
6. Finalizar la migración del repaso FSRS, del tutor y del audio; después validar rutas móviles, offline y actualización PWA.
7. Documentar prueba real, hash de Git, usuario de prueba **no identificable** y resultado antes de cualquier release.

El código bajo este PR no se despliega y no cambia producción; mantiene el comportamiento protegido por defecto.
