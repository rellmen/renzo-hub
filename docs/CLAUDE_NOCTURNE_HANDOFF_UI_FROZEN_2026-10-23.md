# RISE HUB · Traspaso maestro a Claude
## Estado acumulado, migración Classic → Nocturne, próximos desarrollos y **CONGELACIÓN DE LA INTERFAZ**

**Fecha de corte:** 23 de octubre de 2026  
**Destinatario:** Claude (desarrollo principal); ChatGPT (arquitectura/auditoría); Work (QA real y cutover reversible)  
**Producto:** RISE HUB personal. **Nodalys es un proyecto empresarial separado.**  
**Estado:** documento operativo de traspaso, **no certificación de release ni permiso para desplegar**.  
**Prioridad máxima de la nueva decisión del propietario:** **NO rediseñar ni sustituir la interfaz actual**. Todas las próximas funcionalidades se incorporarán **adaptándose al diseño Nocturne React ya escogido**.

> **INSTRUCCIÓN VINCULANTE PARA CLAUDE**
>
> El usuario ha decidido mantener el aspecto, la identidad, el shell y la estructura visual de **RISE HUB Nocturne**. No presentar una nueva estética, no iniciar un rediseño total de Home ni de las microapps y no rehacer el producto con otra plantilla de Lovable/Figma. La misión es **completar migración, funcionalidad, datos y optimización dentro de la interfaz existente**, extendiendo su sistema de componentes. Las nuevas implementaciones deben integrarse de forma coherente con Nocturne, no sustituirlo. Cualquier cambio estructural/visual de alto impacto debe ser propuesto por separado y aprobado por el propietario. No mezclar esta decisión con la obligación de corregir bugs de accesibilidad, usabilidad o adaptación móvil.

---

## 1. Lectura rápida: prioridades y prohibiciones

1. **Mantener UI actual Nocturne React** como *design baseline*: `apps/rise-react/`, shell, navegación, portadas Lovable originales, componentes y tipografía. **Sin rediseño general**.
2. **Completar la migración real del clásico**. Una ruta React visible, un `200`, CI verde o `READY` de Vercel no equivale a paridad con CRUD, persistencia y seguridad verificadas.
3. **Unificar la experiencia de Finanzas, Nóminas y Turnos** en un centro **Money** coherente, con subida de PDF y herramientas originales. Mantener modelos contables separados y URLs antiguas compatibles.
4. **Recuperar todas las funciones que sí existían en Classic** y faltan en React: especialmente nóminas importables, Shift Tracker completo, SelfLearn persistente, Gym, fotos privadas, herramientas de Ares y workflow de datos.
5. **No borrar Classic ni modificar destructivamente producción** antes de conciliación de datos —incluido almacenamiento local—, restauración probada, autenticación real, validación móvil y rollback.
6. No copiar PII/contraseñas/tokens/documentos/fotos o datos personales de Supabase producción a staging, GitHub, Lovable, logs ni LLM.
7. No mezclar código, bases, agentes ni información de **Nodalys** con el proyecto personal RISE HUB. Esta copia puede almacenarse en la carpeta «Nodalys» por organización, pero su alcance sigue siendo solo RISE HUB.

**Definición de completo:** el usuario usa Nocturne para hacer **todo lo que hoy puede hacer en Classic**, con datos históricos íntegros, interacción fluida y diseño actual sin regresiones; puede importar nóminas, retomar lecciones, registrar entrenamientos, consultar Ares y sus finanzas sin visitar Classic; existen copias privadas restaurables y rollback comprobado.

## 2. Fuentes de verdad y estado verificable

### Repositorios, ramas y trabajo colaborativo

