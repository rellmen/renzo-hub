# RISE HUB · política de entregas agrupadas

## Proceso
1. Desarrollar varias funciones en una sola rama release; no fusionar cada commit.
2. Validar en GitHub Actions: `npm ci`, `npm run check`, `node --test tests/*.test.mjs` y pruebas browser del repo.
3. Mantener previews automáticas desactivadas en `rise-hub` y `renzo-hub-2-1-staging` durante desarrollo.
4. Cuando el lote esté listo, habilitar temporalmente preview solo en staging, ejecutar UNA compilación controlada y comprobarla con sesión de prueba; volver a desactivarla.
5. Fusionar un único PR a `main` una vez validado; verificar el despliegue único de producción.
6. Dos entornos suponen dos compilaciones necesarias (staging + producción); no prometer un solo build para ambos.
7. Ante un HTTP 402 `api-deployments-free-per-day`, no reintentar en bucle; esperar el período devuelto por Vercel. No borrar commits ni pagar como solución automática.
8. Las checks antiguas fallidas no desaparecen necesariamente al cambiar la configuración. No anular tests ni controles de seguridad.

## Release activo: Gym Ascend
- Rama consolidada: `release/gym-ascend-bundle` desde `feature/gym-quick-sets` (#73).
- Abarca registro rápido más análisis, turnos, mapa y recuperación ya integrados en `main`.
- Confirmar nuevo PR sustituto antes de cerrar el PR #73 para evitar duplicados.
- Validación previa: CI verde, móvil, sesión autenticada, persitencia de series, históricos sin alteración y PWA.
- `main` queda intacto hasta completar pruebas y aprobación del release.
