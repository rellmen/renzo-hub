# RISE PRIORITY · Fase 1 · matriz, QA y gates (27-10-2026)

Encargo: «RISE PRIORITY · especificación y plan de continuación para Claude Code» (27-10-2026). PR #172, rama `feature/rise-priority-checklist-20261027`, base `staging` @ `04c20c8`. PR en **borrador**; sin fusión, sin producción, sin migraciones, sin cambios Classic.

## 1. Continuidad (G0)
| Comprobación | Resultado |
| --- | --- |
| PR #172 al empezar | Abierto, draft, no fusionado; HEAD `985f7be`, base `04c20c8`; 6 archivos, +379; 0 revisiones, 0 comentarios de revisión. Coincide con la instantánea del encargo. |
| Checks del HEAD inicial | 6/6 success. Anotaciones: solo avisos de infraestructura (Node 20 deprecado, migración a Ubuntu 26). |
| Relación con #150 | #150 fusionado en `staging` (merge `c5d70c3`, ancestro de la base `04c20c8`). Sin dependencia pendiente; no se cambia la base. |
| Forma de continuar | Commits nuevos sobre la rama existente; push en avance rápido verificado (`git merge-base --is-ancestor`), sin force-push ni reescritura. |
| Checkout | El canónico `~/Projects/RENZO-HUB/repo` está en el Mac de Renzo; aquí se usó un clon limpio de `rellmen/renzo-hub` en la rama del PR. `./scripts/renzo-hub status`: producción 2.55.0 al día; preview staging no verificable (SSO). |

## 2. Matriz requisito → implementación → evidencia
Estado: E = existía, P = parcial al empezar, — = pendiente al empezar. «Ahora» es el estado tras este trabajo.