- **GitHub:** `rellmen/renzo-hub` (repositorio público; **no subir información personal**).
- **Classic:** aplicación PWA original en la raíz del repo (`index.html`, `app.js`, `world.js`, `gym.js`, `payroll.js`, `microapps/`, `api/`, `sw.js`).
- **React Nocturne:** `apps/rise-react/`, React 19 + TanStack Start/Router + TypeScript + Tailwind 4.
- **Rama principal de migración activa al consultar:** `feature/nocturne-integral-migration`.
- **PR #150**: «Nocturne: respaldos verificables, consulta Payroll y revisión Ares (migración parcial)», **OPEN / DRAFT, sin fusionar** en la última consulta del 23/10. Contiene avances, no declara migración integral terminada.
- **PR #149**: «Migración integral en una PR — integridad, paridad y reversión», **fusionado en `staging`**; su título aspiracional no sustituye los gates pendientes.
- **Issues #151** (reconciliación no destructiva/paridad) y **#143** (QA login real, multidispositivo y SelfLearn XP/FSRS) siguen abiertos.
- `main` y `staging` presentan divergencia histórica. **No merge masivo a `main`** ni asumir que un commit de una rama coincide con la versión servida.
- Revisar `AGENTS.md`, `docs/RELEASE-CHECKLIST.md`, `docs/RELEASE_POLICY.md` y `docs/COLABORACION-IA.md` **antes de editar**. Este último contiene asignaciones históricas de PR #75; para el trabajo actual prevalece la rama/PR #150 y la decisión de UI aquí expresada. Resolver conflictos con los requisitos más recientes, nunca mediante force-push.

### Entornos — no confundir

| Función | Proyecto/referencia | Advertencia |
|---|---|---|
| Datos producción | Supabase `mgncykyrhavpepfggmng` | Fuente de verdad de datos del propietario; sin importaciones en QA |
| Datos staging | Supabase `zpueziugbezqxompwsol` | Usar cuenta de QA aislada |
| PWA clásica | Vercel `rise-hub` | Conservar rescate funcional |
| Staging histórico | Vercel `renzo-hub-2-1-staging` | **No equivale** al proyecto Nocturne QA |
| React Nocturne QA | Vercel `rise-hub-nocturne-qa` | Proyecto TanStack Start separado, revisiones del dominio público históricamente contradictorias |
| Referencia visual Lovable aprobada | `https://lovable.dev/projects/ca43e152-f7c7-4c8e-b925-01476b9053da` | Fuente visual, **no** fuente de datos ni destino de despliegue |

En la revisión actual los tres proyectos Vercel consultados tenían *latestDeployment* marcado `READY`; esto solo prueba finalización del build. El `README` y algunos documentos narran etapas antiguas («React no publicado») frente a registros posteriores del alias público Nocturne. Antes de cualquier decisión: **inspeccionar alias, `/release.json`, `/api/deployment-info`, SHA servido, ruta y Supabase efectivo en cada proyecto**, sin deducir la topología actual solo de documentos viejos.

### Documentos base — leer en este orden

1. `docs/NOCTURNE-INTEGRAL-MIGRATION-STATUS.md` — matriz real y últimas pruebas.
2. `docs/NOCTURNE-FULL-MIGRATION.md` — fases, exportaciones, comparación de hashes y rollback.
3. `docs/REACT-MIGRATION-LOVABLE.md` — arquitectura React y contrato de diseño aprobado.
4. `docs/NOCTURNE-AI-SELFLEARN-REPAIR.md` — migraciones de SelfLearn/Ares y reversión.
5. `docs/REACT-SELFLEARN-AWARDS-QA-GATES.md`, `docs/SELFLEARN-LANGUAGE-ACADEMY.md`.
6. `docs/MICROAPPS.md` — catálogo y contratos de Classic.
7. `docs/GYM-SYMMETRY.md`, `docs/RISE-HUB-4.0-PHASE1-PAYROLL.md`, `docs/RISE-HUB-4.0-PHASE2-FINANCE.md`, `docs/ARES-CENTER-OPERATIONS.md`.
8. `docs/RELEASE-CHECKLIST.md`, `AGENTS.md`, `docs/COLABORACION-IA.md`.
9. Documento privado previo: `RISE_HUB_NOCTURNE_AUDITORIA_Y_EJECUCION_2026-10-23.md` (carpeta Biblioteca `/Nodalys`).

## 3. DECISIÓN DE DISEÑO FINAL: preservar, adaptar y ampliar

### 3.1 Qué interfaz debe conservar Claude

El **diseño React auténtico de Lovable Nocturne**, no una reconstrucción de CSS sobre Classic. Preservar:

