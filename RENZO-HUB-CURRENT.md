# RISE HUB (antes Renzo Hub) · versión vigente

## 2.41.1 (2026-10-18) · Acceso directo al CRM de Nodalys · preparado para staging

- Work → "Accesos externos": tarjeta que abre el CRM de Nodalys en claude.ai en una pestaña nueva. Es solo un enlace: sin código, datos, credenciales ni agentes de Nodalys en RISE HUB (se mantiene la separación de AGENTS.md).
- Caché `renzo-hub-cloud-v44-crm-link`; sin migraciones ni cambios de configuración.

## 2.41.0 (2026-10-18) · Contexto personal autorizado · preparado para staging

- Datos privados sincronizados exclusivamente en las tablas existentes de producción, con procedencia y fecha; sin migraciones, cambios de permisos ni copia de datos a staging. Los valores y las copias previas quedan fuera de Git.
- Nuevo tipo `personal_fact`: separa declaraciones confirmadas, referencias históricas, identificaciones fotográficas y datos pendientes. No genera saldos, pagos, sesiones, niveles ni certificados.
- Paneles privados en Perfil/System, My Finance, Work, SelfLearn, Gym y Skin. Ares usa esas mismas fuentes con filtros por propietario y respuestas locales para temas personales; no amplía el acceso del proveedor externo.
- Conserva registros, vocabulario, preferencias y sesiones de SelfLearn. Añade soporte para guardar la meta de inglés en el contexto existente de perfil.
- Verificación local: 285 tests unitarios; E2E de contexto privado (0 POSTs a IA externa), SelfLearn y Ares en móvil/escritorio. Pruebas de lectura e inserción/actualización entre propietarios ejecutadas contra la base real y revertidas.
- Producción comprobada: 2.36.1, commit `80739b24eebb1c4db93f99fb3af38f7c7cf0ad1c`, Vercel `READY`. Staging comprobado: 2.39.0. Esta versión 2.41.0 todavía no está desplegada.
- Caché `renzo-hub-cloud-v43-confirmed-context`; alcance y límites en `docs/CONFIRMED-CONTEXT.md`.

## 2.40.0 (2026-10-18) · Ares fácil de cerrar en el móvil y microapps con más aire · PR hacia staging (sin desplegar)

- **Ares AI en el móvil:** botón **Salir** grande a la izquierda de la cabecera (zona del pulgar) además del ✕; la cabecera queda por debajo de la barra de estado del iPhone (la app usa `black-translucent`, antes el ✕ quedaba debajo de la hora y la isla). La barra inferior sigue visible encima del chat y su botón central es un **interruptor** (abre y cierra, con `aria-expanded`); tocar otra sección de la barra cierra Ares y la abre. Con el teclado abierto la barra se oculta y el chat ocupa la zona visible. Escape, ✕ y "atrás" siguen funcionando y los mensajes se conservan.
- **Microapps con más aire** (`assets/rise-microapps-air.css`, se carga la última y solo afecta a la microapp abierta, nunca a Home ni a la navegación): tarjetas con 20 px de margen interior en móvil y 28 px en escritorio, más separación entre bloques, textos pequeños a 12–13 px (antes había de 10,5–11 px), interlineado 1,55–1,6, botones de al menos 44 px, desplegables de 48 px y campos de formulario de 48 px con letra de 16 px (evita el zoom de iOS). Medido a 390 px: textos < 12 px pasan de 231 a 0 en las 14 secciones; sin scroll horizontal.
- Trae al repo lo hecho en el prototipo de Lovable (18 oct) re-implementado en CSS propio, sin cambiar estructura, datos ni comportamiento. Toca la presentación de Gym, Skin, Food y SelfLearn (áreas de ChatGPT) solo a través de esta capa común: avisado en `docs/COLABORACION-IA.md`.
- E2E nuevo `tests/e2e/ares-mobile-exit.mjs` (Chromium y WebKit, en CI). Caché `renzo-hub-cloud-v42-ares-air`. Sin migraciones ni cambios de esquema.

## 2.39.0 (2026-10-18) · Versión unificada: producción + staging · PR hacia staging (sin desplegar)

- **Por qué:** el PR #83 publicó en producción (2.36.1) la interfaz editorial con correcciones de QA, sin pasar por staging. Staging tenía esa misma interfaz más SelfLearn 3 y el Gym completo (2.34–2.38). Hacía falta unir las dos ramas antes de que staging pueda pasar a main.
- **Se conserva de producción:** búsqueda ⌘K accesible (combobox, opción activa visible, "Sin resultados" anunciado) y sin abrir Ares a la vez, retorno de foco de Ares, launcher de Ares visible dentro de las microapps, portada exacta de Lovable (`editorial-v2.jpg`), iconos sin reflejos desbordados y sus pruebas E2E de navegación.
- **Se conserva de staging:** todo SelfLearn 3 y el Gym 2.36–2.38; la búsqueda mantiene la pista "Neerlandés A0–B2 e inglés B1–C2".
- Caché `renzo-hub-cloud-v41-unified` (unión de los recursos de ambas). Sin migraciones ni cambios de esquema.

## 2.38.0 (2026-10-18) · Gym terminado: pack final · PR hacia staging (sin desplegar)

- **Calentamiento automático** en compuestos (barra vacía × 8 → 60 % × 5 → 80 % × 3; en máquina 50 % × 8 → 75 % × 4). No se anota ni cuenta en volumen ni récords.
- **Gráfica de fuerza** en cada ejercicio de la sesión: evolución del e1RM por sesión y cambio en las últimas 4 semanas ("↑ 4,3 % en 28 días"; "= sin cambios" si no se mueve).
- **Superseries**: casilla "Superserie con el siguiente" en el editor de rutinas (se guarda como 7.º campo del ejercicio, sin cambios de esquema). En la sesión se marcan A1/A2 y, tras una serie de A1, no salta el descanso: "pasa a A2 sin descanso".
- **Cambiar ejercicio en mitad de la sesión** (máquina ocupada o molestia): alternativas del mismo patrón y músculo, recalcula la sugerencia con tu historial de ese ejercicio. Solo en esa sesión, la rutina no cambia; no se permite si ya hay series hechas.
- **Pantalla encendida** durante la sesión (Screen Wake Lock); se suelta al terminar o salir de Entrenar.
- **Semana de descarga**: aviso si llevas ≥6 semanas seguidas con 2+ sesiones o si ≥2 compuestos llevan 3 sesiones sin superar su récord. Al activarla, las sesiones de esa semana llevan la mitad de series y −10 % de carga; caduca sola el lunes.
- **Balance semanal por músculo** en Progreso: series de esta semana frente al rango orientativo 10–20, con la semana pasada entre paréntesis.
- **Recordatorio de foto de progreso** cada 4 semanas en Entrenar, con "Ahora no" (7 días).
- Nuevos módulos `microapps/gym/coach.js` (funciones puras) y `wake-lock.js`. Tests: 280 unitarios (5 nuevos en `tests/gym-coach.test.mjs`) y E2E `gym-symmetry.mjs` ampliado en Chromium y WebKit. Caché `renzo-hub-cloud-v40-gym-final`.

## 2.37.0 (2026-10-18) · Gym completo: fotos, rutina por preguntas y biblioteca 107 · PR hacia staging (sin desplegar)

- **Fotos de progreso privadas** (`photos-view.js` + `progress-photos.js`): subir con fecha y pose (frontal, lateral, espalda), galería por pose y **comparador antes/después con deslizador** ("12 semanas de diferencia"). Antes de subir, la foto se reduce a 1600 px y se vuelve a guardar en JPEG en el propio móvil, lo que **borra los datos EXIF y la ubicación GPS**. Bucket privado existente `progress-photos`, carpeta `<usuario>/gym/` (Skin sigue en `<usuario>/skin/`), enlaces firmados de 5 min, borrar con confirmación. Sin migraciones: fecha y pose van en el nombre del archivo.
- **Rutina con 3 preguntas** en Rutinas (días 2–5, gimnasio completo o solo máquinas, objetivo músculo/fuerza/salud): enseña la propuesta de cinco días, la carga como borrador y **solo se guarda al pulsar Guardar rutina**. Corrige la base de ChatGPT: el objetivo ocupaba el campo de cardio y los compuestos no estaban marcados (afectaba a progresión y descanso).
- **Biblioteca de 107 ejercicios** con técnica (3 claves + error típico), músculo y equipamiento; el editor la agrupa por músculo. Rangos revisados: patrones nuevos (zancadas, press cerrado, press con mancuernas de hombro, remo al mentón, encogimientos, patada de tríceps) y arreglos de orden (gemelos en prensa, deltoide posterior con mancuernas). Dominadas, flexiones, planchas y fondos con el propio peso **no reciben rango** (el kg anotado no es la carga real).
- Tests: 275 unitarios (3 nuevos) y E2E `gym-symmetry.mjs` ampliado (rutina por preguntas sin guardar hasta confirmar, subir dos fotos, JPEG 1600 px, comparador, borrar). Caché `renzo-hub-cloud-v39-gym-complete`.

## 2.36.1 (2026-10-18) · Publicación selectiva del diseño editorial

- Preparado, todavía no publicado: traslada exclusivamente la integración visual de PR #78 (f31cf4c y 5f977d0) sobre producción 3124b70. No incorpora las ampliaciones posteriores de Gym/SelfLearn de staging.
- Marca R v2, Manrope local, grafito/marfil/iris, dashboard editorial y navegación con Ares y búsqueda. Conserva autenticación, datos, APIs, microapps y funciones actuales de main.
- Caché `renzo-hub-cloud-v39-editorial-production`; sin migraciones ni cambios de configuración. QA local verificado y alcance en `docs/RISE-EDITORIAL-RELEASE.md`; falta confirmar CI y despliegue antes de afirmar publicación.

## 2.36.0 (2026-10-17) · Gym tipo Symmetry (Claude + ChatGPT en `feature/gym-symmetry`, issue #79) · PR hacia staging (sin desplegar)

- **Progresión automática** (`microapps/gym/progression.js`): al iniciar la sesión cada serie llega precargada con el peso y las reps sugeridas (doble progresión con RIR objetivo: compuestos 2, aislamiento 1; +2,5 kg / +1,25 kg; descarga del 5 % si las reps caen por debajo del mínimo). Cada ejercicio muestra el motivo ("Sube carga", "Suma reps", "Descarga") y tu récord estimado (e1RM Epley, solo series de hasta 12 reps).
- **Rangos Hierro → Bronce → Plata → Oro → Platino → Diamante → Élite** con subniveles 1–3 (`ranks.js`), por ejercicio y por músculo, a partir de e1RM ÷ peso corporal con estándares orientativos por patrón de movimiento. Pestaña **Rangos** con rango global, **mapa corporal coloreado por rango** y "te faltan X kg para el siguiente".
- **Registro sin distracciones:** técnica de cada ejercicio (3 claves + error típico, 35 ejercicios, `exercise-info.js`), calculadora de discos por lado (barra olímpica, EZ 10 kg), **temporizador de descanso automático** al guardar una serie (150 s compuestos / 90 s aislamiento, −15/+15/Saltar, vibración y aviso sonoro, sobrevive a recargas), **aviso de récord** al momento y **resumen al terminar** (series, volumen, minutos, récords).
- **Pestañas simplificadas:** Entrenar, Rangos, Fuerza, Progreso, Rutinas + menú "Más" (Fotos de progreso, Objetivos, Medidas, Historial, Volumen, Recuperación, Lados, Turnos, Coach).
- **ChatGPT:** generador de plan por onboarding (`onboarding.js`) y API privada de fotos de progreso (`progress-photos.js`, bucket privado existente, URLs firmadas de 60 s). Su interfaz de fotos y el onboarding en Rutinas se integran en esta misma rama; mientras tanto, "Fotos de progreso" muestra "En preparación".
- Sin cambios de esquema ni migraciones. Tests: 272 unitarios (5 nuevos de Gym) y E2E `tests/e2e/gym-symmetry.mjs` (precarga 60×10 → 62,5×6, técnica, discos, récord + descanso, resumen, rangos y mapa, 390 px sin scroll horizontal). Caché `renzo-hub-cloud-v38-gym-symmetry`.

