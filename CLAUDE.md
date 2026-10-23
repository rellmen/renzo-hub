# Claude · punto de entrada RISE HUB

Lee `AGENTS.md` y `docs/NOCTURNE-STAGING-CLASSIC-READONLY.md` antes de trabajar.

Decisión explícita de Renzo, 23 octubre 2026: **Nocturne es el único desarrollo activo y staging. Classic queda exclusivamente como respaldo y fuente de información de lectura.** No implementar cambios, rediseños ni nuevas versiones Classic. Adaptar dentro de la UI Nocturne aprobada.

Repositorio `rellmen/renzo-hub`; integración `feature/nocturne-integral-migration`, PR #150 hacia staging. Proyecto Vercel de pruebas `renzo-hub-2-1-staging`, raíz `apps/rise-react`, Supabase `zpueziugbezqxompwsol`. No publicar producción ni fusionar pruebas fallidas.

El proyecto antiguo `rise-hub-nocturne-qa` también sirve el dominio público actual: **no borrarlo ni renombrarlo** al consolidar staging. `rise-hub` conserva Classic de respaldo. Las previews automáticas de estos dos proyectos se deshabilitaron; sus despliegues existentes se conservan.

Trabajo pendiente de migración, seguridad, Payroll y QA: `docs/WORK-NOCTURNE-QA-2026-10-23.md`. La función CAS salarial ya está instalada SOLO en staging; no reaplicarla ni encender revisión sin probar concurrencia HTTP. No copiar nóminas ni datos personales de producción a staging. No crear tareas nuevas para otros agentes sin necesidad.