- `apps/rise-react/src/components/rise/AppShell.tsx`, shell, *DesktopSidebar*, *MobileDock*, jerarquía de navegación, rutas, superficies y semántica de interacción.
- Componentes compartidos: `PageHero.tsx`, `PhotoModuleCard.tsx`, `MetricPanel.tsx`, `ProgressRing.tsx`, `Brand.tsx`, `FocusTimer.tsx`, `primitives.tsx`.
- Las **siete fotografías originales de Lovable**, verificadas con manifiesto de hashes y ya presentes en `apps/rise-react/src/assets/`: `ares.jpg`, `gym.jpg`, `hero-eclipse.jpg`, `learn.jpg`, `money.jpg`, `projects.jpg`, `skin.jpg`. Nunca reemplazarlas por imágenes genéricas, recortarlas incorrectamente o reconstruirlas.
- Tipografía React de referencia **Cormorant Garamond + Manrope**, héroe de eclipse, portadas fotográficas, composiciones editoriales y paleta premium declarada en el código. **No sustituir los tokens reales por colores genéricos**.
- Dirección estética: *Luxury Tech × Dark Academia × futurismo cinematográfico*, sofisticación 70 %, tecnología 20 %, dramatismo 10 %. Guía histórica de color: obsidiana `#111116`, borgoña `#481D35`, violeta imperial `#6149A6`, platino `#C5C9D4`, oro antiguo `#C6A16C` (referencia conceptual; **la implementación React usa sus propios tokens y oklch; inspeccionarlos antes de cambiarlos**).
- Navegación eficiente en móvil y desktop, Ares como punto central y el estilo propio de cada dominio **dentro de un design system común**, sin transformar cada microapp en una aplicación visualmente inconexa.

### 3.2 Principio de adaptación

**Cambiar el contenido y las capacidades dentro de la pantalla; no rehacer el marco que las presenta.**

Ejemplos concretos:

- **Nóminas:** añadir pestañas, importador de PDF, resumen y revisión en el panel Money, usando *PageHero*, paneles, tipografía, espaciado, buttons, formularios y estados de Nocturne.
- **SelfLearn:** insertar editor de sesiones, progreso persistente, tutor y FSRS dentro de *Emerald Academy*, sin sustituir Home o el layout general.
- **Gym:** añadir biblioteca, sets, cronómetro, fotos, comparador y progresión dentro de su vista Nocturne existente, no transformar Gym en otra app visual.
- **Quest:** mejorar misiones, búsquedas, favoritos y acceso rápido a microapps usando tarjetas y navegación **ya existentes**. La idea de un *launcher* Lovable con inicio/Quests/Apps/Ares es **propuesta exploratoria**, no autorización para reemplazar el shell actual ni publicar un rediseño.
- **Ares:** ampliar paneles de aprobación, historial, herramientas y fuentes reales mediante componentes Nocturne ya aprobados, sin pantalla ficticia de agente omnipotente.
- **Money:** centralizar información con *tabs* y *deep links* sin convertir el cambio en una segunda navegación global ni esconder funcionalidades.

### 3.3 Límites de cambio permitidos

**Permitido sin rediseño:** completar CRUD, añadir campos y subpaneles, estados vacío/carga/error, tabs internos, accesibilidad, contraste AA, safe-area móvil, layout responsivo, rendimiento, navegación por teclado, feedback, animaciones discretas y `prefers-reduced-motion`.

**Requiere propuesta y aprobación visual específica:** cambiar paleta global, tipografías, sidebar/dock, estructura de Home, héroe, sistema de portadas, estilo de tarjetas base o reemplazar interfaz React por otra plantilla.

**Prohibido:** nuevas cifras/XP simuladas, *placeholder* presentado como real, rutas rotas, «mejora de UI» que rompa lógica o datos, CSS global ad hoc que altere otros módulos, dependencia de base de datos de Lovable, retirar soporte iPhone para simplificar.

### 3.4 Contrato de diseño para toda PR futura

Toda PR funcional debe adjuntar: pantallas antes/después en el diseño Nocturne, lista de componentes reutilizados, nueva pieza visual solo si no existía componente equivalente, comparación móvil/escritorio, auditoría de accesibilidad y **prueba de que no se alteró el shell**. Mantener `nav.ts`, el registro de microapps y rutas profundas consistentes. Capturas sin datos personales. **No presentar un nuevo mockup completo en cada feature.**

## 4. Cronología de trabajo realizado y novedades (no confundir niveles de validación)