| Requisito (§ encargo) | Archivo / función | Al empezar | Brecha | Acción mínima | Ahora | Evidencia |
| --- | --- | --- | --- | --- | --- | --- |
| Panel antes del roadmap, 5 pendientes, contadores, ver todas (§5) | `routes/index.tsx`, `PriorityBoard` | E | — | Conservar | Cumple | E2E: orden DOM panel→roadmap |
| P0–P3 con etiqueta textual, fecha, tipo, motivo, origen (§5) | `PriorityBoard` | P | Sin aviso de motivo vacío, sin estado Work | «Motivo pendiente de definir», estado Work visible | Cumple | Test componente + captura |
| Completar/reabrir sin perder campos (§5) | `patchPriorityTask`, `reopenStatusFor` | P | Reabría siempre a `Today` sin decirlo | `reopenStatus` + texto «Al reabrirla vuelve a…» | Cumple | Tests unitarios y de componente |
| Orden P0→P3, vencidas, fecha, sin fecha, título; P3 vencida no sube (§5) | `sortPriorityTasks` | E | Sin prueba de todos los empates | Test | Cumple | Test «dentro de un nivel…» |
| Carga/vacío/error/guardado; offline sin éxito falso (§5) | `PriorityBoard` | P | Offline: TanStack **pausaba** la mutación y la reenviaba sola | `networkMode:"always"` + `ensureOnline` | Cumple | E2E offline + no reenvío al volver la red |
| Límite 300/500 declarado (§5) | `WORK_LOAD_LIMIT` | — | Contadores aparentaban ser totales | Aviso visible y test que liga el límite a Work | Cumple (límite informado, sin paginar) | Test límite + test componente |
| Escritura solo con sesión; limpiar al cambiar de cuenta (§5) | `PriorityBoard` (remontaje por uid), `__root` `queryClient.clear()` | P | Borradores en estado local | `key` por cuenta; botones deshabilitados sin sesión | Cumple | Tests «sin sesión» y «cambio de cuenta» |
| Motivo obligatorio en altas y asignaciones (§5) | `validatePriorityInput` | — | `why` podía ir vacío (brecha 4) | `requireWhy` | Cumple | Tests |
| Fechas civiles, Europe/Amsterdam, medianoche y cambio horario (§5) | `riseToday`, `isCivilDate` | — | Zona del dispositivo (brecha 5); `safeDate` recortaba (brecha 3) | Intl con zona fija; validación sin recorte | Cumple | Tests 24/25-oct y 28/29-mar |
| Plazo externo con fecha y evidencia (§5, §7) | `validatePriorityInput`, editor | — | `real` sin fecha ni evidencia (brecha 4) | Evidencia + casilla de comprobación humana | Cumple | Tests unitarios, componente y E2E |
| Validación estricta en el límite de confianza (§6) | `validatePriorityInput`, `parseRaw` | — | Defaults silenciosos y recortes (brecha 3) | Rechazar enums, tipos, longitudes, campos no admitidos | Cumple | 12 entradas inválidas probadas |
| `priority` Work intacto; lectura no persiste conversión (§6) | `patchPriorityTask` | E | Sin prueba explícita | Tests | Cumple | Tests + E2E (`priority`, `project` intactos) |
| Excluir `_cloudUpdatedAt`/`_local` del payload (§6) | `patchPriorityTask` | E | Sin prueba | Test | Cumple | Test |
| CAS con `updated_at`; 0 filas = conflicto; trigger renueva (§6) | `patchPriorityTask`, `PriorityConflictError` | P | Conflicto sin versión remota; no distinguía «ya no existe» | Consulta tras 0 filas | Cumple | Tests + SQL staging + E2E |
| Conflicto conserva borrador y reaplica a petición (§6) | `Editor` | — | Borrador sin comparación ni reaplicación guiada | Panel de conflicto | Cumple | Test componente + E2E |
| Alta confirmada; respuesta vacía ≠ éxito; consultar UUID tras pérdida (§6) | `createPriorityTask`, `persistProposal`, `findPriorityTask` | — | UUID nuevo en cada intento (brecha 2) | UUID estable, búsqueda previa, 23505 → recuperar | Cumple | Tests + E2E con conexión cortada tras el alta |
| RLS A/B/anónimo, reasignar propietario (§6) | Supabase staging | — | Solo mocks (brecha 6) | Prueba SQL con roles y JWT simulados, con rollback | Cumple en BD | §3.2 |
| Revisión: todos los campos, seleccionar/editar/descartar, confirmar (§7) | `ProposalCard`, `reviewPriorityProposals` | — | Aprobación en bloque y campos parciales (brecha 1) | Tarjeta por propuesta | Cumple | Tests componente + E2E |
| Metadatos de evidencia compatibles (§7) | `proposalEvidence` | — | No existían | Campos opcionales | Cumple | Tests |
| Duplicado no modifica existente; no reabre (§7) | `reviewPriorityProposals` | P | Solo filtraba en silencio | Aviso, sin selección, «Abrir la existente» | Cumple | Test componente |
| Reintento parcial y doble clic (§7) | `saveSelected` (cerrojo), estado por propuesta | — | Reintento podía duplicar | Estado por tarea, reintento de pendientes | Cumple | Tests componente + E2E |
| Texto como texto, sin ejecutar nada (§6) | Render React, `sourceRef` sin enlace | E | `sourceRef` sin validar | Solo texto o `https://`, se muestra como texto | Cumple | Test |
| «Historial» no sugiere auditoría (brecha 7) | `RISE-PRIORITY-PROTOCOL.md` | — | Decía «historial visible» | Corregido | Cumple | Doc |
| Accesibilidad (§10) | `PriorityBoard` | P | Sin comprobar | Foco en editor, nombres accesibles, alertas con `role=alert`, prioridad con texto | Cumple (automático) | E2E: 0 controles sin nombre, foco |
| iPhone/desktop sin desbordar (§10) | `PriorityBoard` | — | Sin comprobar | E2E 360/390/430 | Cumple en emulación | E2E + capturas |

## 3. Evidencia
### 3.1 Local, SHA de código `8938437` (rama del PR)
Entorno: clon limpio en contenedor Linux, Node 22, npm 11; dependencias instaladas como el CI (`npm install --no-package-lock` en `apps/rise-react`).
| Comando | Resultado |
| --- | --- |
| `npx vitest run src/test/priority-records.test.ts` antes de implementar | 22 fallos de 28: brechas reproducidas (p. ej. `2026-11-08T00:00` aceptado; `riseToday` inexistente) |
| `npx vitest run` | 14 archivos, **110 tests OK** (incluye 28 de reglas + 16 de componente nuevos) |
| `./node_modules/.bin/tsc --noEmit` (comando real del CI; no existe script `typecheck`) | exit 0 |
| `npm run build` | exit 0 |
| `npx eslint` sobre los 4 archivos del PR | 0 errores de reglas (antes 7 `no-explicit-any`); quedan errores `prettier/prettier` de formato, igual que la base (`routes/index.tsx` ya tenía 138). ESLint no forma parte del CI. `npm run lint` del repo completo superó 10 min y se detuvo: **no verificado** completo. |
| `node tests/e2e/priority-visual-mock.mjs` (Vite dev + Playwright, Supabase simulado) | PASS Chromium escritorio 1440×900 y PASS emulación iPhone 13 **con Chromium** (`QA_IPHONE_ENGINE=chromium`, WebKit no instalado aquí). En CI corre con WebKit. |

