# RISE PRIORITY · auditoría compatible · 27-10-2026

Base: staging 64af6d2; producción f447c55 contiene el mismo árbol. Ejecución nativa autorizada por Renzo; sin despliegue ni migraciones.

1. Recuperar conversación y especificación. Las respuestas originales son referencias opacas: no atribuirles texto ni tareas personales. Comparar requisitos recuperables con código y PR #172/#173.
2. Añadir pruebas de regresión antes de corregir dos brechas: comprobación humana obsoleta tras editar fecha/evidencia y deduplicación obsoleta tras editar/refrescar propuestas.
3. En PriorityBoard.Editor, desmarcar comprobación al cambiar fecha, tipo, fuente o evidencia. En patchPriorityTask, exigir comprobación explícita si esos campos cambian. Conservar CAS, payload Work y checkbox de estado.
4. Ampliar proposalBlockers con contexto opcional de tareas/propuestas. Reutilizar uniquePriorityProposals para bloquear coincidencias actuales (incluidas completadas), excluyendo el UUID propio para recuperar reintentos. Aplicar en tarjetas, botón y bucle de guardado.
5. Ejecutar pruebas enfocadas, TypeScript, suite completa y build; revisar diff, actualizar protocolo/estado y auditoría con límites. Crear commit y PR borrador a staging.

Riesgos que probar: mantener evidencia al editar solo título/motivo; reinvalidar comprobación al cambiar fecha; reintentos con UUID propio; duplicados después de editar y después de refrescar; conflicto CAS y offline existentes.