| Periodo | Trabajo registrado | Estado preciso |
|---|---|---|
| 6–19 oct | Consolidación de RISE HUB, módulos personales, Ares, SelfLearn, Gym, Skin, My Finance, copias y planes de colaboración | Capacidades parciales en Classic y docs; revisar la implementación por módulo |
| 17–19 oct | Fases visuales editoriales, Gym/Skin y plan Ares/automatizaciones | Prototipos/PRs y documentación; no implican agente autónomo activado |
| 21 oct | Elegido proyecto **Nocturne Lovable auténtico**; se decide pasar a React/TanStack, no solo a CSS heredado | **Decisión de producto vigente** |
| 21–22 oct | PRs React a `staging`, importar imágenes originales y abrir pantallas protegidas | Fuente React y siete imágenes verificadas; QA personal/móvil incompleta |
| 22 oct | Ares AI con handler protegido y SelfLearn XP/FSRS transaccionales, migraciones autorizadas para producción según docs | Endpoints y migraciones registrados; **respuesta real de Ares y recorrido real de SelfLearn aún requieren prueba autenticada** |
| 22 oct | PR #149 fusionado en `staging`; #150 reúne exportación, Payroll consulta, Shift, Money budgets, Skin, Quest, tutor y revisiones Ares | **#150 sigue draft y no fusionado**; las pruebas locales documentadas no certifican el último deployment ni paridad total |
| 22–23 oct | Auditoría de datos y paridad; respaldo privado y ensayo de restauración parcial; issues #143/#151 | Recuentos/ensayos útiles; falta Auth/Storage y recuperación de datos solo locales |
| **23 oct, nueva instrucción** | **Se congela la interfaz existente**; próximas implementaciones deben adaptarse a Nocturne | **Decisión obligatoria a partir de ahora** |

### Hitos técnicos concretos de PR #150

**Implementado en código/branch o documentado con pruebas locales, pero no confundir con «hecho en producción»:**

- Exportador React y Classic para **21 tablas de usuario** y **4 buckets privados** (`payroll`, `hub-private`, `portfolio-files`, `progress-photos`); paginación, verificación de propietario, límite de 60 MB y rechazo de copias parciales. Herramientas privadas de extracción/comparación.
- Ensayos privados fuera de Git: 937 filas producción y 289 staging restauradas fielmente **en ensayo limitado**; **no incluye Auth, Storage binario, permisos completos ni garantía de recuperación integral**.
- React **Payroll**: consulta historial, documentos/contratos/turnos; PDF descargable; **sin importador React completo**.
- React **Shift Tracker**: reutiliza motores originales de horario, vacaciones/ORT/DST, cálculos basados en contrato; hay partes de consulta y lógica, pero el flujo de edición/reconciliación y pruebas reales no están completos.
- React **My Finance**: límites semanales por categoría y edición mediante `money_budget` y control de concurrencia; **no importador bancario ni reconciliación completa**.
- React **Gastos**: ruta `/gastos`, reglas/categorización sobre movimientos existentes, preservando cantidades y registros.
- React **Skin**: edición de disponibilidad de inventario y persistencia optimista; fotos/calendario y QA completos pendientes.
- React **Quest**: cálculo de niveles heredado; no genera XP ficticio.
- React **SelfLearn**: endpoints/RPC de finalización, tarjetas FSRS y tutor opt-in con autenticación y cuota; pendiente QA persistencia real NL/EN, simultaneidad, offline, voz/audio.
- React **Ares**: handler AI, lecturas y revisiones Ares; las aprobaciones quedan registradas, **no ejecutan agentes**. Monitor histórico/sources protegido. La bandera `enabled=true` no prueba conexión real con el proveedor.
- CI local reportado en documentación del PR: 538 tests Node, 15 Vitest React, build y TypeScript correctos para un commit anterior; Playwright/Chromium/WebKit parcialmente verificados; **re-ejecutar sobre SHA de entrega definitivo**.

**Peligro:** los README y docs antiguos contienen aseveraciones de estados pasados. En cualquier contradicción, prevalecen el commit y artefacto desplegado comprobados, resultados de CI de ese SHA, base de datos efectiva y decisión del propietario más reciente.

## 5. Inventario por microapp: implementación pendiente dentro de la UI congelada