## 2.35.1 (2026-10-17) · Ajuste "elegante y sofisticado" sobre 2.35.0

- Barra de navegación sobria: iconos marfil de 24 px con relleno muy suave, activo en iris sobre grafito, Ares como pieza iris cuadrada; se quitan las pastillas de colores por área.
- Home como en Lovable: "Lo importante, hoy." y "El progreso es personal." en bloques editoriales sin tarjetas, nivel en número grande iris; en escritorio, dos columnas.
- Búsqueda rápida **⌘K / Ctrl+K** (`microapps/command/palette.js`) y botón Buscar en Home: navega a cualquier área o microapp del registro.
- 267 tests unitarios (1 nuevo); E2E completos OK. Caché `renzo-hub-cloud-v37-editorial`.

## 2.35.0 (2026-10-17) · Interfaz editorial (Lovable) + barra de navegación nueva · PR hacia staging (sin desplegar)

- **Origen:** rediseño hecho por ChatGPT en Lovable ("Renzo Sandbox", commit `352f46f`, prototipo con datos simulados). Se re-implementa su lenguaje visual en CSS propio sobre la app real; no se copia código React ni datos mock.
- **Sistema editorial** (`assets/rise-editorial.css`, se carga la última): grafito `#151516`, marfil `#f0ece3`, acento iris `#baa3fe`, tipografía **Manrope** auto-alojada (`assets/fonts/`, la CSP no permite fuentes externas), superficies sobrias sin neón, radios de 10–14 px. Paleta azul anterior remapeada en `rise-covers`, `rise-home`, `ares-chat`, `finance` y `gastos`.
- **Marca:** monograma "R" v2 de Lovable (`assets/rise-monogram-v2.svg`) en login, barra lateral, favicon e iconos PWA v2 (192/512/maskable/180) generados del SVG.
- **Home:** hero editorial ("Un buen día empieza con claridad."), Áreas en rejilla editorial con miniatura (las portadas se conservan).
- **Barra de navegación:** iconos bicolor (relleno suave + trazo) a 24 px dentro de una pastilla con el color de cada área, etiqueta más legible, estado activo con brillo; **Ares AI como orbe central** (sustituye al botón flotante cuando hay sesión). Móvil: barra flotante con desenfoque, 7 accesos sin perder ninguno. Escritorio: barra lateral con Ares bajo Home.
- Tests: 266 unitarios OK; E2E smoke, caché PWA v36 (Chromium/WebKit), nóminas, finanzas, auditoría móvil 16 secciones × 2 motores, SelfLearn, Ares chat y Ares center OK. Caché `renzo-hub-cloud-v36-editorial`.

## 2.34.0 (2026-10-17) · SelfLearn 3: tipo Babbel + progreso que sí se guarda · PR hacia staging (sin desplegar)

- **Causas de "no se guarda mi progreso" (corregidas):** el quiz solo se guardaba al pulsar "Guardar intento" al final; con 5 min hacía falta 4/4 (umbral 80 % sobre 4 preguntas); "Marcar clase completada" no contaba para la ruta; al recargar, el estado de la nube pisaba al local aunque fuera más nuevo; y una copia local más nueva de un registro (p. ej. un repaso FSRS sin conexión) se perdía frente a la de la nube.
- **Ahora:** la lección se guarda tras cada respuesta (local al instante, Supabase agrupado en 1,2 s y forzado al cerrar u ocultar la app) en `hub_user_state.state.learningRuns`; al volver aparece "Lección en curso · Continuar". Gana la versión con la última respuesta entre dispositivos.
- **Lecciones tipo Babbel:** palabra nueva con audio y ejemplo → comprobación → gramática → emparejar → escuchar → completar huecos → ordenar frase con fichas → escribir (tolera artículo, acentos y una errata) → diálogo → (20 min) hablar con dictado voluntario. Los fallos se repiten al final; la lección se completa siempre (la nota es aciertos a la primera). Palabras al repaso FSRS; las falladas quedan para hoy.
- **Cursos:** Nederlands A0→B2 (63 lecciones, conserva los 33 IDs antiguos y su progreso) y English B1→C2 (44), personalizados (Brabante, inventario y turnos, gimnasio, finanzas, camino a datos, entrevistas internacionales). Preferencias, diagnóstico y sesión a medias independientes por curso.
- **Sincronización más ligera para todo RISE HUB:** `world.js` solo sube los registros nuevos o cambiados (antes reenviaba todos en cada guardado); "Sincronizar ahora" sigue forzando el envío completo. Sin migraciones.
- Tests: 266 unitarios OK (10 de SelfLearn), E2E `tests/e2e/selflearn.mjs` reescrito (recarga a mitad de lección sin copia local, fallo repetido, inglés independiente, repaso, diagnóstico, 390 px sin scroll horizontal). Caché `renzo-hub-cloud-v35-selflearn`.

## 2.33.0 (2026-10-17) · Release agrupada: My Finance completo + Gym Ascend (rama de ChatGPT `release/gym-ascend-bundle`) + arreglos · PR #74 a staging

