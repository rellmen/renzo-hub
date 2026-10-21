# RISE HUB — NOCTURNE ASCENDANCY · implementación UI

**Autor:** ChatGPT · **Fecha:** 21 octubre 2026  
**Rama:** \`feature/nocturne-ascendancy-ui\` · **Destino previsto:** \`staging\`  
**Estado:** implementación visual inicial; **NO desplegado ni verificado en navegadores reales**.

## Intención y dirección

Personal Command System: Luxury Tech × Dark Academia × futurismo cinematográfico.
La experiencia debe transmitir control, inteligencia, ambición, exclusividad y evolución personal:
**70 % sofisticación / 20 % tecnología / 10 % dramatismo cinematográfico**.

Se descartan neones saturados, componentes genéricos de SaaS, texto diminuto, decoraciones que bloquean contenido y gamificación infantil. No se convierte RISE HUB en Nodalys.

### Colores aprobados como dirección artística

| Rol | Hex | Aplicación |
| --- | --- | --- |
| Obsidiana | \`#111116\` | fondo y contraste |
| Borgoña imperial | \`#481D35\` | zonas premium, profundidad |
| Violeta imperial | \`#6149A6\` | acento tecnológico en superficies |
| Platino | \`#C5C9D4\` | jerarquía secundaria y tipografía |
| Oro antiguo | \`#C6A16C\` | logros, detalles y llamadas premium |
| Violeta interactivo | \`#BBA6EF\` | botones/foco legibles sobre fondos oscuros |
| Texto primario | \`#F2EDF5\` | contenido |

Los colores originales borgoña y violeta son **superficies**, no texto pequeño, para evitar contraste insuficiente.
Rojo/verde/ámbar de errores y confirmaciones siguen siendo *semánticos*, nunca se sustituyen por colores decorativos.

### Tipografía y movimiento

- **Manrope**, local, en cuerpo, formularios y datos técnicos.
- **Georgia**, tipografía editorial del sistema disponible sin nuevas dependencias, en los titulares clave.
- Transiciones discretas de 160–240 ms; sin animaciones si el usuario activa \`prefers-reduced-motion\`.
- En móvil, entradas de al menos 44 px y campos de 16 px para evitar zoom involuntario de iOS.
- Fondos y portadas encerrados en contenedores con \`overflow:hidden\` y \`isolation:isolate\`.

## Cambios realmente incluidos en esta rama

1. \`assets/nocturne-ascendancy.css\`: una capa independiente que respeta el HTML, JS y la persistencia actuales.
2. \`index.html\`: incluye el CSS después de las hojas existentes para asegurar precedencia; actualiza el copy del hero.
3. Identidad visual del shell, sidebar desktop, navegación inferior móvil y botón central Ares.
4. Portada más editorial con acentos vino y oro, titular propio y contraste elevado.
5. Tarjetas de herramientas con clipping de imágenes, overlays independientes, foco visible y variantes temáticas.
6. Cabeceras de páginas internas y acentos de Gym, Finance, SelfLearn, Skin, Food, Work, Ares y System.
7. Responsive 320–1440 px de intención; requiere capturas y pruebas para poder certificarse.

**No modifica** nombres de registro de microapps, funciones de guardado, consultas de Supabase, RLS, autenticación, cálculos de nómina, fotos, algoritmos ni sistemas de IA.

## Mapa de identidad por microapp (guía para siguiente fase)

| Módulo | Identidad | Color luminoso de interacción | Siguiente trabajo |
| --- | --- | --- | --- |
| Home | Nocturne Ascendancy | oro/violeta | pulir tarjetas y métricas reales |
| Ares Center | Imperial Intelligence | \`#BEA7EF\` | chat, autorizaciones, historial, errores reales |
| My Finance / Nóminas / Gastos | Obsidian Wealth | \`#E1C18B\` | tablas, importes, gráficos, privacidad |
| Gym · Ascend | Crimson Protocol | \`#DF939E\` | jugador de ejercicio, 80+ fichas, comparador |
| SelfLearn | Emerald Academy | \`#94CCB2\` | pantalla de idiomas, lecciones, repaso, persistencia |
| Skin Routine | Rose Quartz Atelier | \`#D9B2D0\` | día/noche, estante, progreso privado |
| Food | Sandstone Balance | \`#E1BE94\` | ingesta, gráficas, compras |
| Work | Platinum Command | \`#C5C9D4\` | proyectos, tareas, calendario |
| System | Graphite Vault | \`#BAC0D1\` | sincronización y controles verificables |

La propuesta es un *sistema visual*, no nueve temas desconectados; navegación, medidas táctiles, tipografía, layout y estados deben ser comunes.

## Gates pendientes de WORK / revisión final

Estas comprobaciones **no se han realizado en este entorno**, por lo que el PR permanece en draft:

- [ ] Ejecutar \`npm test\` y \`./scripts/renzo-hub preflight <PR>\` con registro de salida real.
- [ ] Revisar UI en Chromium y WebKit, 320/375/390/430/768/1440 px.
- [ ] Inspeccionar geometría: ningún elemento sobre otro; ninguna portada desborda su tarjeta; sin scroll lateral; navegación por teclado.
- [ ] Probar en iPhone/PWA: áreas seguras, barra inferior, teclado y recarga fría.
- [ ] Validar contrastes WCAG AA y modo de movimiento reducido.
- [ ] Autenticación y logout; guardar y reabrir sesiones Gym, comidas, rutina Skin, respuestas SelfLearn y movimientos financieros.
- [ ] Ares Center: funciones reales y estados informativos, sin afirmar herramientas simuladas.
- [ ] CI verde y prueba de cache de PWA: añadir el nuevo asset a \`sw.js\` y renovar el identificador de cache **por el dueño de integración (Claude/Work)**.
- [ ] Actualizar \`release.json\` y \`RENZO-HUB-CURRENT.md\` por el dueño de integración tras la revisión de cambios.
- [ ] Adjuntar capturas antes/después, SHA de rollback, fecha y resultado de pruebas reales.
- [ ] Solo con consentimiento explícito de Renzo: integrar a staging, verificar, y valorar lanzamiento a producción.

## Nota para colaboración

Esta implementación es **solo UI**. No se tocan \`sw.js\`, \`release.json\`, datos ni migraciones para evitar solapamiento con Claude; Work o el integrador debe cerrar estos puntos antes de aceptar el PR. No reutilizar el React de Lovable como sustitución de la app JS real.


## Adenda de integración del 21 de octubre — prevalece sobre el checklist anterior

La integración de PWA y release **sí se completó en esta rama después de redactar la versión inicial de este documento**. Por tanto quedan resueltos, a nivel de archivos GitHub, los puntos previos que decían «añadir CSS a `sw.js`», «avanzar versión» y «actualizar `RENZO-HUB-CURRENT.md`»:

- `sw.js`: precaché incluye `/assets/nocturne-ascendancy.css` y usa `renzo-hub-cloud-v58-nocturne-ascendancy`.
- `release.json`: 2.54.0 **propuesta**; `RENZO-HUB-CURRENT.md` actualizado; `manifest.webmanifest` e `index.html` tienen `#111116`.
- `tests/e2e/microapps-mobile-audit.mjs`: verifica geometría y clipping Nocturne en 320/390/768/1440 px (Chromium y WebKit); el test queda **pendiente de ejecución y resultado CI**.
- Fuente de verdad de checklist y traspaso QA: `docs/NOCTURNE-ASCENDANCY.md`.

Nada de lo anterior demuestra que staging, producción o la PWA instalada estén actualizados. **Mantener PR en draft** hasta pruebas reales y aprobación visual.