Leyenda: `[x]` es avance conocido **en código**, `[ ]` pendiente de paridad real. Ninguna `[x]` implica que producción o cuenta personal estén validadas.

| Área | Avance que debe preservarse | Trabajo que falta sin cambiar interfaz |
|---|---|---|
| **Home / Shell / Apps** | [x] Diseño Nocturne, portadas originales, navegación React y métricas conectadas parcialmente | [ ] Todas las acciones operativas, búsqueda/favoritos/recientes sin romper shell, sin cifras demo, estados correctos |
| **Money** | [x] Resumen y presupuestos semanales; algunas vistas de cuentas | [ ] Centro único, transferencias no duplicadas, activos/deudas/objetivos, conciliación, reportes, reglas |
| **Nóminas** | [x] Consulta, documentos/contratos y descargas | [ ] **Subir PDF en React**, extracción, líneas, versiones, validación, anomalías, corrección, auditoría y saldos |
| **Shift Tracker** | [x] Motor horario original reutilizado y vistas básicas | [ ] Editor, plantillas, descansos, ORT, DST, horas extras, vacaciones, matching con nóminas |
| **Gastos/Banco** | [x] Categorías sobre movimientos guardados | [ ] Importaciones CSV, duplicados, reglas por comercio, revisión, edición y multimoneda |
| **SelfLearn** | [x] Pantalla, sesiones/checkpoints, backend XP y FSRS, tutor opt-in | [ ] Cursos completos **solo idiomas**, NL nivel meta **B2**, EN **C1**; audio/speaking/gramática/tutor y recuperación offline/multidispositivo |
| **Gym** | [x] Historial/borradores/plan parcial y especificación Symmetry | [ ] Biblioteca **≥80 ejercicios**, sets/superseries/RIR/rest, plan Recomp, progresión, fotos privadas, comparador, exportación Hevy/CSV |
| **Skin Routine** | [x] Rutina, notas e inventario parcial | [ ] Productos auténticos, AM/PM, incompatibilidades, calendario, fotos y persistencia en 2 dispositivos |
| **Body / Food** | [x] Rutas de lectura/registro parciales | [ ] Objetivos, pesos y medidas, comidas/macros, compras, presupuestos y edición histórica |
| **Ares Center / AI Inbox** | [x] Chat protegido, lectura/revisiones y actividad; endpoint OpenRouter documentado | [ ] QA respuesta auténtica, tool policies, aprobaciones auditables, acciones solo autorizadas, cuotas, trazas, fallback |
| **Agent Monitor / automatizaciones** | [x] Historial monitorizable y planes | [ ] Orquestación real de n8n solo después de cierre Fase 1, reintentos, idempotencia y seguridad |
| **Quest** | [x] Fórmula legacy de niveles y rutas | [ ] Quests reales y mensurables, recompensa solo basada en eventos verificados, sin duplicar XP |
| **Work / Projects / Notes** | [x] Tareas/proyectos y notas CRUD parciales | [ ] Idea Vault, sprint, Kanban, adjuntos, búsquedas, conflictos concurrentes y rutas profundas |
| **Career / Data Lab** | [x] Ruta React y datos legacy preservados | [ ] Portfolio, skills, casos y laboratorios **SQL/Power BI/Python** aquí, **no en SelfLearn** |
| **News / Car / Settings** | [x] Algunas rutas y exportación | [ ] Funciones clásicas, historial, restauración, PWA, preferencias, errores y privacidad |

**Separación del aprendizaje:** SelfLearn se dedica exclusivamente a idiomas; las competencias de datos (SQL, Power BI, Python) deben figurar en **Career/Data Lab**. No retroceder a la configuración anterior.

## 6. PRIORIDAD P0 — un centro financiero coherente, sin «nóminas por otro lado»

### 6.1 Diseño de navegación

Crear una experiencia **Money** con secciones internas compatibles con el Nocturne existente:

`Resumen · Movimientos · Nóminas · Turnos · Cuentas · Presupuestos · Patrimonio/Objetivos · Análisis · Documentos`

Esta es la **arquitectura funcional propuesta**; las pestañas visibles deben ajustarse al espacio y al design system existente, no reestructurar globalmente la app. En móvil usar patrones accesibles del shell (subnavegación, overflow o vistas segmentadas), nunca 9 tabs comprimidas.