- Integra `release/gym-ascend-bundle` (#75: registro rápido de series y editor de rutinas) para publicar todo en un solo lote, según `docs/RELEASE_POLICY.md` (límite diario de Vercel Hobby). Caché `renzo-hub-cloud-v27-rise-finance-gym`.

- **Patrimonio** (panel del Resumen): saldo de cierre de cada cuenta desde el último extracto (ING y Revolut, también con varios movimientos el mismo día), inversiones y deudas como valoraciones con fecha (`hub_records` money/`money_asset`, nunca se sobrescriben), patrimonio neto y evolución mensual; valores de más de 45 días marcados como antiguos.
- **Objetivos**: fondo de emergencia (N meses de gastos fijos reales frente al saldo), meta con fecha (ahorro real desde el mes de inicio y € por semana hasta el plazo) y aporte mensual a inversión (`money_goal`; "Archivar" sin borrar).
- Categoría nueva **Aporte a inversión** (Trade Republic, DEGIRO, Scalable, etc.): es traspaso, no gasto.
- **Ares AI**: en móvil ya no reabre el teclado al terminar cada respuesta (tapaba el botón de cerrar), el panel se ajusta al teclado y "atrás" cierra el chat.
- Portadas de microapps: `overflow-x: clip` (la animación de apertura creaba 2 px de scroll horizontal).
- Tests: 219 unitarios (6 nuevos), E2E `finance-complete` (Chromium y WebKit) y `ares-ai-chat` ampliado. Caché `renzo-hub-cloud-v25-finance-completa` (incluye los módulos Gym fusionados directamente en `main`, #67 a #72). Sin migraciones.

## 2.29.4 → 2.31.0 (2026-10-16) · Fase 1 cerrada, fase 2A en producción
- 2.29.4: arreglo CET/CEST (#59) y lector `Loon overwerkuren`, caché v16 (#60, #61). 2.30.0: fase 1 cerrada en el plan (#64). 2.31.0: "Ingresos del mes" nómina ↔ banco sin duplicados (#65, en producción con #66).

## 2.26.0 (2026-10-13) · SelfLearn A0–B2 — preparado en feature, no desplegado

- **En preparación; pendiente de PR a staging.** Se renombra el área visual `Study · Dutch` a **SelfLearn · Courses** (se conserva el identificador técnico `study`).
- Ruta de 33 unidades A0–B2, diagnóstico orientativo de vocabulario, sesiones 5/10/20 minutos, contextos diarios/logísticos/analítica, escucha TTS y dictado opcional, y repaso FSRS con historial.
- Conserva las 7 lecciones previas mediante `legacyDay`, y guarda las preferencias en `hub_user_state.state` sin migraciones. La ruta no certifica MCER ni sustituye los cuatro exámenes NT2.
- Guía técnica y limitaciones: `docs/SELFLEARN.md`. No se ha cambiado producción.


- **Producción (uso diario):** [renzo-hub.vercel.app](https://renzo-hub.vercel.app/) · release **2.11.0** (extracto de ING en Nóminas) · rama `main`, commit `af07e68` (merge del PR #23) · verificada 2026-10-12: READY, `release.json` 2.11.0, `deployment-info` production/main, smoke 15/15. Migraciones: todas las de `supabase/migrations/` hasta 20261010030000 (ver `docs/SUPABASE-SCHEMA.md`). Rollback app: Instant Rollback en Vercel
- **Staging (revisión aislada):** [renzo-hub-2-1-staging.vercel.app](https://renzo-hub-2-1-staging.vercel.app/) · release **2.19.0** (tras fusionar el PR de nivel en Gym y Study) · rama `staging` · **No borrar la rama `staging` al fusionar PRs.**
- **Experimental:** 2.6.0 Microapp OS Core · rama `experimental/os-core` (no se despliega)
- **Fuente canónica:** `github.com/rellmen/renzo-hub` (privado). `main` = producción, `staging` = pruebas, `feature/*` = una rama por tarea con PR hacia `staging`
- **Copias de seguridad:** `~/Projects/RENZO-HUB/backups/` y versiones verificadas en `~/Projects/RENZO-HUB/releases/`
- **Proyectos Vercel:** `renzo-hub` (producción) y `renzo-hub-2-1-staging` (staging)
- **Supabase:** "Renzo Hub" `mgncykyrhavpepfggmng` (producción) y "Renzo Hub Staging" `zpueziugbezqxompwsol`
- **Referencias:** `RENZO_HUB_TECHNICAL_AUDIT.md` y `PHASE_1_EXECUTION_PLAN.md` (bóveda del proyecto y `~/Documents/HUB`)

> La carpeta `~/.codex/.chatgpt-projects/.../renzo-hub-news` queda como espejo histórico de solo lectura. No editar ni desplegar desde ella.

## 2.22.1 (2026-10-12): My Finance · ahorro provisional mientras falta Revolut

- Con los datos reales de septiembre, el Resumen decía "Ahorro real 3254,85 €" cuando 2811,15 € habían pasado a Revolut sin extracto. Eso no es ahorro: es dinero cuyo gasto no se ve.
- Ahora, si hay dinero pasado a Revolut sin su extracto, la cifra pasa a **"Ahorro provisional · Hasta X €"** (en gris), con el aviso de cuánto falta, y no se compara el ahorro con el mes anterior. En Gastos, "Ahorro provisional (falta Revolut)". Al importar el extracto de Revolut vuelve a "Ahorro real".
- Saber qué banco hay: Gastos y Resumen muestran el estado de cada banco ("ING ✓ hasta el 30 sept · Revolut ✗ sin importar"). Al importar, la vista previa dice en grande "Extracto de ING" o "Extracto de Revolut" y, si el archivo ya estaba importado, avisa de que no hay nada nuevo (y, si es de ING, que Revolut es el PDF de su app). Renzo no distinguía si había importado Revolut o ING.
- Test nuevo (`savingsStatus`): 111/111. Caché `renzo-hub-cloud-v8.9-ahorro-provisional`.

## 2.22.0 (2026-10-12): My Finance · presupuesto semanal (etapa C de 3, My Finance cerrado)

- Panel nuevo en el Resumen: **presupuesto semanal por categoría**, con la semana de **miércoles a martes** (Renzo cobra los miércoles). Flechas ‹ › entre semanas, días que quedan, barra por categoría (al 80 % avisa, pasado en rojo), lo que queda o cuánto te pasas, y el total.
- Solo para gasto variable: alquiler, seguros, suscripciones, teléfono y energía ya están en "Gastos fijos".
- Editor con **sugerencia por categoría**: media de las últimas 4 semanas completas con datos, redondeada a 5 €, anclada al último extracto importado. "Usar sugerencias" rellena los huecos.
- Honestidad con los datos: el banco llega al importar el extracto. Si la semana no está importada se avisa (con enlace al importador) y no se enseña "0 € gastado"; si está a medias, se dice hasta qué día hay datos.
- Guardado en un solo registro `hub_records` money/`money_budget` (`payload.weekly`, `week_starts: "wednesday"`). Sin migraciones.
- Escritorio: Resumen en dos columnas equilibradas (ahorro, avisos y presupuesto a la izquierda; categorías y fijos a la derecha).
- **Cierre de My Finance (Fase 2):** importar ING y Revolut ✓, gasto mensual por categoría ✓, ahorro real ✓, fijos y suscripciones ✓, presupuesto semanal ✓. Las fotos de tickets pasan a la Fase 3 (necesitan almacenamiento nuevo y lectura con Jarvis).
- Tests: 110/110 (5 nuevos de presupuesto); E2E autenticado ampliado con crear un presupuesto. Caché `renzo-hub-cloud-v8.8-finance-presupuesto`.

## 2.21.0 (2026-10-12): My Finance · gastos fijos y suscripciones (etapa B de 3)

- Panel nuevo en el Resumen: **fijos al mes**, % de tus ingresos, **dinero libre** (ingresos − fijos) y total de suscripciones.
- Cuenta como fijo: alquiler, seguros, suscripciones, teléfono y energía, más lo que se repite una vez al mes con importe parecido (±20 %) en al menos 2 de los últimos 3 meses. El gasto variable (súper, restaurantes, gasolina, compras…) solo cuenta si lo marcas tú.
- El dinero que entra en Alquiler (el aporte de quien comparte piso) resta de los fijos y se muestra justo debajo del alquiler.
- Cada fijo muestra la fecha prevista del próximo cargo (~, no confirmada). "No es fijo" y "Añadir un gasto fijo" se guardan como marca `fixed` en la regla del comercio (`money_rule`), la misma que guarda su categoría. Sin migraciones.
- Tests: 105/105 (5 nuevos de fijos); E2E autenticado ampliado con "No es fijo". Caché `renzo-hub-cloud-v8.7-finance-fijos`.

## 2.20.0 (2026-10-12): My Finance · Resumen del mes (cierre de My Finance, etapa A de 3)

- Renzo eligió cerrar My Finance con la opción 1: A Resumen, B fijos y suscripciones, C presupuesto semanal. Los tickets pasan a la Fase 3.
- La pestaña "Movimientos" pasa a ser **Resumen**: ahorro real del mes (ingresos − gastos del banco; los traspasos entre tus cuentas no cuentan) con su %, ingresos y gastos, comparación con el mes anterior (ahorro y gasto) y las 5 categorías con más gasto con su variación.
- Una sola fuente para las cifras: los movimientos del banco (ING y Revolut). Los registros a mano y de Jarvis siguen intactos en un bloque plegable aparte, "Registros a mano y de Jarvis", que avisa de que no se suman al resumen. Antes había dos cifras distintas de ingresos del mes.
- Avisos que se pulsan: movimientos sin categoría (abre Gastos con esa categoría desplegada), dinero pasado a Revolut sin extracto (abre el importador), entradas de dinero por revisar en AI Inbox.
- Gastos: el importador se pliega cuando ya hay datos (botón "Importar" en la cabecera), flechas ‹ › de mes compartidas con el Resumen, filas compactas con variación frente al mes anterior, "Sin categoría" siempre primero, 6 categorías y "Ver más", "Ahorro real" en lugar de "Ingresos − gastos".
- Código: `microapps/finance/` (insights.js puro y probado, data.js, summary.js, finance.css). Sin migraciones. Tests: 100/100 (8 nuevos en `tests/finance.test.mjs`); E2E autenticado ampliado con el Resumen. Caché `renzo-hub-cloud-v8.6-finance-resumen`.

## 2.19.0 (2026-10-12): RISE HUB · Gym y Study muestran el nivel único

- Renzo eligió la opción A: Gym (Ascend) y Study dejan de tener su propio XP visible y muestran el nivel único.
- `microapps/xp-store.js`: phase1.js publica el nivel; Gym, Study y Home lo pintan con atributos `data-rise-*` que se actualizan en el sitio (sin repintar la microapp ni perder lo que estés escribiendo).
- Para no perder mecánicas, el libro `xp_event` suma ahora también: récord personal en Gym +25 (no el primer registro de un ejercicio) y semana con 5 días entrenados +150. La ruta de Study suma los puntos que promete (aciertos × 10; repetir una lección ya hecha no suma). La sesión de Gym sigue valiendo 50 (las quests de Gym lo indican).
- Rango de Gym (E–S) según el nivel único: E 1–4, D 5–9, C 10–14, B 15–19, A 20–29, S 30+.
- phase1 lee también `exercises` de `gym_sessions` (solo lectura). Tests: 92/92 (nuevos de Gym/Study y de xp-store). Caché `renzo-hub-cloud-v8.5-nivel-gym-study`.

## 2.18.0 (2026-10-12): RISE HUB · portadas de microapps y animación de apertura (etapa 3 de 3)

- `assets/rise-covers.css`, solo CSS (sin tocar JS):
  - Portada detrás de la cabecera de Body, Gym, Food, Skin, Study, Work, My Finance, Nóminas, Gastos y Notas, fundida con el fondo. Es un `::before` de la sección: sobrevive aunque la microapp repinte su contenido y solo se descarga al abrirla. En Nóminas y Gastos es más baja para no quitar espacio.
  - Animación de apertura: la portada se acerca (0,7 s) y el contenido sube suavemente (0,34 s). Finita; desactivada con "reducir movimiento".
  - Restos violeta de Gym (rango, quests, pestaña seleccionada) y Study (botón Empezar, ruta, lecciones, quiz) en la familia azul.
- Con esto RISE HUB queda completo: marca (2.15), Home (2.16), nivel único (2.17) y portadas (2.18).
- Pendiente de decidir: Gym (Ascend) y Study tienen su propio contador de XP interno, aparte del nivel único.
- Caché `renzo-hub-cloud-v8.4-portadas`.

## Herramientas de trabajo (2026-10-12, sin cambio de versión: la app publicada no cambia)

- `./scripts/renzo-hub preflight [nº PR]`: comprobaciones fijas antes de fusionar (destino, fusionable, CI por check, versión y caché si cambia la app, migraciones con rollback, claves en lo añadido). Sale con 1 si algo FALLA.
- `./scripts/renzo-hub verify <staging|prod> [versión] [--smoke]`: versión servida, entorno, 14 rutas internas no expuestas y smoke opcional. Staging necesita `VERCEL_PROTECTION_BYPASS` en la shell.
- `AGENTS.md`: reglas permanentes (Renzo ya no las repite en cada encargo) y Definition of Done con formato de informe obligatorio.
- Los mods y skills de Claude no viven en este repo: son un plugin de la cuenta de claude.ai de Renzo (chats del proyecto "Rise HUB").
- Comprobado al crearlo: preflight contra el PR #32 y verify contra producción. **Producción sirve 2.11.0 y staging 2.19.0**: hay 8 versiones pendientes de pasar a producción.

## 2.17.0 (2026-10-12): RISE HUB · nivel único

- Antes había dos niveles: Progreso (libro `xp_event` de `phase1.js`) y Daily Quests (`world.js`, 10 XP por actividad, sin guardar). Renzo eligió unificarlos (opción A).
- Ahora el libro `xp_event` es la única fuente. Suma también, con id determinista (sin duplicados): check-in Body 10, práctica o repaso de neerlandés 10, entregable cerrado 20, movimiento de Money revisado 5.
- La actividad pasada de esos tipos se añade al libro al cargar, así que el nivel puede subir la primera vez.
- Daily Quests queda como checklist del día (x/4) sin nivel propio. La casilla "XP hoy" del panel, que en realidad mostraba un total, pasa a "Quests hoy"; el XP de hoy real está en Progreso.
- La quest "Revisa un movimiento Money" cuenta solo movimientos marcados como revisados (antes cualquier movimiento del día).
- Test unitario nuevo; caché `renzo-hub-cloud-v8.3-nivel-unico`.

## 2.16.0 (2026-10-12): RISE HUB · nueva Home (etapa 2 de 3)

- Home rehecha con el diseño de Lovable (re-implementado en `assets/rise-home.css`; no se copia código del prototipo ni su módulo de Nodalys):
  - **Hero** con la ilustración nocturna, "RISE HUB", saludo según la hora (sin nombre: la cuenta no guarda ninguno) y el botón "Comenzar mi siguiente nivel" (abre Gym, igual que antes).
  - **Hoy:** misiones = tus hábitos de System → Ajustes (marcar sigue guardando en Supabase); **Progreso** con nivel y XP reales, hábitos y entrenos de 7 días; debajo, el panel existente de Project Slots, Inbox, siguiente paso, alertas y Daily Quests.
  - **Áreas:** tarjetas con portada (Gym, Food, My Finance, Study, Skin, Work, Notas); Car y News mantienen su icono. Los microapps del registro pueden tener portada con el campo `cover`.
  - **Resumen del día:** peso, entrenos, skincare, comidas, neto del mes y vocabulario; "sin datos" cuando faltan.
- Imágenes en `assets/rise/` (WebP, unos 300 KB en total), en la caché offline. Caché `renzo-hub-cloud-v8.2-rise-home`.
- `phase1.js`: el resumen pasa a `#p1Overview` (misma lógica y datos). Test E2E ajustado.
- Siguiente: etapa 3 (portadas dentro de cada microapp y animación de apertura).

## 2.15.0 (2026-10-12): RISE HUB · nueva identidad (etapa 1 de 3)

- Nombre visible **RISE HUB** (antes Renzo HUB): título, pantalla de acceso, menú, manifest de la PWA, icono de inicio y textos. Se mantienen las URLs, el repositorio `rellmen/renzo-hub`, los proyectos de Vercel y Supabase, el prefijo de caché `renzo-hub-` y el formato de copia `renzo-hub-export` (las copias antiguas siguen sirviendo).
- Logo R de cristal aprobado en Lovable: iconos 180/192/512, 512 maskable, favicon y marca en webp (`assets/rise-*-v1.*`).
- Paleta azul eléctrico y cian sobre fondo `#060b14` con superficies de cristal: `assets/rise-theme.css`, cargado después de los estilos de `index.html`. Solo colores y marca; no cambia estructura ni comportamiento. Nóminas y Gastos con reglas propias porque sus hojas se cargan después.
- Diseño re-implementado en CSS a partir del prototipo de Lovable; no se copia código del prototipo y no se porta su módulo de Nodalys.
- Caché `renzo-hub-cloud-v8.1-rise`. Copia descargada: `rise-hub-copia-AAAA-MM-DD.json`.
- Siguientes etapas: 2) nueva Home (hero, Hoy, Áreas, Progreso); 3) portadas de microapps y animación de apertura. Cada una con su PR a staging.

## Esquema completo de producción comprobado (2026-10-12)

- Consulta 11 en producción (Renzo): **11 de 12 secciones idénticas a staging** (columnas, restricciones, índices, políticas de public y Storage, permisos de tablas y funciones, RLS, triggers, vistas, buckets).
- Única diferencia: `set_hub_records_updated_at` (trigger de `updated_at` en `hub_records`). Producción tiene el mismo código en una sola línea (`begin new.updated_at := now(); return new; end;`); staging y el repositorio, en varias líneas. **Misma lógica y misma configuración de seguridad**: no hace falta tocar producción.
- La consulta 11 ahora compara el código de funciones y vistas sin espacios ni saltos de línea; referencia de staging actualizada. Con esa normalización, producción = staging en las 12 secciones (la función normalizada da el mismo md5 en los dos entornos: `0146fd32…`).
- Criterio "esquema reproducible": cumplido para todo el esquema, no solo Nóminas.

## 2.14.0 (2026-10-12): copia de seguridad "Exportar mis datos" y huella del esquema completo

**Auditoría (12 oct, verificada):** CI en verde en cada PR (sintaxis, unit, smoke, E2E de Nóminas Chromium y WebKit, réplica PostgreSQL 17 con migraciones, RLS y rollback). E2E con sesión contra staging solo en local (necesita credenciales). Supabase security advisors en ambos entornos: solo "Leaked password protection" (disponible desde el plan Pro). **Organización de Supabase en plan Free: sin copias automáticas** (Supabase solo hace copias diarias en Pro, Team y Enterprise). Historial de migraciones de Supabase con versiones distintas a los archivos del repositorio (varias se aplicaron desde el SQL Editor): no afecta al esquema, pero no es un registro limpio.

| Qué | Dónde |
|---|---|
| System → **Copia de seguridad → Exportar mis datos**: descarga un JSON con todas las tablas de `public` (solo filas del usuario, filtradas por su columna de dueño) y los archivos de Storage (`payroll`, `hub-private`, `portfolio-files`, `progress-photos`, hasta 60 MB). Sin credenciales: usa la sesión y RLS | `microapps/backup/export.js`, `app.js`, `index.html` |
| Registra la fecha de cada copia (`hub_records` system/`backup_export`) y avisa si han pasado 7 días o más | |
| Restauración: `tools/backup/snapshot_to_sql.py` (tablas, `insert … on conflict do nothing`, no borra nada) y `tools/backup/extract_files.py` (archivos a carpeta para volver a subir) | `tools/backup/` |
| Test que obliga a añadir a la copia cualquier tabla nueva creada por una migración | `tests/backup.test.mjs` |
| Huella del esquema completo (12 secciones: columnas, restricciones, índices, políticas, funciones, vistas, triggers, permisos, RLS, buckets). Referencia de staging guardada; falta ejecutarla en producción y comparar | `tools/db-checks/11_huella_esquema_completo.sql`, `tests/db/fixtures/schema_full_staging_2026-10-12.json` |

Pruebas: `tests/backup.test.mjs` 5/5 (incluye restaurar con los dos scripts), unit 88/88, E2E autenticado contra staging 36/36 (descarga la copia, comprueba que solo trae filas del usuario y que registra la fecha).

## 2.13.1 (2026-10-12): pago de deudas y comercios identificados por Renzo

- Categoría nueva **Pago de deudas** (gasto, separada del consumo). Decisión de Renzo: lo que envía a su familia son deudas que ha pagado; lo que se mueve con su hermana son préstamos y devoluciones (categoría "Préstamos y devoluciones", no cuenta como gasto). Esas dos reglas son por persona: Renzo las crea en la app con "Todos de <nombre>" (los nombres de familia no van en el código).
- Reglas por defecto nuevas: Umans = gasolinera (gasolina), Body Supplies = suplementos (salud), Ls Smaeck, FEG Exploitatie y De Brouwer Weert = restaurantes.
- Simulación con septiembre real y esas reglas (local): gasto 4.305,50 € (de ellos 2.490 € pago de deudas, 1.815,50 € de consumo), ingresos 3.961,15 €, ingresos − gastos −344,35 €, 1 movimiento sin categoría.

## 2.13.0 (2026-10-12): extracto de Revolut · Gastos con ING + Revolut (etapa 2b)

| Qué | Dónde |
|---|---|
| Lector del extracto de Revolut en **PDF** (neerlandés, inglés o español; pdf.js en el dispositivo, por posición de columnas) y en **CSV** de la app (solo completados en EUR, comisión incluida) | `microapps/bank/revolut.js` |
| Comprobación de saldo movimiento a movimiento; si no cuadra, aviso en la vista previa. Ignora secciones de movimientos revertidos o pendientes | `balanceBreaks` |
| El importador detecta el banco solo (PDF → Revolut; CSV con "Completed Date" → Revolut; resto → ING). Mismo botón en Nóminas y Gastos | `bank-import-ui.js` (`parseStatement`) |
| Recargas desde la tarjeta de ING = traspaso (no gasto). Id estable por movimiento también en Revolut (PDF y CSV del mismo movimiento → mismo id) | `ing-csv.js` |
| Categorías nuevas: Viajes y alojamiento, Ayuda a la familia (gasto) y Préstamos y devoluciones (no cuenta). Reglas nuevas: kvk, peluquería, Rituals, Airbnb, HMSHost… | `categories.js` |
| `extractRows` admite más páginas (`maxPages`, 80 para extractos) | `payroll-pdf.js` |

Pruebas: `tests/revolut.test.mjs` 7/7 (filas ficticias, CSV ficticio, detección del banco), unit 83/83, E2E autenticado contra staging 35/35 (ahora también importa un PDF ficticio de Revolut, `tests/fixtures/revolut-ficticio.pdf`, generado con `tools/fixtures/make_revolut_pdf.py`). Con el extracto real de septiembre (local): 64 movimientos, entradas 4.443,73 € y salidas 4.355,60 € = resumen del extracto, saldos encadenados sin errores.

## 2.12.0 (2026-10-12): Gastos por categoría · etapa 2 de la Fase 2

Nueva microapp **Gastos** (My Finance → pestaña Gastos), creada con `./scripts/renzo-hub new-microapp gastos "Gastos" money money --tab`.

| Qué | Dónde |
|---|---|
| Categorías calculadas al vuelo desde los movimientos del banco: supermercado, restaurantes, alquiler, gasolina, coche y parking, transporte, seguros, suscripciones, teléfono, energía, salud, compras, ocio, impuestos, banco, personas, nómina, toeslagen, traspasos | `microapps/gastos/categories.js` |
| Nombre limpio del comercio y marcas agrupadas (todas las tiendas de Albert Heijn = "Albert Heijn"), para ver en qué supermercado o restaurante se gasta | `merchantName` |
| Prioridad: categoría puesta a mano > regla del usuario por comercio (`hub_records` money/`money_rule`) > reglas por defecto > "Sin categoría" (no se inventa) | `categorize` |
| Al cambiar una categoría: "Solo este" o "Todos de <comercio>" (crea la regla y se aplica también a lo que se importe después) | `microapps/gastos/gastos.js` |
| Abonos en una categoría de gasto restan (devoluciones, Tikkies). Aporte al alquiler: ingreso de una persona por el importe del alquiler o la mitad (±1 €) a ≤10 días del pago → cuenta en Alquiler y resta (decisión de Renzo: alquiler 1.350 €, aporte habitual 675 €) | `rentContributions` |
| Traspasos a tus cuentas (Revolut, ahorro) no cuentan como gasto; aviso cuando hay dinero pasado a Revolut sin su extracto importado | |
| Importación del CSV de ING también desde Gastos (sin las líneas de nóminas) | `bank-import-ui.js` (`payroll: false`) |

Pruebas: `tests/gastos.test.mjs` 7/7, unit 76/76, E2E autenticado contra staging 35/35 (incluye Gastos: importar CSV ficticio, categorías, regla por comercio y limpieza), E2E Nóminas (Chromium) OK. Con el extracto real de septiembre (local, fuera del repositorio): 5 movimientos sin categoría (comercios desconocidos), alquiler neto 0 € ese mes (aporte de 1.350 €), 2.811,15 € de traspasos a Revolut.

Corrección: al cerrar sesión justo después de hacer scroll, el guardado de la posición (180 ms después) leía un usuario ya nulo y daba un error de JS (lo detectó el E2E de Nóminas en WebKit). Ahora comprueba que la sesión sigue siendo la misma (`app.js`).

Pendiente (etapa 2b): importar el CSV de Revolut (falta el archivo de Renzo).

## 2.11.0 (2026-10-11): extracto de ING en Nóminas · inicio de la Fase 2

**Fase 1 cerrada (2026-10-11):** criterio 4 comprobado (staging = producción en esquema de Nóminas y buckets); 5 y 8 pasan a la Fase 2 por decisión de Renzo.

Petición de Renzo (Fase 2): importar el CSV de ING en Nóminas; gastos por categoría y mes (supermercados y cuál, restaurantes, alquiler, gasolina, seguros…); presupuesto semanal por categoría; gastos fijos y suscripciones; ahorro real del mes; fotos de tickets. Se entrega por etapas: 1) CSV en Nóminas (esta versión), 2) Gastos por categoría, 3) presupuestos, fijos y ahorro, 4) tickets.

