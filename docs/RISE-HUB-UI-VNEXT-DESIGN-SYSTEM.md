# RISE HUB · UI vNext — Fundamentos y contrato de rediseño integral

Estado: **propuesta de diseño, sin implementar**.
Destino de trabajo: rama de diseño aislada; no modificar `main`, despliegues Vercel, Supabase ni los datos del usuario sin las correspondientes validaciones.
Fecha: 21 de octubre de 2026.

## 0. Decisión de alcance

Se rediseña **la aplicación completa, incluyendo cada pantalla interna, formulario, estado de carga, diálogo y navegación de todas sus microapps**. No basta con cambiar Home, nombres, iconos, fuentes o botones. Se preserva el comportamiento probado y la persistencia de los datos reales.

Queda fuera del alcance añadir funcionalidades de backend, activar automatizaciones Ares/n8n, migrar a React o sustituir los servicios existentes. Tales iniciativas necesitarían un proyecto técnico independiente.

### Hallazgo del incidente actual

- La Home cambió el contenedor `.home-apps.rise-areas` por `.rise-home-shortcuts` sin migrar todas sus reglas.
- `.rise-area-cover` permaneció con `position:absolute` y rompió el aislamiento de la tarjeta en iPhone.
- Un parche CSS posterior no resolvió la experiencia reportada por el usuario.
- Existen varias hojas CSS con sistemas de estilos contradictorios: `index.html` (inline), `assets/rise-theme.css`, `assets/rise-editorial.css`, `assets/rise-home.css`, `assets/rise-microapps-air.css`, CSS de cada microapp y overrides posteriores. Selectores `html body #...` elevan la especificidad y dificultan predecir el resultado.
- CI verde no demuestra diseño visual correcto; algunas E2E simulan Supabase.

**Regla nueva:** no corregir mediante otra capa de overrides sobre estilos contradictorios. Rehacer la presentación desde componentes y contratos verificables.

## 1. Concepto de producto

**RISE HUB / Personal OS**, herramienta privada de productividad, aprendizaje, bienestar y finanzas. Estética `Dark Precision`: grafito editorial, superficies sólidas, acento violeta moderado, tipografía legible, densidad controlada; un toque de personalidad inspirado en progresión/RPG sólo en indicadores de nivel, no en el layout principal.

Adjetivos de diseño: profesional, preciso, sobrio, rápido, comprensible, personal.

Principios obligatorios:
1. Los datos importan más que la decoración.
2. Cada pantalla responde «¿dónde estoy?», «¿qué puedo hacer?» y «¿qué cambió?» sin exploración.
3. Sólo un CTA primario por pantalla o estado.
4. Cada módulo tiene identidad funcional, pero no crea su propio idioma visual.
5. Nada inventado: cifras, progreso, recordatorios, conexiones y estados proceden de datos reales o se marcan como demo.
6. Diseño móvil primero; escritorio aprovecha el espacio sin escalar simplemente la vista móvil.
7. Todo cambio visual respeta contratos de datos, rutas y accesibilidad.

## 2. Tokens iniciales (propuesta por validar)

| Rol | Valor |
| --- | --- |
| bg/canvas | #0E0F12 |
| bg/surface | #18191E |
| bg/raised | #22242B |
| border/subtle | #34363D |
| text/primary | #F5F5F7 |
| text/secondary | #B5B6BD |
| text/quiet | #92949F |
| action/primary | #B49CFF |
| action/soft | #2E2845 |
| feedback/success | #65D6A0 |
| feedback/warning | #F1C474 |
| feedback/error | #EF8C96 |

- Fuente base: Manrope (la app ya la incluye), sin depender de imágenes para comunicar navegación o información.
- Escala tipográfica: 12 / 14 / 16 / 20 / 24 / 32; contenido habitual 14–16; inputs móviles >=16.
- Ritmo espacial: 4 / 8 / 12 / 16 / 24 / 32; se evita mezclar márgenes arbitrarios.
- Radios: 12 controles, 16 tarjetas, 20 paneles destacados.
- Targets táctiles >=44 × 44 px; texto contraste objetivo WCAG AA (4.5:1 para texto normal).
- Motion 140–220 ms; respetar `prefers-reduced-motion`.
- Tarjetas sólidas o con textura muy sutil. Portadas opcionales y SIEMPRE contenidas en un componente; nada de fotos grandes detrás de varios cards.
- Todos los iconos proceden de un set coherente, con etiquetas accesibles. No variar aleatoriamente entre emoji, SVG y símbolos.

## 3. Arquitectura de navegación

### Móvil
Barra inferior fija con **Hoy · Body · ARES · Learn · Más**. ARES puede ir centrado y destacado sin tapar contenido. Safe-area de iOS y margen inferior del contenido calculado. `Más` es índice organizado, no una pantalla caótica.

