# RISE HUB — UI vNext: contrato visual y funcional (diseño, NO release)
**21 octubre 2026 · Estado: base de diseño · solo rama `design/rise-hub-vnext-ui-foundations` y prototipo Lovable**

## Regla de oro
Este proyecto sustituirá de forma coherente **la interfaz y las pantallas internas** del RISE HUB real, NO la lógica de negocio, datos, autenticación, roles/RLS o historial de usuario. El prototipo React/Lovable no se copia como sustituto de la app real (vanilla JS + módulos). No se hace merge a `staging` ni `main` ni deployment de Vercel hasta revisión visual de cada módulo. El producto actual se mantiene utilizable.

**Incidente de referencia**: Home tenía tarjetas sin contenedor posicionado, imágenes `position:absolute` escapadas y navegación sobre contenido. Se prohíbe resolver estas cuestiones apilando reglas CSS; se reconstruyen componentes de forma aislada, con tests geométricos.

## Dirección artística
- **RISE HUB, personal operating system**: dark graphite premium, editorial, funcional; matiz lila aplicado a acciones y estados seleccionados, no fondos saturados; Solo Leveling como referencia de jerarquía/sofisticación, sin neón, partículas o ilustraciones invasivas.
- Tokens preliminares: background `#101014`, surface `#1A1A21`, elevated `#25252D`, border `#34343D`, text `#F5F3F1`, muted `#AFACB5`, primary `#B49AF5`, focus `#D4C4FF`; estados verde/ámbar/rojo reservados para semántica.
- Manrope / sistema, tipografía legible 12/14/16/18/22/28/36; cuerpo 16 px, interlineado 1.5. Base espaciado 4px. Radio 12/16/20. Elevaciones suaves.
- En móvil: padding 16–20 px, barra inferior fija **Hoy | Body | ARES | Learn | Más**, zona segura iOS sin tapar contenido, objetivo táctil >=44 px. Desktop: sidebar sin duplicar acciones y contenido máximo 1120px.
- Imaginería **siempre confinada** a `MediaFrame` con ratio, `overflow:hidden` y carga diferida. Para accesos de Home, preferir iconos o miniaturas contenidas, nunca fondos absolutos de pantalla.
- Estado vacío honesto, etiqueta *Demo* visible en prototipo, no mostrar cifras financieras ni historial personal ficticios como si fueran reales.

## Componentes obligatorios
`AppShell`, `TopBar`, `BottomNav`, `Sidebar`, `ModuleHeader`, `SectionHeader`, `NavigationCard`, `StatCard`, `ListRow`, `ActionButton`, `Tabs`, `ProgressStepper`, `FormField`, `NumberField`, `Calendar`, `MediaFrame`, `EmptyState`, `Skeleton`, `ErrorState`, `ConfirmDialog`, `BottomSheet`, `Toast`, `DataSourceStatus`. Variantes y tamaños deben funcionar en pantallas a 320, 375, 390, 430, 768 y 1440 px, con teclado, enfoque visible, reduce-motion y contraste AA.

## Mapa completo de pantalla y detalle
| Área | Pantallas internas a diseñar | Contrato funcional de la aplicación real |
|---|---|---|
| **Hoy** | Resumen del día, prioridades, quests, progreso y accesos | No inventar métricas; rutas a módulos; tarjetas estables y scrolleables |
| **Body** | Vista general, Gym, Food, Skin | Resúmenes verdaderos y navegación sin duplicados |
| **Gym** | Plan semanal, entrenamiento activo, lista de ejercicios, series/peso/RIR, superseries, timer de descanso, técnica, biblioteca >=80, progreso de fuerza, volumen, recuperación, fotos privadas y comparador, resumen final | Preservar guardado de series, cálculos, temporizador, fotos, XP e historial |
| **Food** | Hoy, ingesta, comidas, objetivos, compra y edición | Mantener registros, lista de compra y estados vacíos |
| **Skin** | Hoy y rutina AM/PM, pasos, plan/calendario, inventario, productos, fotografías y evolución | Mantener checks, productos existentes y privacidad |
| **Learn / SelfLearn** | Dashboard de idiomas; neerlandés A0–B2 e inglés hasta C1; mapa de lecciones; player paso a paso; listening/speaking/writing; gramática; repaso FSRS; diagnóstico; tutor; progreso | **Solo idiomas**. Progreso tras cada respuesta, persistencia, XP, FSRS y retomar sesión; UX sin falsas finalizaciones |
| **ARES** | Centro, chat, historial, contexto y permisos, estado de operaciones y aprobaciones *solo ilustrativas cuando no estén implementadas* | Mantener comportamiento real sin fingir herramientas/automatizaciones activas |
| **Finanzas** | Dashboard, movimientos, ingresos, gastos, nóminas, importaciones, detalles y categorías | Estado vacío honesto, formatos monetarios, importes y privacidad; nunca cambiar cálculos |
| **Trabajo** | Proyectos, tareas, horas/turnos, calendario, registros y revisión | Los pluses requieren reglas verificadas; no inventar salarios |
| **Personal** | Notas (lista/editor), News (feed/empty), coche (resumen/mantenimiento) | Estados honestos, guardar solo donde la app real soporte |
| **Sistema** | Cuenta, autenticación, sincronización, privacidad, diagnósticos y ajustes | No introducir RLS bypass, no mostrar secretos |
| **Microapps adicionales** | Nóminas, Gastos, Ares Center, notas y cualquier microapp detectada en `microapps/registry.js` | Preservar IDs, deep links, `mount`, `load/open/close/reset`, tab names, service worker |

### Diseño no es funcionalidad
Lovable tiene pantallas con estado efímero y métricas de demo. No tiene permiso para conectar Supabase real ni para atribuirse funcionalidades que estén ausentes en producción. El código React resultante sirve como **especificación interactiva** y fuente de tokens, espaciados, estados y flujos; el traslado a `rellmen/renzo-hub` se implementa sobre los módulos existentes.

## Etapas y evidencia de aceptación
1. **Inventario y tokens**: matriz de subpantallas + librería de componentes con ejemplos y estados.
2. **Navegación y dashboards**: Hoy, Body, More y shell; navegación sin superposiciones.
3. **Interiores funcionales**: Gym/Food/Skin; revisiones de controles, formularios, ayuda y gráficos.
4. **Aprendizaje y asistente**: SelfLearn completo y ARES con estados explícitos.
5. **Finanzas, trabajo, sistema y utilidades**: sin falsear datos.
6. **Pruebas de diseño**: screenshots y geometría para TODAS las pantallas/subpantallas por navegador/tamaño + pruebas de interacción y accesibilidad.
7. **Porting controlado**: subcomponentes reales; pruebas de regresión de persistencia/auth/RLS/finanzas; preview en Vercel, aprobación visual, solo entonces publicar.

### Gate de publicación
Bloquear release si falta evidencia visual a 390 px iPhone, si un elemento invade otro, hay scroll lateral, la barra tapa controles, una microapp queda como placeholder, se rompe guardar/cargar, se presenta mock como dato real o CI está rojo. Toda entrega debe registrar cambios, fotos de antes/después y SHA de posible rollback.

## Referencias de trabajo
- Lovable: proyecto `8698f153-f1ae-4d00-92fd-7ed2eb6718f2` (Renzo Sandbox), solo prototipo.
- App real: repo `rellmen/renzo-hub`; `microapps/registry.js`, `docs/MICROAPPS.md`.
- Motivo: el hotfix #121 pasó CI pero el resultado visual en iPhone seguía sin ser aceptable; no repetir esa metodología.