| Cambio | Dónde |
|---|---|
| Lector del CSV de ING (inglés y neerlandés), números de nómina "loonslipnummer(s) N", id estable por movimiento (importar dos veces no duplica) | `microapps/bank/ing-csv.js` |
| Tarjeta "Importar extracto ING (CSV)" en Nóminas → Resumen: vista previa (periodo, movimientos nuevos y ya importados, entradas, salidas, nóminas enlazadas, diferencias, nóminas que faltan) y guardado solo al confirmar | `microapps/bank/bank-import-ui.js`, `payroll.js` |
| Datos: `hub_records` (money / `bank_tx`, source `import`), sin migración. Cuenta propia guardada solo con los 4 últimos dígitos | |
| Nóminas: chip "En el banco <fecha>" o "diferencia", tarjeta "Cobro en el banco" en el detalle y, en pagos extra pendientes, botón "Usar la fecha del banco" en la revisión (corrige la fecha de pago al aprobar) | `payroll.js`, `payroll.css` |

Pruebas: `tests/bank.test.mjs` 9/9 (CSV ficticio), unit 69/69, E2E Nóminas (Chromium) con importación, reimportación sin duplicar, chip y detalle. Probado también en local con el extracto real de septiembre (no está en el repositorio): 50 movimientos, 50 ids únicos, 6 ingresos de nómina (nº 19 a 25).

## 2.10.2 (2026-10-11): buckets de producción en migraciones · criterio 4 de Fase 1

- Consulta 9 (huella del esquema de Nóminas) en producción = `793af6d3d9e56b3fe6ead9389f27ffd2`, idéntica a staging. Staging se reproduce con la cadena de migraciones, así que producción también.
- Consulta 10 (buckets): `hub-private` y `payroll` iguales en ambos entornos. Producción tenía además `portfolio-files` (3 archivos) y `progress-photos` (vacío), sin migración y sin existir en staging.
- Nueva migración aditiva `20261011120000_storage_portfolio_progress_buckets.sql` (definición copiada de producción; en producción no cambia nada) y rollback solo para staging.
- Prueba `tools/db-replica/buckets_test.sh` (también en CI): base vacía + todas las migraciones = buckets y políticas de producción; estado de producción + migración = sin cambios y archivos intactos; idempotente; rollback.
- Pendiente: aplicar la migración en staging (Renzo, SQL Editor de "Renzo Hub Staging") y comprobar. Con eso el criterio 4 queda cerrado.
- **Decisión de Renzo (2026-10-11): los criterios 5 (staging para Jarvis) y 8 (separación Nodalys) pasan a la Fase 2.** No bloquean nada: las nóminas se suben desde la app sin n8n. La Fase 1 se cierra con 6 de 8 criterios en cuanto el criterio 4 quede comprobado en staging.
- Petición de Renzo: al terminar cada cambio, darle siempre el enlace del PR hacia `staging` (y el del SQL Editor de staging si hay migración).
- Extracto ING de septiembre: confirma las 7 nóminas (3.376,15 €). La nº 19 se cobró el 2 sep (junto con la nº 20) y la nº 22 el 11 sep; la app muestra 1 y 10 sep (fecha del documento). Pendiente de decisión de Renzo: importar el CSV del banco para marcar "cobrada en banco" con la fecha real.

