# Renzo Hub · versión vigente

- **Release local:** 2.6.0 · Renzo Microapp OS Core v1
- **Producción (uso diario):** [renzo-hub.vercel.app](https://renzo-hub.vercel.app/)
- **Preview (revisión aislada):** [renzo-hub-2-1-staging.vercel.app](https://renzo-hub-2-1-staging.vercel.app/)
- **Fuente canónica de Renzo Hub:** `renzo-hub-news/` en el proyecto local
- **Copia de trabajo:** `renzo-microapp-os-core-v1/` · rama local `renzo-os-core-v1`
- **Última edición de esta copia:** 8 de octubre de 2026
- **Despliegue Producción/Preview de este cambio:** ninguno; estado remoto no comprobable sin red
- **Proyectos Vercel:** `renzo-hub` (prod) y `renzo-hub-2-1-staging` (preview)

## Cambios del release 2.5.0
- Las herramientas finales funcionan como microapps enfocadas: ocultan la navegación global mientras están abiertas.
- Gym · Ascend mantiene navegación interna exclusiva para Entrenar, Historial, Progreso y Coach.
- Gym, Food y Skin regresan a Body; News y Ajustes regresan a System; Car vuelve a Home.
- El layout de escritorio se expande al abrir una microapp y conserva el comportamiento móvil/PWA.
- Se preservan autenticación, Supabase y los cambios locales de integración Jarvis del release anterior.

## Cambios locales del release 2.6.0 · no desplegado
- Añadidos contratos TypeScript y App Registry para microapps.
- Añadidos Event Bus tipado, permisos default-deny y frontera de persistencia por namespaces.
- Añadidas APIs headless de widgets, herramientas de IA, comandos, notificaciones y Universal Inbox.
- Documentado el plan de integración gradual sin migrar datos ni conectar servicios.
- Pruebas y build local: `npm run build` (6 pruebas superadas).
- El núcleo es una base aditiva; las pantallas actuales aún no lo consumen.

## Cambios del release 2.4.1
- La API de Jarvis acepta la clave Supabase `SUPABASE_SECRET_KEY` y conserva compatibilidad con `SUPABASE_SERVICE_ROLE_KEY`.
- Gasto y nómina requieren un identificador estable para evitar duplicados al reintentar.
- Los reintentos no sobrescriben un movimiento ya registrado.
- API de Jarvis verificada en Producción con entrada configurada; salida Hub → Jarvis sigue desactivada.

## Cambios del release 2.4.0
- Ilustraciones vectoriales originales y a color para Study · Dutch, Work, Gym, Food, Skin, Car y News.
- Las ilustraciones responden al hover, foco de teclado y toque con movimiento sutil; se respeta reducir movimiento.
- Iconos de navegación con colores propios y brillo al seleccionar.
- Caché PWA renovada para que los móviles reciban los nuevos iconos.

## Comprobación rápida
Desde cualquier IA que tenga abierto el workspace, ejecutar `./scripts/renzo-hub status`. Una IA que no tenga acceso a esta carpeta no debe editar otra copia como si fuera la vigente.
