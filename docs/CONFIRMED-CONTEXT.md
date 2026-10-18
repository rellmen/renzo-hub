# Contexto personal confirmado

La sincronización autorizada guarda los valores privados en Supabase, nunca en Git ni en archivos estáticos. Usa las tablas y políticas existentes: no necesita una migración. Producción y staging conservan bases separadas.

## Contrato de lectura

`hub_records.record_type = personal_fact`, con `owner_id` del usuario autenticado y dominio correspondiente. `payload` contiene `section`, `confirmed: true`, `confirmedAt`, `source`, `sourceRef`, `syncId` y `facts`.

Cada hecho tiene `label`, `value`, `verification`, `asOf` y `provenance`. Secciones: `profile`, `finance`, `work`, `learning`, `gym`, `skincare`, `projects`. Verificaciones: `user_confirmed`, `historical`, `photo_verified`, `needs_confirmation`, `verified_source`. Los campos sin procedencia o fecha y los estados desconocidos se omiten.

- Histórico significa referencia antigua, no saldo ni estado actual.
- Fotografía acredita un producto visible, no existencias, caducidad ni pauta médica. Las variantes ilegibles siguen sin confirmar.
- Los objetivos de idioma no son niveles obtenidos. No se marcan lecciones completadas para representar una declaración sobre formación externa.
- El contexto financiero no crea movimientos, pagos, presupuestos, activos ni deudas contables. Los movimientos existentes siguen siendo la fuente del saldo.

`microapps/confirmed-context.js` monta paneles de lectura y borra sus nodos al cerrar sesión. Filtra por propietario antes de consultar; descarta respuestas que llegan después de un cambio de sesión. Usa `textContent` para contenido personal. No guarda otra copia local.

Ares lee el mismo tipo dentro de su lista explícita. Los temas personales se resuelven en el navegador, incluso si OpenRouter está habilitado. El endpoint externo conserva su lista anterior de proyectos/tareas/operaciones; no recibe `personal_fact` ni el contexto del chat.

## Operación y verificación

Antes de escribir: comprobar identidad, esquema, permisos y copia privada de los datos afectados. Insertar hechos con IDs estables y `ON CONFLICT DO NOTHING`; conservar filas existentes. Leer otra vez y comparar cada registro previo. Guardar fecha de consulta separada de fecha de observación. No atribuir a las fotos una fecha desconocida.

La sincronización inicial añadió contexto y una ficha del proyecto que se pudo verificar. Conservó todos los registros anteriores, `hub_user_state`, sesiones y logs; los datos y snapshots permanecen fuera de este repositorio. Las preferencias de perfil se completaron sin sobrescribir claves existentes. Los datos de progreso de SelfLearn no se tocaron.

Verificación: `npm test`, `npm run check`, `tests/e2e/confirmed-context.mjs`, `tests/e2e/selflearn.mjs`, `tests/e2e/ares-ai-chat.mjs`. El nuevo E2E usa exclusivamente datos sintéticos, comprueba aislamiento, borrado al salir y ausencia de POSTs a IA externa con la opción de IA activada.

La prueba contra la base real usa `SET LOCAL ROLE authenticated`, claims de propietario y de otro usuario; verifica lectura permitida, lectura ajena vacía, INSERT ajeno denegado y UPDATE ajeno de cero filas. Termina con ROLLBACK. También comprueba que `anon` no tiene SELECT. No altera roles ni políticas.

## Publicación

Los datos pueden estar guardados antes de que el código de lectura esté publicado. Distinguir siempre ambos estados. Este cambio se propone hacia staging; la promoción a producción sigue el proceso de aprobación de `AGENTS.md`. Verificar `READY`, `/release.json` y `/api/deployment-info` del commit publicado.