## Estado verificable de Fase 1 (2026-10-08, 12:15)

**Fase 1: 2.6.2 publicada y validada en staging** (smoke 15/15 y E2E autenticado 22/22 contra la URL desplegada). No se declara cerrada hasta completar los controles de Supabase Auth (registro público y contraseñas filtradas). Producción sigue en 2.4.1 sin cambios.

### Funciona (verificado)
| Qué | Evidencia |
|---|---|
| Producción intacta en 2.4.1 | Ningún cambio en Vercel ni en la base de producción en esta fase (solo lecturas) |
| GitHub `rellmen/renzo-hub` | Acceso admin. Historial comparado: `main` ⊂ `staging` ⊂ `feature/fase1`; ramas antiguas de producción y preview contenidas en `sync/main-2.4.1`. Sin force-push. `feature/fase1` integra `staging` con un merge sin cambios de archivos |
| CI (GitHub Actions) | Verde en `feature/fase1` (check, unit, smoke). Nuevos: `tests/deploy-surface.test.mjs` (15/15 en local) y job `db-migrations` |
| Superficie publicada | Test: según `.vercelignore` no se publica ningún `.md`, `.sql`, script, test, `docs/`, `supabase/`, `.github/` ni `package.json`; tampoco claves secretas. Se añadieron `.gitignore` y `.vercelignore` a la lista (2.6.1) |
| Supabase staging: permisos | Migraciones `staging_revoke_maintain` y `financial_ingest_always_review` **aplicadas en staging** (autorizado) tras copia verificada (`backups/supabase-staging-2026-10-08T0845Z`, SHA-256 OK en el Mac). Datos idénticos antes y después. authenticated solo CRUD, anon sin acceso. Advisors: solo "leaked password protection" |
| Permisos y sincronización en staging real | Prueba en transacción revertida (`TEST_OK`): comida, peso sin duplicar, hábitos, XP sin duplicar, progreso, ajustes, CHECK de `source`, RLS entre usuarios, anon denegado, gasto importado → `needs_review`, reenvío → `duplicate`, nada directo en Money. No quedó ningún dato de prueba |
| Smoke test en el Mac contra Supabase staging | 15/15 (móvil y escritorio, cabeceras, sin registro público, sin errores CSP) |
| Microapps a nivel de base de datos | Réplica local PostgreSQL 17 con los privilegios reales: comidas, peso (sin duplicar), hábitos, XP sin duplicados, progreso, ajustes, RLS entre usuarios, CHECK de `source`, anon denegado (`tools/db-replica/run.sh`, todo OK) |
| Migraciones pendientes | Probadas en réplica: no tocan filas, son idempotentes y el rollback deja los privilegios idénticos a producción |
| Jarvis activo intacto | `WH0kGpw0dg83yvdM` activo = versión `adbc67d5` (7 oct, anterior a esta fase). Nodalys LinkedIn activo = `517bcda9`. Todos los workflows nuevos están inactivos |

### Despliegue de staging 2.6.2 (autorizado, 2026-10-08)
| Comprobación | Resultado |
|---|---|
| PR #2 | Fusionado por Renzo 11:48, merge `cc183cf`; contiene `c25cbda`; árbol idéntico a `5c2df42` (aprobado). Destino `staging` |
| GitHub Actions | Verde antes del merge (`5c2df42`) y en el push a `staging` |
| Vercel staging | `dpl_Dq4qcEqQUmNB1WsQEHzSK8A1HibM` **READY**, rama `staging`, commit `cc183cf`, alias `renzo-hub-2-1-staging.vercel.app` |
| Supabase usado por staging | Variables solo *preview*; `SUPABASE_URL` y `/api/supabase-config` = `zpueziugbezqxompwsol` (staging), clave publishable. Sin clave de servicio |
| Producción durante el merge | El proyecto `renzo-hub` canceló su build (regla: solo `main`). `renzo-hub.vercel.app` sigue en **2.4.1**; migraciones de producción sin cambios |
| Migraciones | Ninguna repetida ni aplicada (staging sin integración de ramas) |
| URL desplegada: `release.json` y `deployment-info` | 2.6.2 · `preview` · `renzo-hub-2-1-staging` · `staging` |
| Cabeceras | CSP `script-src 'self' cdn.jsdelivr.net`, HSTS, `nosniff`, `X-Frame-Options: DENY`, Referrer-Policy, Permissions-Policy |
| Documentos internos | 19 rutas (`*.md`, `docs/`, `supabase/`, `scripts/`, `tests/`, `tools/`, `.github/`, `package*.json`, `.env`, `.vercelignore`, `.gitignore`, `integrations/`, `os-core/`) → **404**; app (8 rutas) → 200 |
| Protección de Vercel | Sin sesión → 302 (login de Vercel) |
| Smoke contra la URL desplegada | **15/15** (móvil y escritorio) |
| E2E autenticado contra la URL desplegada | **22/22** (login, 12 secciones, perfil, Portfolio, Nutrición, Peso, Hábitos, Progreso/XP sin duplicados, sin errores JS) |

Las pruebas contra la URL protegida usan el secreto *automation-bypass* que ya existía en el proyecto (creado el 7 oct); se lee en memoria y nunca se escribe ni se muestra.

### Riesgo antes de producción: PR #1
El PR #1 (`sync/main-2.4.1` → `main`) añade `supabase/migrations/` a `main`. Producción tiene activadas las ramas de Supabase (branch `main`). Si el proyecto de producción está conectado al repo por la integración de GitHub de Supabase, fusionar en `main` podría aplicar esas migraciones (baseline de staging) en producción. No hay checks de Supabase en ningún commit, lo que sugiere que no está conectado, pero **hay que comprobarlo** en Supabase → Project Settings → Integrations → GitHub antes de fusionar nada en `main`.

### Diagnóstico del E2E autenticado (2026-10-08 11:05) y corrección (2.6.2, autorizada)
| Fallo | Causa verificada | Tipo | Corrección propuesta |
|---|---|---|---|
| Sincronización con registro de Jarvis | El test pulsa el primer `[data-open="system"]`, que es el botón oculto "← System". Con el botón visible: `Sincronizado con Supabase` con el registro de Jarvis presente | Error del test | Seleccionar el botón de la barra de navegación |
| Hábitos: definir y marcar | Los hábitos **sí se guardan** (Supabase: 2 hábitos y el perfil corporal intacto). El mensaje "Hábitos guardados." se escribe y se borra al instante porque el formulario se vuelve a dibujar | **Error de la app** (feedback invisible) | Mostrar el mensaje después de redibujar |
| Progreso y XP tras recargar | Sin duplicados: 4 eventos con id distinto (comida, 2 pesos, portfolio). El de portfolio se crea al recargar porque el XP solo se recalcula al abrir la app | Comportamiento: XP de Portfolio diferido | Recalcular XP al guardar en Portfolio, o ajustar el test |
| Sin errores JS | Solo `404 /api/jarvis`: el servidor local de pruebas no implementa la función de Vercel | Entorno de prueba | Simular `/api/jarvis` en `tools/dev-server.mjs` |

Hallazgo adicional: el texto de la tarjeta Jarvis en System decía que Jarvis "registra en Money" con confianza alta; corregido en 2.6.2.

Correcciones aplicadas en `feature/fase1` (2.6.2, commits `ae786a8` y `c25cbda`, CI verde): aviso de hábitos visible; evento `renzo:synced` desde world.js y Portfolio para que el XP se registre al guardar; texto de Jarvis; test con el botón visible de System; `GET /api/jarvis` simulado en el servidor local.

### No funciona o no verificado
| Qué | Motivo |
|---|---|
| E2E autenticado (Mac, app 2.6.2 servida en local + Supabase staging real) | 11:03 → 18/22 (diagnóstico abajo). Tras las correcciones: **22/22** a las 11:16 y **22/22** a las 11:20, smoke 15/15. Login, 12 secciones, perfil corporal, Portfolio, Nutrición, Peso, Hábitos, Progreso/XP sin duplicados, sin errores JS. Archivos probados idénticos (hash git) al commit `c25cbda`. En la base: 4 ejecuciones dejan 2 pesos (uno por día), 1 hábito y 8 eventos XP con id distinto (sin duplicados) |
| Inspección de los deployments de Vercel | El conector de Vercel de esta sesión no ve ningún equipo (`list_teams` vacío, `403` en el equipo `renzojesus99-1996`). Staging responde 302 (protección de Vercel activa) |
| Respuestas de IA de Jarvis/Nodalys | n8n sin créditos de IA ("Payment required") |
| Protección de `main` | GitHub exige plan Pro para ramas protegidas o rulesets en repos privados |

### Solo preparado (no aplicado)
- `supabase/pending/20261008120000_harden_grants_and_functions.sql` (producción) con rollback exacto.
- `supabase/pending/20261008140000_financial_ingest_always_review.sql` en **producción** (en staging ya aplicada): en producción `hub_financial_ingest` aún puede escribir directo en Money si la confianza es ≥ 0,90. Ningún workflow activo la llama.
- Workflows nuevos de Jarvis personal y Nodalys (borradores/inactivos, ver `docs/JARVIS-SEPARATION.md`).

### Necesita autorización o acción de Renzo
1. **Confirmar el usuario de pruebas** de staging (o autorizar confirmarlo por SQL) y tener el Mac encendido para el E2E.
2. PR #2 fusionado. **No fusionar PR #1** hasta comprobar la integración GitHub de Supabase en producción (ver riesgo arriba).
3. **Conector de Vercel**: al autorizarlo, incluir el equipo `renzojesus99-1996` (esta sesión no ve ningún equipo).
4. Supabase (ambos entornos): **desactivar registros públicos** y **activar leaked password protection** (Dashboard → Authentication).
5. Producción: no autorizado por ahora (migraciones `20261008120000` y `20261008140000` listas).
6. Créditos de IA en n8n y OK para publicar los workflows nuevos.
7. Opcional: GitHub Pro para proteger `main`. Alternativa sin coste: regla de trabajo "solo Renzo fusiona" (ya aplicada en la práctica) o hacer el repo público (no recomendado: datos personales en el historial).

### Hallazgos menores
- `assets/skin_*.jpeg` (fotos de productos de skincare) son públicas en Vercel. No contienen datos personales sensibles; si se prefiere privacidad total, moverlas al bucket privado.
- El webhook de prueba de Jarvis (`jarvis-hub-test-…`) está protegido por la comprobación de ejecución manual.

## Comprobaciones previas a producción (2026-10-09) · RESULTADO: BLOQUEADO

