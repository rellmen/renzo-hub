# RISE HUB · Command Center preview 2.22.2

## Entorno
Rama: feature/command-center-preview, basada en origin/staging aed842c.
Proyecto previsto: renzo-hub-2-1-staging, Supabase staging zpueziugbezqxompwsol.
Producción (main, proyecto rise-hub y Supabase producción) fuera de alcance.

## Funciones
- Microapp declarada en microapps/registry.js, tarjeta en Home y enlace ?app=command-center.
- Pantalla privada con diseño adaptado a las variables visuales de RISE HUB.
- Datos Work/System desde hub_records: cuenta solo los últimos 75 registros consultados, no el total de la base.
- Consulta read-only con Supabase Auth y RLS (owner_id).
- Endpoint /api/deployment-info describe exclusivamente el despliegue que sirve la app.
- Claude, Hermes y GitHub: sin integración todavía, no se inventan estados.
- Los registros no se insertan, editan ni eliminan. Cierre de sesión borra la vista.

## Pruebas y próximos pasos
- node --check microapps/command-center/command-center.js
- npm run check && npm test
- Smoke local Chromium móvil/escritorio; E2E con autenticación real solo staging.
- Previsualizar, pedir aprobación antes de fusionar en staging; no fusionar en main.