Preservar **deep links** `/dinero`, `/gastos`, `/nominas` y `/turnos` y la compatibilidad de rutas legacy `?app=...` durante coexistencia. Que el usuario tenga un único punto de acceso no significa fusionar tablas, registros de nóminas y movimientos bancarios.

### 6.2 Importador de nóminas — carencia principal

- Portar UI React de carga PDF con selector/drag-drop, MIME/firma, tamaño, validaciones, errores accesibles, progreso, detección de duplicados, confirmación y preview seguro.
- Reutilizar o portar contrato original de `api/payroll-upload.js`, `payroll-upload-ui.js` y `microapps/payroll/*`; comprobar que queda accesible **desde la raíz TanStack**, porque Classic y React tienen bases de funciones distintas.
- Proteger usuario/JWT/RLS, subir a Storage privado, enlazar metadatos/versión, descargar el original y auditar la operación.
- Completar extracción de conceptos, líneas, verificaciones, anomalías, correcciones, saldos, contratos, historiales anual/mensual y trazabilidad.
- QA PDF sintético: importar → validar → corregir → guardar → descargar → cerrar sesión → volver a entrar → datos iguales. Verificar que usuario B jamás lee documento de A.

### 6.3 Política contable para evitar duplicación

- **Nómina devengada** (lo que corresponde cobrar) ≠ **movimiento bancario abonado** (lo efectivamente cobrado).
- Enlazar ambos mediante reconciliación explícita; **NO sumar salario teórico más ingreso bancario como dos entradas de caja**.
- Conservar moneda, bruto/neto, deducciones, periodos, contratos, ORT, overtime, cambios y revisiones.
- No inventar importes ni completar datos desconocidos mediante memoria personal. Cuentas, saldos e ingresos solo desde fuentes verificadas y autorizadas.
- Mantener RLS y `owner_id` de cada tabla. Concurrencia CAS `updated_at`; nunca sobrescritura de JSONB ajeno.

## 7. PRIORIDAD P0 — SelfLearn, Ares, datos y seguridad

### SelfLearn

- Reutilizar motor original NL/EN, checkpoints recuperables, versiones RPC y FSRS. XP **exactamente una vez**, incluso con doble click, retry, respuesta perdida o dos dispositivos.
- Meta NL **B2**, EN **C1**; únicamente idiomas.
- Los cambios de producción descritos en `docs/NOCTURNE-AI-SELFLEARN-REPAIR.md` incluyen migraciones `selflearn_transactions` y `selflearn_capabilities_contract` autorizadas en la fecha documentada. **No volver a ejecutarlas sin verificar historial de migraciones real**.
- Probar con cuenta QA separada un recorrido completo que pase Classic↔Nocturne, cierre/reabra sesión y cambie de dispositivo. Reconciliar estado local offline y la fuente server; preservar IDs de unidades/tarjetas y eventos.
- Tutor con consentimiento, cuota, JWT, cancelación, errores. No incluir materias ajenas.

### Ares AI

- Preservar app Ares, chat, contexto autorizado, consultas de proyecto, historial de decisiones y fuentes.
- Separar rigurosamente: estado técnico `enabled`, prueba real de proveedor, **lectura** de datos, propuesta de acción, **aprobación humana** y ejecución. Nunca presentar una revisión guardada como una acción ejecutada.
- No enviar todos los datos privados a un LLM; allowlist estricta, minimización de contenido, auditoría sin secretos y límites de herramientas.
- Primera fase: consultas y recomendaciones seguras. n8n/acciones externas solo tras Fase 1 (identidad, approvals, seguridad, backups, QA) acreditada.
- Revisar `api/ares-ai.js`, `apps/rise-react/server/ares-ai.mjs`, `apps/rise-react/src/server.ts`, `apps/rise-react/src/routes/ares.tsx` y contratos restantes de `ares-dispatch`, `ares-sources`, `jarvis`, `selflearn-tutor`, `payroll-upload`.

### Datos, backups y privacidad