| Comprobación | Resultado |
|---|---|
| Integración GitHub de Supabase | **No conectada** en producción ni en staging (panel Integrations: "Connect GitHub"). Fusionar en `main` no aplica migraciones |
| Registro público | **Activado** en producción y staging ("Allow new users to sign up" = on). Pendiente de Renzo |
| Contraseñas filtradas | **No disponible**: Supabase lo limita al plan Pro. Alternativa: longitud mínima 12 (hoy 6) y requisitos de caracteres |
| Backup de Supabase | El plan Free **no tiene copias** ni PITR. Copia propia de solo lectura: 20 tablas, 648 filas, permisos, funciones, políticas, usuarios y lista de storage (sin el contenido de los archivos). SHA-256 `e9bb3e26…` verificado en el Mac (`~/Documents/HUB/supabase-prod-2026-10-09.tgz`; Desktop Commander offline, pendiente moverla a `~/Projects/RENZO-HUB/backups/`). Restauración no destructiva `tools/backup/snapshot_to_sql.py` probada en réplica (tablas no payroll; payroll requiere su esquema real, T2.1) |
| Migraciones | `20261008140000` idéntica a la probada y aplicada en staging (sha256 `f45f7966…`). `20261008120000` **actualizada** porque producción cambió: 2 vistas nuevas (`payroll_v_monthly_nl`, `payroll_v_jaaropgave_nl`, creadas el 8 oct fuera del repo, también en staging) con todos los privilegios para anon (sin fuga real: `security_invoker` y anon sin acceso a las tablas base). Nueva versión: revoca anon en todo `public`, vistas solo lectura y quita anon de los privilegios por defecto. Réplica con privilegios de producción del 9 oct: todo OK y rollback idéntico |
| Producción | **Ya no es 2.4.1: sirve 2.8.0 "Nóminas"** sin commit en GitHub. Contiene la base de Fase 1 (CSP, sin registro, documentos internos 404) + `payroll.js`, pero **no** las correcciones 2.6.2 (`phase1.js`, `world.js`, `world-extensions.js`, `jarvis-ui.js` difieren; `gym.js`, `news.js`, `profile.js` iguales) |

**Consecuencia:** el plan "promocionar 2.6.2 a producción" ya no es válido: sustituiría 2.8.0 y **quitaría el módulo de Nóminas**. Antes hay que llevar el código de 2.8.0 a GitHub, integrarlo con 2.6.2 y validarlo en staging. No se ha creado el PR `staging → main` ni se ha tocado producción.

## Informe de preparación para producción (no autorizado aún, OBSOLETO desde 2026-10-09)

**Por qué conviene promocionar pronto:** producción 2.4.1 publica hoy documentos internos: `/AGENTS.md`, `/JARVIS-CONNECTION.md`, `/RENZO-HUB-CURRENT.md`, `/RENZO-HUB-2.1-IMPLEMENTACION-Y-VALIDACION.md`, `/scripts/renzo-hub` y `/supabase/migrations/…baseline….sql` responden 200 (comprobado 12:15). Además, en 2.4.1 `/api/jarvis` puede registrar gastos directo en Money y `hub_financial_ingest` también. 2.6.2 corrige todo esto.