La navegación interna usa: breadcrumb/botón regresar, título, subtítulo de contexto, pestañas locales cuando aporten valor. Nunca duplicar dos barras de navegación que compitan.

### Desktop
Sidebar persistente (ancho de referencia ~240 px), cabecera contextual, contenido máximo 1200 px y panel lateral sólo para datos relevantes. No transformar la barra móvil en un elemento gigante.

### Reglas
- No enlaces que aparentan abrir una app inexistente.
- `data-open` y deep links deben mantenerse; el menú visual no debe modificar IDs canónicos.
- Las microapps fullscreen mantienen vuelta consistente al área de origen.
- Buscar y navegación por teclado: preservar accesos y `aria-current`.
- Historial del navegador y volver atrás deben funcionar.

## 4. Pantallas y estados que hay que diseñar (OBLIGATORIOS)

### A. Hoy / Home
1. Header compacto: saludo contextual + fecha + búsqueda.
2. «Tu siguiente acción»: sólo una tarea relevante derivada de datos reales; si no hay datos, invitación neutral.
3. Resumen del día: trabajo, aprendizaje, bienestar y dinero, sólo los módulos que tengan datos. Sin métricas ficticias.
4. Accesos a microapps: cuadrícula ordenada de tarjetas compactas, no fondos panorámicos superpuestos.
5. Alertas reales o pendientes accionables, claramente separadas del dashboard.
6. Estados vacíos y carga; en 320–430 px ninguna portada o control puede salir de su contenedor.

### B. Body
1. Dashboard de bienestar y accesos `Gym`, `Food`, `Skin`, sin gráficos de relleno.
2. Gym — Inicio: rutina de hoy, progreso semanal, CTA iniciar sesión.
3. Gym — Sesión activa: ejercicio, series, repeticiones, peso, descansos y acciones con una mano.
4. Gym — Historial/progresión: gráficos legibles, récords, filtros, evitar overload.
5. Gym — Biblioteca/plan editor: búsqueda, técnica, selección, onboarding y configuración.
6. Gym — Fotos y comparador: privacidad explícita, vista clara, borrado con confirmación.
7. Food — Hoy: consumo y objetivos, registro rápido, desglose.
8. Food — Planificación y lista de compra: estados comprados, cantidades, filtros.
9. Skin — Hoy: Mañana/Noche, secuencia de productos y completado real.
10. Skin — Inventario, calendario, notas y progreso: prioridad al estado de barrera, no promover incompatibilidades.
11. Gym/Food/Skin: formularios, errores, guardado, cargas, sin conexión.

### C. SelfLearn
1. Panel de idiomas: NL y EN, niveles individuales y metas reales, racha y próximo repaso.
2. Mapa de cursos y unidades.
3. Reproductor de lección: una pregunta/acción principal por paso, progreso visible y feedback claro.
4. Revisión/FSRS, laboratorio/práctica, tutor, diagnóstico y ajustes de aprendizaje.
5. Estado «Guardando», «Guardado», «Pendiente de sincronizar» y «Error», ligado al resultado real; jamás afirmar sincronización sin confirmación.
6. Reanudar lección tras cierre de sesión, otra pestaña u otro dispositivo. No mezclar SQL/Power BI en el aprendizaje de idiomas.

### D. ARES
1. Chat privado: conversación, sugerencias, historial y fuentes.
2. Ares Center: panorámica de proyectos, actividad, bandeja de entrada y aprobaciones.
3. Acciones propuestas vs ejecutadas claramente diferenciadas. Operaciones sensibles con confirmación.
4. Chat móvil con teclado: input visible, cerrar/salir, scroll, error/reintentar y sin solapamiento con barra inferior.
5. Las capacidades no implementadas se muestran como futuras, no como funcionales.

### E. Finanzas y nóminas
1. Resumen financiero con fecha y fuente de datos.
2. Gastos: movimientos, categorías, búsqueda, filtros e importación.
3. Presupuestos, tendencias y estados vacíos. Cifras bancarias vs manuales diferenciadas; no duplicar importes.
4. Nóminas: lista de documentos, detalle, revisión, importación y conciliación.
5. Registro de horas/turnos (si la ruta funcional existe): entradas, extras, complementos, descansos no pagados, edición y errores.
6. Privacidad, formateo EUR y carga siempre visibles.

### F. Trabajo, proyectos y utilidades
1. Work: proyectos, tareas, carrera, roadmap, calendario / vista de actividad según funcionalidad ya existente.
2. Notes: lista, editor y detalle, guardar y borrar con confirmación.
3. News: timeline, filtros por fuente y lectura de detalles.
4. Car: costes, registros y gastos, en estados reales.
5. System/Settings: cuenta, sincronización, exportación, privacidad, errores y estado de conexión.
6. `Más`: navegación agrupada, búsqueda de herramientas, enlaces externos identificados.

