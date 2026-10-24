# Claude · punto de entrada RISE HUB

Lee `AGENTS.md` y `docs/NOCTURNE-STAGING-CLASSIC-READONLY.md` antes de trabajar.

Actualización funcional Work 23 octubre: leer `docs/NOCTURNE-FUNCTIONAL-COMPLETION-2026-10-23.md`. Car y AI Inbox ya tienen rutas nativas; revisión de capturas instalada solo en staging (historial `20261023160009`), flags XP/FSRS activados solo preview con contrato autenticado obligatorio. No reaplicar migración ni afirmar QA de navegador completa. Renzo omitió segunda cuenta QA real; aislamiento queda pendiente, no PASS. Payroll upload sigue bloqueado por credencial backend staging y revisión salarial sigue apagada.

Decisión explícita de Renzo, 23 octubre 2026: **Nocturne es el único desarrollo activo y staging. Classic queda exclusivamente como respaldo y fuente de información de lectura.** No implementar cambios, rediseños ni nuevas versiones Classic. Adaptar dentro de la UI Nocturne aprobada.

Repositorio `rellmen/renzo-hub`; integración `feature/nocturne-integral-migration`, PR #150 hacia staging. Proyecto Vercel de pruebas `renzo-hub-2-1-staging`, raíz `apps/rise-react`, Supabase `zpueziugbezqxompwsol`. No publicar producción ni fusionar pruebas fallidas.

El proyecto antiguo `rise-hub-nocturne-qa` también sirve el dominio público actual: **no borrarlo ni renombrarlo** al consolidar staging. `rise-hub` conserva Classic de respaldo. Las previews automáticas de estos dos proyectos se deshabilitaron; sus despliegues existentes se conservan.

Trabajo pendiente de migración, seguridad, Payroll y QA: `docs/WORK-NOCTURNE-QA-2026-10-23.md`. La función CAS salarial ya está instalada SOLO en staging; no reaplicarla ni encender revisión sin probar concurrencia HTTP. No copiar nóminas ni datos personales de producción a staging. No crear tareas nuevas para otros agentes sin necesidad.

Ejecución Claude 23 octubre (tarde): ver `docs/CLAUDE-NOCTURNE-EXECUTION-2026-10-23.md`. 15 commits de paridad P0/P1; RPC Gym `gym_save_session_cas` aplicada SOLO en staging con autorización de Renzo (historial `20261023182426`; fuente en `supabase/pending/`, no reaplicar); entrega Ares→Jarvis implementada pero apagada. GO/NO-GO: NO-GO producción.

Producción 24 octubre 2026: con autorización de Renzo, #150 fusionado en staging (`c5d70c3`) y desplegado en producción (`rise-hub-nocturne-qa`, `dpl_4tzaXocwe7zYitzuPwb7G9VGGxzq`, dominio `renzo-hub.vercel.app`). Las RPC `payroll_apply_review_cas`, `nocturne_review_capture` y `gym_save_session_cas` ya están en producción: no reaplicarlas. Rollback: dominio a `dpl_J3BmwDUXkJZHNKovmqVcNPJNFH4x`. Classic sigue como respaldo: no retirarlo sin autorización aparte. Falta `SUPABASE_SECRET_KEY` de producción para subir nóminas.

Academia +25 (24 octubre): rama `feature/academia-uoc25`. Estado real y pendientes en `content/academia/NEXT_STEPS.md`. Migración academy solo en staging (`20261024000925`), claves cargadas en staging; producción sin tocar. Ninguna lección publicada: 101/120 redactadas en `draft` (Matemáticas 56/56, fase general completa y Economía 10/10), 557 claves en staging; requieren revisión humana. Pendiente: Física (optativa).