- Supabase producción ≠ staging; **las diferencias de conteo no justifican copiar registros**. Auditoría de solo lectura por IDs/owner/schema antes de cualquier migración.
- Últimos recuentos históricos orientativos producción/staging: `hub_records` 229/272; `payroll_payslips` 27/1; `payroll_line_items` 241/0; `gym_sessions` 2/0; `news_briefs` 13/0; `skin_routine_logs` 8/5. No asumir que siguen iguales.
- Comparar 21 tablas de usuario, archivos de cuatro buckets y hashes de filas; validar Auth, permisos, RPC, RLS, Storage y restauración **integral** en entorno aislado. El ensayo parcial de 937/289 filas **no alcanza por sí solo** ese nivel.
- El usuario no pudo confirmar si Classic guarda registros solo locales; comprobar en origen/pestaña/dispositivos mediante exportación consentida. `localStorage` no cruza dominios.
- No borrar Classic, cachés, Service Workers ni PWA antigua hasta verificar recuperación. No restaurar en la base real ni ejecutar importaciones masivas silenciosas.
- Advisory histórico: `selflearn_tutor_take_quota()` `SECURITY DEFINER` autenticada y protección contra contraseñas filtradas; evaluar antes de cambiar permisos. Tabla interna `selflearn_tutor_quota` puede tener RLS sin política intencionalmente.

## 8. Plan de ejecución para Claude — priorizado, sin cambio de UI

| Orden | Bloque | Responsable principal | Entregable / puerta de salida |
|---|---|---|---|
| P0.0 | Fijar referencia visual del commit Nocturne actual y matriz de rutas | **Claude** | Screenshots base, tokens/componentes listados, «UI sin rediseño» anexado a PR |
| P0.1 | Verificar último SHA, CI, deployments/aliases y estado de `main`, `staging`, #150 | **Claude** | Tabla evidencia con hashes; PR draft intacto |
| P0.2 | Contratos y matriz completa **Classic → React** por CRUD/API/datos/Storage | **Claude** | Cobertura real con archivo origen/destino y pendientes, no solo pantallas |
| P0.3 | Dinero/Nóminas/Turnos/Gastos integrados visualmente | **Claude** | Money Shell sin romper rutas ni fuentes de verdad |
| P0.4 | Subida de PDF, extracción/correcciones/anomalías y conciliación | **Claude** | E2E con nómina sintética en QA |
| P0.5 | SelfLearn XP/FSRS, tutor, sesiones reales | **Claude** | E2E idempotencia/dos navegadores; #143 |
| P0.6 | Auth, RLS, Storage, backups y restauración completa | **Claude** + ChatGPT | Tests de aislamiento y ensayo restauración sin PII pública |
| P1.1 | Gym + Skin + Body/Food paridad original | **Claude** / ChatGPT auditor | Sesiones, fotos privadas, inventario, edición y persistencia |
| P1.2 | Ares, Project Tracker, Quest, Career, News, Car | **Claude** | Funciones reales, consentimiento y auditabilidad; no agentes ficticios |
| P1.3 | Rendimiento, PWA, offline/sync, mobile, accesibilidad | **Claude** | Matriz navegadores/tamaños y sin regresiones visuales |
| GATE | QA real, rollback probado y aprobación de corte | **Work** / ChatGPT / propietario | Solo entonces promover versión; Classic sigue disponible |

**Flujo:** commits pequeños en rama activa, PR #150 draft hasta completar gates; actualizar estado con SHA, pruebas y capturas. Si dividir trabajo mejora revisión, coordinar sin perder una rama/PR consolidada ni duplicar implementación. Nunca `push --force`, nunca sobrescribir trabajo no inspeccionado y no modificar producción para «acelerar».

### Qué hace cada agente

**Claude — implementación:** React, servicios, SQL aditivo propuesto, tests, contratos API, CI, PWA, documentación, capturas sintéticas. Conservar diseño y elaborar resultados verificables.  
**ChatGPT — auditoría y arquitectura:** comparación de esquemas y pruebas, revisión de seguridad, matrices funcionales, detección de inconsistencias, aceptación técnica y documentación. Puede abrir issues/comentar y crear archivos documentales; no atribuir a ChatGPT verificaciones que no ejecutó.  
**Work — QA humana asistida:** sesiones QA reales, navegador móvil/escritorio, pruebas de importación y flujo, UX visual, almacenamiento local y ensayo reversible. Su uso no es requisito para que Claude avance en código; **no necesita rehacer auditorías ya documentadas**.  
**Propietario — decisión:** aprobación de cambios visuales de alto impacto, permisos/migraciones irreversibles y retirada final de Classic. No trasladar secretos por chat.