El E2E detectó un fallo que los tests jsdom no veían: sin conexión, TanStack Query **pausaba** la escritura (sin mensaje, botones bloqueados) y la reenviaba sola al volver la red. Corregido en `8938437`.

### 3.2 Supabase staging `zpueziugbezqxompwsol` (confirmado por nombre «Renzo Hub Staging»)
Solo lectura de catálogo + un bloque `DO` que termina en `RAISE` para forzar **ROLLBACK**. Usuarios A y B: los dos usuarios existentes de staging (IDs no impresos). Filas sintéticas `[QA sintético RISE PRIORITY]`.

- Catálogo: RLS activa en `hub_records`; políticas `select/insert/update/delete_own` (`owner_id = auth.uid()`) solo para `authenticated`; `anon` sin GRANT; trigger `hub_records_set_updated_at` `BEFORE UPDATE` (`new.updated_at := now()`).
- Resultado: A inserta la suya ✔ · A no puede insertar como B (42501) ✔ · CAS: 1.ª escritura 1 fila, `updated_at` cambia, instantánea vieja 0 filas, título no pisado ✔ · A no puede reasignar a B (42501) ✔ · B lee/ve/actualiza/borra lo de A: 0/0/0/0 ✔ · A lee/actualiza lo de B: 0/0 ✔ · anónimo no lee ni inserta (42501) ✔.
- Después: 0 filas QA, 0 tareas Work en staging.
- Límite: los dos «sesiones» son JWT simulados en la misma conexión de base de datos, no dos dispositivos ni la API HTTP. Producción no se consultó.

### 3.3 Sin verificar (causa)
- Ida y vuelta **Home → Work → Home con sesión real** en la preview de staging: no hay credenciales de una cuenta de staging en este entorno.
- **iPhone físico** (Safari/PWA) y lector de pantalla real (VoiceOver).
- Escala real con más de 300 tareas (staging tiene 0 tareas Work): cubierta solo con datos simulados.

## 4. Gates
| Gate | Estado | Evidencia / motivo |
| --- | --- | --- |
| G0 Continuidad | **PASS** | §1 |
| G1 Alcance | **PASS** | Diff: `apps/rise-react` (panel, reglas, tests), `docs/`, `tests/e2e/priority-visual-mock.mjs` y `.github/workflows/react-nocturne.yml` (añade el E2E y sube el timeout 12→20 min). Sin Classic, sin `release.json`/`sw.js`, sin migraciones, sin secretos, sin dependencias nuevas. |
| G2 Función | **BLOQUEADO** | Lógica, UI y E2E simulado completos; falta la prueba con sesión real en staging (§3.3). |
| G3 Revisión humana | **PASS** | Tests de componente + E2E: revisar no escribe; selección, edición y descarte; plazo externo bloqueado sin comprobar; sin escritura automática. |
| G4 Integridad y seguridad | **PASS** (BD) | RLS A/B/anónimo y CAS en staging (§3.2); reintento parcial y respuesta perdida (tests + E2E). Pendiente: dos dispositivos reales. |
| G5 Calidad | **BLOQUEADO** | Tests, tipos y build verdes; CI del SHA final en el PR. Falta QA en iPhone físico y lector de pantalla; lint completo no verificado. |
| G6 Entrega | **PASS** | Protocolo, esta matriz y `RENZO-HUB-CURRENT.md` actualizados; PR en borrador. |

**Conclusión:** Fase 1 no está «preparada para revisión» en el sentido del encargo mientras G2 y G5 sigan bloqueados por pruebas que necesitan a Renzo (sesión de staging e iPhone). Pasar gates no autoriza integración ni publicación.
