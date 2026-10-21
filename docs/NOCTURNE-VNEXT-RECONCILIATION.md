# NOCTURNE ASCENDANCY · reconciliación entre vNext y staging

**Fecha:** 21 octubre 2026. **Estado:** implementación preparatoria, no release de producción.

## Hecho y evidencias

1. PR #125 integró el diseño Nocturne 2.54.0 desde la rama de staging antigua: merge `e5630fef4b1c747316330b12c8340ea4ee60f530`; GitHub Actions verde.
2. Vercel creó el deployment `dpl_BBYTLKQmzcRKHnr16b9UvvyWHED6` para proyecto **renzo-hub-2-1-staging**, commit idéntico; estado `READY` y alias `renzo-hub-2-1-staging.vercel.app`. No se probó la PWA real en iPhone ni guardado con usuario staging autenticado.
3. Capturas del CI para 320/390/768/1440 px archivadas en GitHub run #39669295781. Se comprobó visualmente la Home; PR #126 amplía capturas a cada microapp con cliente simulado.
4. **Bloqueo:** `staging` y `main` han divergido: main añadió una nueva Home estructural `rx-*`, `assets/rise-vnext.css` y cambios en navegación/módulos que la rama staging Nocturne no contiene. No fusionar ramas a ciegas.

## Solución que prepara esta rama

`feature/nocturne-vnext-compatible` parte de `main` y **conserva completamente el nuevo DOM vNext**, sin copiar el Home anterior ni el CSS de tarjetas antiguas.

- `assets/nocturne-vnext.css`: puente de identidad Nocturne sobre clases `rx-*`, personalización de módulos y chat real de Ares, respetando UI de listas e iconos contenidas del nuevo diseño.
- `index.html`: CSS después de `rise-vnext.css` y theme browser obsidiana.
- `sw.js`: precache y versión v59; `manifest.webmanifest`: color de lanzamiento; `release.json`: 2.55.0 **candidato**.
- `tests/nocturne-vnext.test.mjs`: contratos y pruebas estáticas. CI y QA E2E todavía obligatorios.
- No altera `app.js`, `world.js`, Supabase, autenticación, cálculos, sincronización ni rutas de microapps.

## Pasos de reconciliación obligatorios

- [ ] Resolver diferencias entre ramas sin perder commits de `main` ni los arreglos de `staging`.
- [ ] Elegir una sola estructura vNext como fundamento (conservar `rx-*`; descartar selectores `rise-*` ya obsoletos).
- [ ] Probar combinación en rama de integración; no aplicar dos capas UI competidoras al mismo tiempo.
- [ ] Inspeccionar capturas reales de todos los módulos y diálogos en 320/390/768/1440; confirmar las vistas con contenido, no solo estados vacíos.
- [ ] Ejecutar CI verde y E2E contra preview resultante; pruebas reales de Supabase staging con usuario de QA y RLS.
- [ ] Validar en iPhone PWA instalada: cache, teclado, safe area, salida/reentrada de Gym/SelfLearn/Finanzas/Skin.
- [ ] Entregar revisión visual a Renzo y solicitar aprobación expresa para integrar staging -> main. Mantener rollback.
- [ ] **No publicar producción si persisten las diferencias de ramas, CI rojo, pérdida de datos o ausencia de validación de iPhone.**

## Respeto de límites

Este proyecto es **personal** y está separado de Nodalys. No se conectan sistemas empresariales, secretos ni datos externos. Las capturas de CI usan solo mocks, no contienen datos reales. Los estilos no agregan funcionalidad a Ares AI, automations ni las microapps.

**Nota:** Vercel `READY` verifica despliegue, no autentica pruebas de recuperación de datos, ni que una PWA ya instalada haya actualizado la caché.