## 9. Gates de aceptación que impiden anunciar «terminado»

Marcar cada casilla solo con evidencia: SHA de código, CI del mismo SHA, entorno, timestamp, artefacto y resultado de QA. Estados genéricos (`READY`, `200`) no bastan.

- [ ] **UI congelada:** capturas comparativas Home, Apps, Ares, Money, SelfLearn, Gym, Skin, Body y nuevas vistas confirman mismo sistema Nocturne, sin nueva plantilla.
- [ ] **Paridad 100 %**: ninguna microapp clave obliga a usar Classic para operaciones normales; API y CRUD originales preservados.
- [ ] **Nóminas:** PDF sintético subir/extracción/corrección/descarga; cerrar/reabrir; propietario cruzado denegado.
- [ ] **Dinero:** sin doble contabilización de nómina e ingreso, bancos/cuentas/deudas correctos, presupuestos y turnos trazables.
- [ ] **SelfLearn:** NL/EN, checkpoint, FSRS, XP una sola vez, concurrencia, reintentos, offline/sync y sesión real.
- [ ] **Ares:** prueba autenticada de respuesta con proveedor, 401 sin sesión, allowlist, consentimientos, registro de acciones sin ejecución prematura.
- [ ] **Gym/Skin/Body/Food/Work/Quest/Career:** smoke de cada operación con datos sintéticos, rutas directas, rollback/cambio de cuenta.
- [ ] **Seguridad:** Auth, owner/RLS, Storage privado, grants, RPC, fuga de secretos, protección de sesión, CAS.
- [ ] **Rescate:** 21 tablas + 4 buckets + Auth + estado local conciliados y restaurables en entorno aislado; archivos/hashes verificados.
- [ ] **Móvil/PWA:** 320/375/390/430/768/1440 px, Chromium/WebKit y iPhone físico; cold start, deep links, cache/SW y safe areas.
- [ ] **Ramas/deploy:** `main`/`staging` reconciliadas, SHA UI y datos identificado, CI completo verde, preflight y rollback probados.
- [ ] **Aprobación final:** el usuario valida calidad/resultado; hasta entonces **no borrar Classic ni declarar migración definitiva**.

## 10. Reglas de actualización del documento

A partir de ahora, cada avance de Claude debe modificar esta tabla o el fichero de estado existente con:

`[ ] / [x] · módulo · cambio · PR/commit · test (comando/resultado) · entorno · estado QA real · screenshot de comparación UI (sin PII) · impacto en Classic · rollback · pendientes`.

No reabrir la discusión de «qué diseño escoger»: **la UI Nocturne existente queda establecida**. Si hay que acomodar una nueva microapp, resolver mediante **composición y extensión del design system actual**, no mediante reinicio de diseño.

## 11. Enlaces de trabajo

- Repo: https://github.com/rellmen/renzo-hub
- PR #150: https://github.com/rellmen/renzo-hub/pull/150
- PR #149: https://github.com/rellmen/renzo-hub/pull/149
- Issue #151: https://github.com/rellmen/renzo-hub/issues/151
- Issue #143: https://github.com/rellmen/renzo-hub/issues/143
- Referencia visual Lovable: https://lovable.dev/projects/ca43e152-f7c7-4c8e-b925-01476b9053da
- Docs migración: `docs/NOCTURNE-INTEGRAL-MIGRATION-STATUS.md`, `docs/REACT-MIGRATION-LOVABLE.md`
- Artefactos: `apps/rise-react/src/components/rise/`, `apps/rise-react/src/routes/`, `apps/rise-react/src/lib/`, `apps/rise-react/server/`, `microapps/`, `api/`

---

**Mensaje final de coordinación para Claude:** el objetivo ya no es «crear una nueva interfaz atractiva»; esa decisión está cerrada. Ahora hay que **terminar, conectar, completar y pulir** la aplicación que existe, manteniendo el mismo lenguaje visual y recuperando **cada funcionalidad útil del Classic** hasta que Nocturne sea su reemplazo real y seguro.