# Renzo Hub · versión vigente

- **Producción (uso diario):** [renzo-hub.vercel.app](https://renzo-hub.vercel.app/) · release **2.4.1** · `dpl_HBnDnZqawHuTC9nUFcCsxoLnDeTs` · rama `main`, tag `v2.4.1`
- **Staging (revisión aislada):** [renzo-hub-2-1-staging.vercel.app](https://renzo-hub-2-1-staging.vercel.app/) · release **2.5.0** · `dpl_4i9kbXSiLiSm8WpXtXmiWah9SLJU` · rama `staging`, tag `v2.5.0`
- **Experimental:** 2.6.0 Microapp OS Core · rama `experimental/os-core` (no se despliega)
- **Fuente canónica:** repositorio Git en `~/Projects/RENZO-HUB/repo` (remoto previsto: `github.com/rellmen/renzo-hub`, pendiente de acceso)
- **Copias de seguridad:** `~/Projects/RENZO-HUB/backups/` y versiones verificadas en `~/Projects/RENZO-HUB/releases/`
- **Proyectos Vercel:** `renzo-hub` (producción) y `renzo-hub-2-1-staging` (staging)
- **Supabase:** "Renzo Hub" `mgncykyrhavpepfggmng` (producción) y "Renzo Hub Staging" `zpueziugbezqxompwsol`
- **Referencias:** `RENZO_HUB_TECHNICAL_AUDIT.md` y `PHASE_1_EXECUTION_PLAN.md` (bóveda del proyecto y `~/Documents/HUB`)

> La carpeta `~/.codex/.chatgpt-projects/.../renzo-hub-news` queda como espejo histórico de solo lectura. No editar ni desplegar desde ella.

## Progreso Fase 1

| Fecha | Tarea | Resultado | Archivos | Pruebas | Commit / PR |
|---|---|---|---|---|---|
| 2026-10-08 | T0.1 Backup | Copias tar.gz de `renzo-hub-news` y `renzo-microapp-os-core-v1` + manifiestos SHA-256; config local separada (700/600) | n/a (fuera del repo) | Extracción y `shasum -c` OK (142 y 72 archivos); sin secretos en archivos | n/a |
| 2026-10-08 | T0.2 Recuperar versiones | 2.4.1 reconstruida desde Vercel; 2.5.0 y 2.6.0 desde local | `releases/` | 2.4.1: 35/35 SHA-1 = uid Vercel. 2.5.0: 37/38 (excepción doc `RENZO-HUB-CURRENT.md`) | n/a |
| 2026-10-08 | T0.5 Historia limpia (local) | Historia original conservada (7 commits); `main`=2.4.1, `staging`=2.5.0, `experimental/os-core`=2.6.0 | todo el árbol | Verificación de hashes en cada commit; `npm test` os-core 6/6 | `d7cdf75` v2.4.1 · `6c45462` v2.5.0 · `a05849b` v2.6.0-experimental |
| 2026-10-08 | T0.9 Script status | `scripts/renzo-hub` usa curl; detecta staging protegido por SSO | `scripts/renzo-hub` | Ejecutado: producción 2.4.1 detectada | rama `feature/block0-tooling` |
| 2026-10-08 | T0.3/T0.4/T0.7/T0.8 | **Bloqueado:** sin acceso al repo privado `rellmen/renzo-hub` | n/a | n/a | Pendiente de Renzo |

**Siguiente tarea:** Bloque 1 en `feature/block1-critical-fixes` (en paralelo al bloqueo de GitHub).

## Cambios del release 2.5.0
- Las herramientas finales funcionan como microapps enfocadas: ocultan la navegación global mientras están abiertas.
- Gym · Ascend mantiene navegación interna exclusiva para Entrenar, Historial, Progreso y Coach.
- Gym, Food y Skin regresan a Body; News y Ajustes regresan a System; Car vuelve a Home.
- El layout de escritorio se expande al abrir una microapp y conserva el comportamiento móvil/PWA.
- Se preservan autenticación, Supabase y los cambios locales de integración Jarvis del release anterior.

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
Ejecutar `./scripts/renzo-hub status` desde el repositorio. Ninguna IA debe editar otra copia como si fuera la vigente.