| # | Paso | Quién | Estado |
|---|---|---|---|
| 1 | Supabase Auth en producción y staging: desactivar registro público, activar contraseñas filtradas | Renzo (Dashboard) | Pendiente |
| 2 | Comprobar en Supabase producción → Integrations → GitHub si `rellmen/renzo-hub` está conectado (producción tiene ramas de Supabase, branch `main`). Si lo está, desconectarlo o confirmar que no aplica migraciones al fusionar en `main` | Renzo | Pendiente, **bloquea el PR #1** |
| 3 | Copia de seguridad de producción: Dashboard → Database → Backups (descargar la última) y, si es posible, `supabase db dump` con la contraseña de la base | Renzo | Pendiente |
| 4 | Aplicar en producción `20261008120000_harden_grants_and_functions.sql` y `20261008140000_financial_ingest_always_review.sql` (probadas en réplica con los privilegios reales de producción; rollback exacto) | Claude con OK de Renzo | Preparado |
| 5 | PR `staging` → `main` (sustituye al PR #1) con 2.6.2; Renzo fusiona | Claude prepara, Renzo fusiona | Preparado |
| 6 | Vercel `renzo-hub`: cambiar rama de producción de `renzo-hub-2-1-production` a `main` (las variables de producción ya existen: `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`, `JARVIS_INBOUND_TOKEN`, `JARVIS_OWNER_ID`) | Claude con OK de Renzo | Preparado |
| 7 | Verificación en producción: READY, commit, `release.json` 2.6.2, documentos internos 404, smoke; E2E autenticado **no** se ejecuta en producción | Claude | Preparado |
| 8 | Rollback: Vercel "Instant Rollback" a `dpl_HBnDnZqawHuTC9nUFcCsxoLnDeTs` (2.4.1) y `*.rollback.sql` | Claude con OK | Preparado |
| 9 | Jarvis/Nodalys: publicación de workflows (decisión aparte, requiere créditos de IA en n8n) | Renzo | Fuera de este despliegue |

Riesgos conocidos: el XP se calcula también para datos antiguos la primera vez que Renzo abra 2.6.2 en producción (eventos con id determinista, sin duplicados); el perfil corporal de Renzo debe rellenarse en Ajustes (2.6 ya no lo trae escrito en el código).

## Progreso Fase 1

| Fecha | Tarea | Resultado | Archivos | Pruebas | Commit / PR |
|---|---|---|---|---|---|
| 2026-10-08 | T0.1 Backup | Copias tar.gz de `renzo-hub-news` y `renzo-microapp-os-core-v1` + manifiestos SHA-256; config local separada (700/600) | n/a (fuera del repo) | Extracción y `shasum -c` OK (142 y 72 archivos); sin secretos en archivos | n/a |
| 2026-10-08 | T0.2 Recuperar versiones | 2.4.1 reconstruida desde Vercel; 2.5.0 y 2.6.0 desde local | `releases/` | 2.4.1: 35/35 SHA-1 = uid Vercel. 2.5.0: 37/38 (excepción doc `RENZO-HUB-CURRENT.md`) | n/a |
| 2026-10-08 | T0.5 Historia limpia (local) | Historia original conservada (7 commits); `main`=2.4.1, `staging`=2.5.0, `experimental/os-core`=2.6.0 | todo el árbol | Verificación de hashes en cada commit; `npm test` os-core 6/6 | `d7cdf75` v2.4.1 · `6c45462` v2.5.0 · `a05849b` v2.6.0-experimental |
| 2026-10-08 | T0.9 Script status | `scripts/renzo-hub` usa curl; detecta staging protegido por SSO | `scripts/renzo-hub` | Ejecutado: producción 2.4.1 detectada | rama `feature/block0-tooling` |
| 2026-10-08 | T0.3/T0.4/T0.7/T0.8 | Resuelto tras conectar GitHub (ver Bloque 0 · GitHub y Vercel). Protección de `main` no disponible en el plan gratuito (requiere GitHub Pro) | n/a | n/a | n/a |
| 2026-10-08 | Bloque 1 · fixes críticos (2.5.1) | `dbSource` + sync tolerante (B-01, B-02); Jarvis siempre a revisión (B-06); script externo `app.js` + CSP y cabeceras (S-07); sin registro público en la UI (S-02 código); `.vercelignore` (S-01); perfil corporal en `user_settings` (F-06) | `world.js`, `world-extensions.js`, `api/jarvis.js`, `index.html`, `app.js`, `profile.js`, `vercel.json`, `.vercelignore`, `sw.js`, `release.json` | `npm test` 8/8; smoke navegador 15/15 (móvil y escritorio, sin errores CSP); hashes del deployment = commit | `ecbdb2e` · staging preview `dpl_25mHhkFSz6FzqLU9of7GskmPpZWH` |
| 2026-10-08 | Tests y CI | Smoke Playwright, e2e con sesión (solo staging), servidor local con cabeceras Vercel, GitHub Actions | `tests/`, `tools/dev-server.mjs`, `.github/workflows/ci.yml`, `package.json` | Smoke 15/15 local y con valores ficticios de CI | rama `feature/block1-critical-fixes` |
| 2026-10-08 | Bloque 2 (preparación) | Migración de endurecimiento de permisos + rollback (**no aplicada**, requiere autorización); procedimiento de dump de `payroll_*` | `supabase/pending/`, `docs/SUPABASE-SCHEMA.md` | Revisión de firmas de funciones en staging | `5986a42` |
| 2026-10-08 | Bloque 3 · microapps Fase 1 (2.6.0) | Nutrición (comidas, kcal, proteína), Peso (registro diario + evolución), Hábitos (checklist en Home, configurable en Ajustes), Progreso 7 días con datos reales, XP con libro `xp_event` de ids deterministas | `phase1.js`, `index.html`, `app.js`, `profile.js`, `sw.js`, `release.json`, `tests/phase1.test.mjs`, `tests/e2e/authenticated.mjs` | `npm test` 12/12; smoke 15/15; e2e con sesión pendiente de usuario de staging | rama `feature/block3-microapps` |
| 2026-10-08 | Bloque 4 · diseño Jarvis | Separación Renzo HUB/Nodalys y autorización técnica con `request_approval` (botones Telegram + nonce + chat id verificado en código). **No aplicado**: no se edita el borrador activo de Jarvis | `docs/JARVIS-SEPARATION.md` | n/a | rama `feature/block3-microapps` |
| 2026-10-08 | Bloque 0 · GitHub y Vercel | Historial de GitHub integrado sin reescribir (merge `-s ours`, árbol = 2.4.1); ramas `staging`, `feature/fase1`, `experimental/os-core`, `legacy/chatgpt-local-main`; Vercel: staging construye solo `staging`, producción solo `main` | `.github/workflows/ci.yml` | CI en verde en PR #1 y PR #2 (check + 12 unit + smoke) | `d622776`, `6ae2bf2`, PR #1, PR #2 |
| 2026-10-08 | Bloque 2 · staging | Migración `harden_grants_and_functions` aplicada en Supabase staging | `supabase/pending/` | Privilegios extra 51 → 0; advisors: solo queda "leaked password protection" | n/a |
| 2026-10-08 | Bloque 4 · Jarvis/Nodalys implementado | Jarvis personal sin herramientas Nodalys + aprobación técnica + gastos a revisión; agente Nodalys en el flujo del bot Nodalys con aprobación por botones (CAS de un solo uso). Todo en borrador o inactivo | `docs/JARVIS-SEPARATION.md` | Ver checklist en `docs/JARVIS-SEPARATION.md`; respuestas del modelo bloqueadas por créditos de IA agotados | n8n `WH0kGpw0dg83yvdM`, `CHOL3mZnIrtM3rPy`, `v9C8W9OtTw1bSzFJ` (borradores) |
| 2026-10-08 | Estabilización (2.6.1) | Verificación GitHub, superficie publicada, migraciones en réplica PG17, rollback exacto, `hub_financial_ingest` al repo, revisión obligatoria preparada | `.vercelignore`, `release.json`, `sw.js`, `.github/workflows/ci.yml`, `supabase/`, `tests/db/`, `tests/deploy-surface.test.mjs`, `tools/db-replica/`, `docs/SUPABASE-SCHEMA.md` | unit 15/15; réplica: todo OK; E2E autenticado **pendiente** | rama `feature/fase1` |
| 2026-10-08 | Staging: migraciones y E2E | Copia verificada; `staging_revoke_maintain` y `financial_ingest_always_review` aplicadas en staging; correcciones 2.6.2; E2E autenticado 22/22 (x2) | `phase1.js`, `world.js`, `world-extensions.js`, `jarvis-ui.js`, `tools/dev-server.mjs`, `tests/e2e/authenticated.mjs`, `release.json`, `sw.js`, `docs/SUPABASE-SCHEMA.md` | Permisos y sincronización en staging `TEST_OK`; E2E 22/22; smoke 15/15; unit 15/15; CI verde | `d542ce9`…`c25cbda` |
| 2026-10-08 | Despliegue staging 2.6.2 | PR #2 fusionado; deployment READY con `cc183cf`; validación contra la URL desplegada | `tests/e2e/smoke.mjs`, `tests/e2e/authenticated.mjs` (bypass por variable de entorno) | smoke 15/15, E2E 22/22, 19 rutas internas 404, Supabase staging confirmado | `cc183cf`, `477443b` |

**Problemas encontrados:**
- Vercel (plan Hobby) bloquea despliegues con commits cuyo autor no es la cuenta de Renzo. Solución: commits con autor `rellmen` y coautor Claude.
- El proxy de esta sesión no permite push a `main` ni de tags, y las fusiones las hace Renzo.
- n8n: créditos de IA agotados ("Payment required"); afecta también a los flujos activos.
- Staging está protegido por Vercel SSO; la verificación se hace por hashes del deployment y con el servidor local que replica las cabeceras.
- El e2e con sesión necesita confirmar el usuario de pruebas de staging (email enviado a `renzojesus99+rhstaging@icloud.com`).
- En el Mac `NODE_ENV=production` hace que `npm install` omita devDependencies; para pruebas locales se usa `~/Projects/RENZO-HUB/tools/e2e-runner`.

**Pendiente de Renzo:** ver "Necesita autorización o acción de Renzo" arriba.

**Siguiente tarea:** pasos 1 a 3 del informe de preparación para producción (Renzo). Después, con autorización expresa, pasos 4 a 8.


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

## Nóminas · trabajo preparado para staging (2.7.0)

| Fecha | Tarea | Resultado | Archivos | Pruebas | Commit / PR |
|---|---|---|---|---|---|
| 2026-10-08 | Módulo Nóminas | Bandeja, detalle/PDF, revisión, KPIs, alertas, Realtime y demo aislada. Producción pendiente de OK. | payroll.js, payroll.css, payroll-demo.js, app.js, index.html, sw.js, release.json | 15 unitarias; contrato Supabase solo lectura; integración de navegador | feature/payroll |
| 2026-10-08 | Nóminas · cierre y staging (Claude) | Test e2e corregido (contraseña del paso demo). Preview en proyecto staging `dpl_8XKdRN3ke2Q8ZH2W9zT34HmTvFLB` READY, `/release.json` 2.7.0, `/api/deployment-info` preview. Realtime activado en staging. Producción sin tocar (2.4.1). | tests/e2e/payroll.mjs | unit 15/15; e2e nóminas Chromium y WebKit OK; smoke 15/15 | `9f18902` · https://renzo-hub-2-1-staging-ous87m050-renzojesus99-1996.vercel.app |
| 2026-10-08 | Nóminas 2.7.1 · demo en segundo enlace de staging | El dominio renzo-hub-2-1-staging.vercel.app queda con la 2.6.2 de la tarea de estabilización (decisión de Renzo). Demo ?demo=1 habilitada también en renzo-hub-2-1-staging-renzojesus99-1996.vercel.app. | payroll.js, payroll-demo.js, sw.js, release.json | unit 15/15; e2e Chromium y WebKit OK | ver commit siguiente |

Ver `docs/PAYROLL-CHANGELOG.md` para limitaciones y peticiones a Claude. No se incorporan los cambios locales sin commit de la tarea e2e/fase1-2.6.2.

## Nóminas 2.10.1 (2026-10-10): ordenadas por mes de cobro y tipo
- Pestaña Nóminas: vista por defecto **"Por mes de cobro"**: cada mes con su recuento ("5 semanales + 2 pagos extra"), el neto cobrado confirmado y las pendientes; dentro, ordenadas por fecha de cobro (regla: semana trabajada → miércoles siguiente; pagos extra → su fecha de pago).
- Cada nómina muestra fecha de cobro, semana, nº y **tipo**: Semanal, Vakantiegeld, Vacaciones o Corrección. Se puede volver a "Por semana trabajada".
- Petición de Renzo: entender por qué septiembre tiene 7 (septiembre de 2026 tiene 5 miércoles de cobro + pagos extra).

## Nóminas 2.10.0 (2026-10-10): subir nóminas desde la app, sin n8n
- My Finance → Nóminas → **Subir nómina (PDF)**: el PDF de SD Worx se lee en el propio dispositivo (`payroll-pdf.js` + pdf.js servido desde `/vendor/pdfjs`, sin CDN), se enseña un resumen (nº, semana, bruto, neto, retención, fecha) y si las cuentas cuadran.
- Al confirmar, `api/payroll-upload.js` comprueba la sesión y el origen, valida PDF (tipo, ≤ 3 MB, SHA-256) e importes, reutiliza la empresa y la etiqueta de semana existentes, detecta pagos adicionales (segunda nómina de la misma semana), y llama a `payroll_register_document` → bucket privado `payroll` → `payroll_ingest`. **Siempre queda pendiente de revisión.** El mismo PDF dos veces = duplicado.
- Sin migraciones: usa las funciones de Nóminas que ya existen. Necesita `SUPABASE_SECRET_KEY` en Vercel (producción ya la tiene; staging por confirmar: `GET /api/payroll-upload` responde `configured`).
- Verificado con las nóminas reales nº 4, 5, 22 y 23 (lectura y cuentas) y en réplica PostgreSQL 17 (`tools/db-replica/payroll_upload_test.sh`, también en CI con una nómina ficticia). Pruebas: unitarias 58/58, E2E Nóminas con subida (Chromium), E2E autenticado 32/32, smoke 15/15.

## Skin 2.9.2 (2026-10-10): rutina de piel arreglada y en el registro
- **Fallo encontrado (también en producción):** al cargar Skin, el código escribía en elementos que no existen (`skinPct`, `greeting`, `streak`). La carga se cortaba: la rutina no mostraba ningún paso y el indicador decía "Conectado · algunos datos no se pudieron cargar". No estaba cubierto por ninguna prueba.
- Skin pasa a `microapps/skin/skin.js` (contrato del registro, `loadOnSignIn`), con escritura segura en elementos opcionales. Sin cambios visibles salvo que vuelve a funcionar.
- Nueva prueba E2E de Skin: marcar un paso, comprobarlo en Supabase, recargar y releer, nota del día, desmarcar e historial de solo lectura.

## Observabilidad 2.9.1 (2026-10-10): registro de errores de la app
- `microapps/errors.js`: captura errores de JavaScript, promesas rechazadas y microapps que no cargan; los guarda en `hub_records` (system / app_error) en la fila del propio usuario. Deduplicado, máximo 20 por sesión, ignora ruido (extensiones, ResizeObserver, Realtime sin red). Sin migraciones.
- System → "Errores de la app": últimos 20 abiertos con fecha, versión y sección; botón "Marcar como revisados".
- Corrección: `records.js`, `ui.js` y `errors.js` ahora están en la caché sin conexión (en 2.9.0 faltaban los dos primeros) y un test lo vigila para todo `microapps/`.

## Microapps 2.9.0 (2026-10-10): registro central, kit de datos, generador y Notas
- `microapps/registry.js`: cada microapp se declara una vez; rutas, menú, pestañas, tarjetas de Home, enlace directo `?app=` y ciclo de vida salen de ahí. Guía: `docs/MICROAPPS.md`.
- `microapps/records.js`: datos de apps sencillas en `hub_records` (sin migraciones). `microapps/ui.js`: cabecera, pestañas y estados "sin datos" comunes.
- `./scripts/renzo-hub new-microapp <id> "<Nombre>" <area>` crea módulo, entrada de registro y caché.
- Nóminas, Gym y News pasan al registro sin cambios visibles. Primera app hecha con el generador: **Notas** (Home → Tus microapps).
- Pruebas: registro y kit (unitarias), y el E2E autenticado recorre todas las secciones del registro y crea/elimina una nota real del usuario de pruebas en staging.
- Sin cambios de base de datos.

## My Finance 2.8.4 (2026-10-10): Nóminas como apartado de My Finance
- Money pasa a llamarse **My Finance** (menú inferior, título, tarjeta de Home y textos de Jarvis).
- My Finance tiene dos apartados: **Movimientos** (lo que era Money) y **Nóminas** (la microapp de nóminas, sin cambios de datos ni cálculos).
- Nóminas: botón "← My Finance", pestañas para volver a Movimientos y el menú inferior visible con My Finance marcado.
- Home: la tarjeta "Nóminas" pasa a ser "My Finance" (movimientos y nóminas). System mantiene el acceso directo "My Finance · Nóminas". El enlace `?app=payroll&payslip=` sigue funcionando.
- Sin cambios de base de datos. El mensaje "Money → Pendientes" de la función de base de datos se mantiene hasta una migración futura.

## Nóminas 2.8.3 (2026-10-10): aviso de nóminas que faltan
- El resumen avisa de huecos en la numeración por empresa y año (solo entre la primera y la última recibidas): hoy "Falta la nómina nº 22 de SD Worx".
- CI ejecuta el E2E de Nóminas (datos ficticios, Chromium y WebKit) en cada PR.
- Pruebas: unit 29/29, smoke 15/15, E2E autenticado 22/22, E2E Nóminas OK.
- Decisión de Renzo (10 oct): sin VPS; n8n Cloud se pagará cuando haga falta.

## Cierre de Fase 1 · trabajo autónomo (2026-10-10)

| Criterio de cierre (auditoría §7) | Estado |
|---|---|
| 1 · Fuente única en GitHub, Vercel desde Git | ✔ (protección de `main` requiere GitHub Pro) |
| 2 · Sincronización fiable | ✔ |
| 3 · Superficie pública mínima | ✔ app · **pendiente Renzo:** desactivar registro en Supabase (ambos proyectos) |
| 4 · Esquema reproducible | ✔ `20261007200000_payroll_schema_baseline.sql`; cadena completa probada = staging. Pendiente: comprobar md5 en producción y buckets `portfolio-files`/`progress-photos` |
| 5 · Staging probable para Jarvis | ✖ depende del VPS de n8n |
| 6 · Microapps de Fase 1 | ✔ · falta prueba real Telegram → Money (depende del VPS) |
| 7 · Red de seguridad | ✔ smoke, E2E, CI, plantilla de PR y `docs/RELEASE-CHECKLIST.md` |
| 8 · Separación Nodalys | ✖ diseñada; implementación en n8n depende del VPS |

## Nóminas 2.8.2 (2026-10-10): mes por fecha de cobro, correcciones agrupadas y pendientes visibles

Petición de Renzo: "trabajo una semana y cobro lo que hice esa semana el siguiente miércoles"; totales confusos (~10.000) y nóminas "replicadas".
Diagnóstico con datos reales (solo lectura): 24 nóminas SD Worx, sin duplicados. Las 3 semanas dobles (W22, W24, W34) son correcciones con 0 horas e importes pequeños (pagos adicionales). El total mostrado solo sumaba las 19 confirmadas; 5 pendientes de revisión no contaban. El porcentaje alto (≈37 %) es la tarifa especial de los pagos extra.

| Cambio | Dónde |
|---|---|
| Regla de cobro: nómina semanal normal = miércoles siguiente a la semana ISO; corrección = su fecha de pago | `payroll.js` (`payDate`) y migración `supabase/pending/20261010030000_payroll_pay_date_rule.sql` (vistas confirmed, monthly_nl, jaaropgave_nl; solo cambia `ref_date`) |
| A · Correcciones agrupadas bajo su semana como "Pago adicional" | `payroll.js` (`groupByWeek`, `payslipCard`) |
| B · Resumen: neto confirmado + "Pendientes sin contar" + total con pendientes, por año de cobro | `payroll.js` (`yearSummary`) |
| C · Retención por nómina; aviso de tarifa especial en pagos extra | `payroll.js` (`taxRate`), detalle y mensual |

Pruebas: unit 28/28, smoke 15/15, E2E autenticado 22/22, E2E Nóminas (Chromium) OK, deploy-surface 3/3, `tools/db-replica/pay_date_test.sh` TODO OK (fechas, agrupación mensual, cambio de año, vista dependiente, security_invoker, permisos, idempotencia, rollback).

## Unificación 2.8.1 (2026-10-09): Nóminas 2.8.0 + estabilización 2.6.2

Rama `feature/unificacion-2.8.1` = `feature/fase1` + merge de `e35f64a` (Nóminas 2.8.0, lo que sirve producción). Conflictos solo en `release.json`, `sw.js` y `tests/e2e/smoke.mjs`, resueltos conservando ambos lados (bypass de Vercel + comprobación de entorno). Caché `renzo-hub-cloud-v6.0-unificada`.

| Prueba (código unificado, servidor local + Supabase staging) | Resultado |
|---|---|
| `npm run check` / `npm test` | OK / 24/24 |
| deploy-surface | 3/3 |
| Réplica de base de datos (`tools/db-replica/run.sh`) | TODO OK |
| Smoke | 15/15 |
| E2E autenticado Fase 1 | 22/22 |
| E2E Nóminas (demo) | Chromium OK (contenedor) · Chromium + WebKit OK en el Mac (worktree `~/Projects/RENZO-HUB/unificacion-2.8.1`, 2026-10-09 21:30) |

PR #3 hacia `staging` abierto (CI verde). Mac: copia de producción movida a `backups/supabase-prod-2026-10-09/` (sha256 verificado); cambios sin commit de `e2e/fase1-2.6.2` guardados como parche en `backups/`; ramas de Nóminas del Mac sin commits fuera de la unificación. Pendiente:, despliegue y validación en staging; después, autorización de Renzo para producción. Aviso: `docs/PAYROLL-2.8-TAREA-2-3.md` contiene una cifra salarial real (repositorio privado); decidir si se anonimiza.

## Nóminas 2.8.0 · desarrollo local (Tareas 1, 2 y 3)

| Fecha | Tarea | Resultado | Archivos | Pruebas | Commit / PR |
|---|---|---|---|---|---|
| 2026-10-09 | Tarea 1 · Mensual | Vista mensual por fecha de pago, selector de año, total anual, desglose, retenciones, horas y saldos; demo sintética. | payroll.js, payroll.css, payroll-demo.js, release.json, sw.js, tests, docs | check OK; unitarias; E2E Chromium y WebKit; capturas 390 y 1440 px | c708679; sin PR |
| 2026-10-09 | Ajustes de Tarea 1 | Singular, etiquetas con mayúscula y bloques Horas/Saldos plegables en móvil. | payroll.js, payroll.css, tests/e2e/payroll.mjs, sw.js | check, unitarias y E2E Chromium/WebKit | dd261c8 |
| 2026-10-09 | Tarea 2 · smoke por entorno | Entorno esperado derivado de BASE_URL, con override EXPECT_ENV; solo lectura. | tests/e2e/smoke.mjs, docs | Smoke real producción 15/15, sin login | 1663313 |
| 2026-10-09 | Tarea 3 · Año (jaaropgave) | Pestaña Año: aviso de completitud arriba, valores oficiales de la última nómina separados de lo registrado, demo con año incompleto y completo. Aviso específico si lo registrado supera el oficial o falta el acumulado. | payroll.js, payroll.css, payroll-demo.js, sw.js, tests, docs | check OK; 21/21 unitarias; E2E Chromium y WebKit; smoke producción 15/15; cifras reales verificadas en la vista | commit Tarea 3; sin PR ni despliegue |

Worktree: `/Users/Nodalys/Renzo HUB/payroll-2.8`, creado desde `main` en `7c110eb`. El checkout `e2e/fase1-2.6.2` conserva sus cambios. Caché `renzo-hub-cloud-v5.9-payroll`. Pendiente: revisión de Renzo, PR y despliegue con su OK. Detalles en `docs/PAYROLL-2.8-TAREA-1.md` y `docs/PAYROLL-2.8-TAREA-2-3.md`.

## 2.22.2 (2026-10-13): Command Center solo en preview (feature)

- Rama feature/command-center-preview creada desde origin/staging; NO fusionada a staging ni main.
- Microapp registrada en microapps/registry.js, con acceso Home, sección privada bajo login, vista móvil/escritorio alineada con tema azul/cian de RISE HUB.
- Datos recientes de Work/System consultados bajo RLS con sesión activa y límite 75; servicios por /api/deployment-info del propio entorno. Los agentes sin integración se indican como tales.
- Sin migraciones, sin writes, sin credenciales añadidas, sin despliegue en producción; verificar preview/Vercel y aprobación para merge staging.

## 2.23.0 (2026-10-13): Ares Center · operaciones (preview antes de producción)

- Sustituye Command Center por Ares Center (id ares-center, enlazable con ?app=ares-center; mantiene enlace heredado).
- Project Tracker lee y actualiza la fuente Work existente renzo_project/renzo_task; permite crear proyectos en backlog, tareas y cerrarlas. Work se refresca tras los cambios.
- AI Inbox reúne renzo_inbox existente (solo redirige a Work para decisiones financieras y documentos) con solicitudes ares_decision que pueden aprobarse/rechazarse sin ejecutar acciones externas.
- Agent Monitor presenta eventos reales renzo_event de origen automatizado y registros manuales ares_agent_run; sin afirmar estados live de Claude/Hermes.
- Endpoint de despliegue y Supabase solo describen el entorno activo y datos reales; RLS por owner, cero migraciones.
- Preparado en feature/ares-center-operations desde staging; no fusionar a producción sin autorización específica.

## 2.23.1 (2026-10-13): Ares · configuración de Jarvis en preview

- Agent Monitor consulta /api/jarvis y muestra solo la configuración de los webhooks, no la conectividad real.
- Cambio independiente desde el último staging conocido; no fusionar a main sin autorización.

## 2.26.1 (2026-10-13): SelfLearn · paquete separado para producción

- Base: `origin/main` en rama `feature/selflearn-production-pack` (no incorpora los seis commits extra de Ares/Jarvis pendientes en `staging`).
- SelfLearn A0–B2 con FSRS, audio y prueba de sesión de Supabase staging; ajuste `Permissions-Policy` para dictado voluntario. Sin migraciones ni cambios en cuentas de producción.
- Verificación local: `npm run check`; `npm test`; E2E SelfLearn simulado; smoke 15/15; dos sesiones reales de QA de staging con guardado y recuperación de preferencias; QA restaurada. Publicación a `main` pendiente de autenticación GitHub y comprobación de despliegue.

## 2.27.0 (2026-10-14): Ares AI central y cola de aprobaciones

- Integra en `main` Ares AI global con chat privado RLS, consultas de proyectos/tareas/revisiones, acceso de solo lectura al desarrollo GitHub/Vercel, y solicitudes de Claude/Hermes/Jarvis pendientes de aprobación.
- Los agentes NO se ejecutan con una aprobación; sin adaptador real, `executed=false`. La entrega de prueba a Jarvis sigue restringida a preview y requiere configuraciones independientes.
- IA generativa OpenRouter sigue apagada en producción sin consentimiento y configuración explícita; las respuestas privadas funcionan sin enviar datos a proveedores de modelos.
- Cambio de caché PWA v10, sin migraciones. Solo publicar si CI, pruebas autenticadas de staging y smoke pasan.

## 2.28.0 (2026-10-14): proyecto RISE HUB 4.0 · fase 0: cierre en 2.28.0

- Roadmap secuencial y estimaciones 382–626h, visible en Work sin exponer datos; tabla fuente en `microapps/work/roadmap.js`, detalles en `docs/RISE-HUB-4.0-ROADMAP.md`.
- No incluye funcionalidad nueva de nóminas todavía: fase 1 Payroll se inicia tras verificar publicación 2.28.0. Sin migraciones ni modificaciones de Supabase.
- Estado `closed` en Work se aplica solo tras PR, CI, validación autenticada, despliegue READY y smoke de producción.

## 2.29.0 (2026-10-14): Shift Tracker UI · Fase 1 activa, no cerrada

- Rama `feature/risehub4-shift-ui`: interfaz de contratos/agencias, turnos, descansos, tramos, bruto estimado, resumen semanal, CSV y comparador base+ORT; datos privados en `hub_records` con RLS; sin migraciones.
- Resuelve re-render que interfería con la edición de turnos durante la sincronización de nóminas. Turnos ambiguos CET/CEST se rechazan, no se inventan horas.
- Tests: 169/169 unidad, 15/15 smoke local, flujo autenticado de QA staging en móvil/escritorio con recuperación tras recarga y limpieza de QA, y pruebas E2E previas de Nóminas Chromium+WebKit.
- Pendiente: reglas extras de festivos/horas extra por contrato, resolución DST con offsets, edición, auditoría real contra nómina vinculada, PR y release. No avanzar a My Finance.

## 2.29.0 WIP (2026-10-14): reglas personales incorporadas a Payroll

- Rama `feature/risehub4-shift-ui`, PR #51 en borrador: semana 2026-10-12 mañana, alternancia semanal mañana/tarde, horario 06-15 / 15-00, descanso real 30 min no pagado, salidas anticipadas editables, 150 % solo al superar 40h trabajadas por agencia, no acumulación de pluses, saldo vacacional independiente para festivos/días libres.
- Nuevos módulos de cálculo semanal, rotación y saldo; interfaz de edición e historial, propuesta del turno y movimientos privados. Prueba E2E autenticada real staging con recuperación y limpieza de datos de prueba.
- Queda abierta la fase 1. Ningún cambio en producción de este PR; un festivo pagado del saldo no se cuenta como hora trabajada extraordinaria.

## 2.29.0 (WIP, 14/10/2026): importación de vacaciones y Keuzebudget

- PR #51: importación segura al cierre de nómina original con confirmación, sin duplicados y con verificación de documento y propietario. Vacaciones en minutos y Keuzebudget en céntimos, sin cruzar datos.
- Migración aplicada **solo en Supabase staging**, E2E real autenticado con saldo ficticio y limpieza de registros, 186 pruebas unitarias y 15 smoke correctas. Producción 2.28.0 sin cambios y sin saldos importados.
- La fase 1 continúa ABIERTA; se requiere desplegar la migración en producción antes de publicar interfaz y completar auditoría salarial, festivos y DST.

### Gate del release de saldos (2026-10-14)

- Runbook versionado: `docs/PAYROLL-BALANCES-RELEASE-RUNBOOK.md`. Producción **sin migrar**, PR #51 **borrador**. Requiere aprobación de migración productiva y PR de `staging` a `main`, además de verificación real del deployment staging antes de publicar.
- Comparación de esquema solo lectura staging vs producción correcta: 8 campos de nómina, 5 del PDF y 5 de `hub_records`; staging tiene importador, producción aún no. No se ha guardado la instantánea real.

## 2.29.2 WIP (2026-10-15): Corrección del Service Worker de staging

- En `2.29.1` el array `CORE` de `sw.js` repetía `/microapps/payroll/shifts.js`: `Cache.addAll` rechaza con `InvalidStateError` las peticiones duplicadas y deja al navegador controlado por el Service Worker antiguo, que oculta Turnos aunque los recursos nuevos estén desplegados. Reproducido con Chromium Cache API y observado en Safari staging.
- La versión `2.29.2` elimina el recurso duplicado y cambia la caché a `v14`; test automatizado de unicidad y activación real del SW. Hotfix limitado a staging. El cierre de fase 1 y la migración a producción siguen pendientes.