### G. Estados comunes por pantalla
- Sin datos / primera vez.
- Cargando / skeleton.
- Error / reintento.
- Guardando / éxito confirmado / fallo.
- Sin conexión / reintentar al recuperar red.
- Vacío por filtros.
- Dialogo destructivo / confirmación / deshacer si procede.
- Focus, hover, active, disabled, selected.
- Permisos insuficientes / sesión caducada.

## 5. Librería de componentes única

Ubicación propuesta (no creada todavía):
`ui/vnext/tokens.css`, `ui/vnext/shell.css`, `ui/vnext/components.css`, `ui/vnext/states.css`,
`ui/vnext/components.js` y estilos por microapp en sus directorios.

Componentes canónicos:
- `AppShell`, `BottomNav`, `SidebarNav`, `PageHeader`, `SectionHeader`, `BackLink`
- `Card`, `ActionCard`, `MetricCard`, `StatusIndicator`, `Notice`
- `Tabs`, `SegmentedControl`, `FilterBar`, `SearchField`, `FormField`
- `PrimaryButton`, `SecondaryButton`, `IconButton`, `ConfirmDialog`, `BottomSheet`
- `EmptyState`, `LoadingState`, `ErrorState`, `SyncStatus`
- `ListRow`, `ActivityTimeline`, `ProgressBar`, `ChartFrame`, `DataTable`

La implementación real puede usar vanilla JS y HTML semántico reutilizable, preservando el router actual. No requiere reescribir Supabase, motores de estudio ni lógica de gimnasio. Se debe eliminar gradualmente el CSS legacy a medida que cada componente pase a vNext, evitando apilar overrides.

## 6. Proceso obligatorio y orden de ejecución

**Etapa D0 · Diseño (sin código de producto):** inventario de pantallas y flujo; mapear todas las clases y CSS heredados; definición de tokens; Figma/maquetas de móvil y escritorio de Home, Gym, SelfLearn, Ares, Finanzas; aprobar dirección visual y sistema de componentes.

**Etapa D1 · Sistema base:** AppShell, navegación, tipografía, tarjetas, botones, estados, layout. Construir con CSS aislado, sin sustituir motores de microapps.

**Etapa D2 · Rediseño de pantallas completas:** Home, Body+Gym+Food+Skin, Learn, Ares, Finanzas/Nóminas/Gastos, Work+Notes+News+Car+Settings. Todas sus subpantallas, modales y formularios. No declarar módulo completo sólo por rediseñar su portada.

**Etapa D3 · QA funcional y visual:** CI, capturas reales en Chromium/WebKit 320/375/390/430/768/1024/1440, teclado iOS, estados, overflow, contraste, scroll, redes lentas, regresiones. Probar también con usuarios de prueba autenticados y Supabase real de staging; comprobar persistencia SelfLearn tras cerrar sesión y recuperar en otro dispositivo.

**Etapa D4 · Release controlado:** preview funcional con SHA fijado, revisión visual aprobada, comparar con baseline, documentar rollback, merge a main, confirmar alias real de Vercel y smoke postdeploy. Cualquier desviación crítica impide lanzamiento. No publicar por CI verde solamente.

## 7. Criterios de aceptación NO NEGOCIABLES

- 100 % de rutas y subpantallas contempladas en inventario.
- No imágenes / fondos que escapen de la tarjeta o queden superpuestos, validado geométricamente.
- No scroll horizontal global entre 320 y 1440 px salvo carriles explícitos.
- Barra inferior nunca tapa último elemento interactivo ni teclado.
- Capturas de Home, Gym en sesión, Food, Skin, SelfLearn lección, Ares con teclado, Finance y ajustes aprobadas.
- Contraste, targets táctiles y accesibilidad de teclado.
- Datos y permisos preservados; no hay borrado del progreso ni registros duplicados.
- Guardado y recuperación en SelfLearn, Gym, Food, Skin y Finance usando Supabase de pruebas real, además de mocks.
- Aplicación sin nuevos errores fatales en consola y red.
- Despliegue sólo tras revisar capturas comparativas reales, nunca sólo código y tests.

## 8. Estado y decisiones pendientes

Este documento **no modifica la UI actual**. Falta decidir visualmente la dirección Dark Precision y aprobar diseños de referencia antes de iniciar la reimplementación.

El propósito es acabar con el patrón «parche de CSS → CI verde → producción → interfaz rota» y sustituirlo por «diseño aprobado → componentes → pantallas completas → QA visual y funcional → release».
