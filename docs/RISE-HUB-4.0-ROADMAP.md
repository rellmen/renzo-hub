# RISE HUB 4.0 · Plan maestro por fases

Fecha de inicio: 14 octubre 2026. Estado: **fase 0 en validación**; ninguna otra fase en desarrollo. Propietario: usuario de RISE HUB; producto **personal**, completamente independiente de Nodalys. Fuente visible: Work → RISE HUB 4.0. Plan estructurado: `microapps/work/roadmap.js`.

## Objetivo
Completar las microapps existentes antes de iniciar la siguiente; preservar lo que ya funciona, mantener información personal privada, evitar duplicar módulos y permitir que Ares proponga acciones basadas en registros verificables. **No se garantiza ausencia absoluta de errores**: se exige un criterio de aceptación medible y revisiones tras el despliegue.

## Estimación de dedicación, no fechas garantizadas

Fase | Contenido | Horas
--- | --- | ---:
0 | Inventario, plan maestro y tablero Work | 6–10
1 | Payroll/Shift Tracker y auditoría de horas | 35–55
2 | My Finance y objetivos | 30–55
3 | SelfLearn: speaking, grammar, listening, writing y ruta B1–B2 | 70–120
4 | Gym: cargas, progresión, recuperación y visualización | 35–55
5 | Food: comidas, compra y presupuesto | 30–50
6 | Skin: productos, calendario y seguimiento | 16–26
7 | Career: SQL/BI/Python y laboratorios de logística | 45–70
8 | Work: sprints, Kanban, Idea Vault y cierre | 30–45
9 | Ares Intelligence: enlaces entre apps, tendencias e informes | 60–100
10 | RISE RPG: XP, misiones, niveles y recompensas verificables | 25–40
**Total** | **Una fase a la vez** | **382–626 h**

A 20 horas de trabajo efectivo por semana: aproximadamente 19–32 semanas (5–8 meses). No implica trabajo autónomo ininterrumpido; requiere sesiones de implementación y validación, disponibilidad de credenciales de prueba y aceptación de requisitos.

## Estado y control
- `queued`: no se modifica la microapp hasta que termine la fase anterior.
- `active`: desarrollo y pruebas locales; no equivale a desplegado.
- `validation`: código preparado, falta alguna prueba o despliegue.
- `closed`: PR fusionado, CI verde, staging probado, producción READY y smoke posteriores verificados, documentación y posibles incidencias cerradas.
- Solo una fase puede estar en `active` o `validation` y una fase N no puede cerrarse con una fase anterior pendiente.
- Cambios urgentes de seguridad o incidentes de producción pueden interrumpir el trabajo por razones operativas y se registrarán aparte, sin cambiar el orden del roadmap.

## Definition of Done (aplicable a cada fase)
1. Alcance, límites, riesgos, casos de borde y criterios de aceptación establecidos antes de codificar.
2. Pruebas unitarias, componentes y E2E con datos ficticios, errores y ausencia de datos; sin regresiones con módulos existentes.
3. Prueba autenticada en Supabase **staging** (proyecto `zpueziugbezqxompwsol`) con RLS; revisar que los datos de la cuenta de QA se restauran.
4. Móvil y escritorio, accesibilidad básica, permisos, privacidad, estados vacíos, carga lenta y estabilidad; no exponer claves o datos privados.
5. PR con revisión y CI verde; staging probado y producción `READY` después de la autorización; URLs/versiones y rollback documentados.
6. Cierre comunicado con: hecho y evidencia (commits, pruebas, URL), alcance excluido, limitaciones, decisiones pendientes y siguiente fase.

## Fase 1 · Payroll + Shift Tracker (primer desarrollo funcional)
**No sustituir nóminas existentes.** Modelar agencias/empleadores, convenio/contrato, salario base, días, comienzo/fin, descansos con duración real y si son pagados, horas nocturnas y ORT por intervalos, horas extra y excepciones por festivos. Los porcentajes deben ser configurables y explícitos; no asumir legalidad o tarifa universal en Países Bajos. Calcular cortes de turno que atraviesan medianoche, con zona horaria `Europe/Amsterdam`, y evitar dobles pluses mediante una regla declarada. Explicar las horas reconocidas y el cálculo por línea. Guardar cambios con RLS; permitir CSV/exportación personal, comparar con nómina oficial **revisada** y no presentar el estimado como pago confirmado. Pruebas de medianoche, cambio de horario, descansos no pagados y días sin turnos.

**Criterio de salida de fase 1**: al menos un ciclo semanal validado con datos de prueba, ejemplo con turno que cruce las 18:00 y las 00:00, descanso no pagado, cambios de agencia y un diferencial entre estimado y nómina real; errores visibles, reconciliación y reporte reproducible. Integración con My Finance únicamente en la fase 2, a partir de importes confirmados, para evitar duplicados.

## Riesgos y dependencias
- Contratos y porcentajes de ORT por agencia: faltan reglas confirmadas por el propietario; motor debe permitir configuración y advertir «sin datos» hasta entonces.
- Los servicios de voz y tutor generativo SelfLearn pueden requerir permisos, proveedor, privacidad y presupuestos. No activar cobros por API sin decisión expresa.
- Integración de bancos: CSV primero, acceso a entidades reguladas únicamente con consentimiento y conector autorizado.
- Ares, Claude, Hermes y Jarvis: aprobar una tarea no equivale a ejecutarla; no dar privilegios o automatización sin conectores auditables.
- No compartir código, datos empresariales ni credenciales con proyectos Nodalys.
- La versión de staging puede divergir de producción: realizar integración selectiva con revisión de diferencias, sin forzar ramas ni arrastrar cambios ajenos.

## Informe estándar tras cada cierre
`Fase n` · `Estado: cerrada` · `release` · `hash del PR` · `tests + E2E` · `staging/prod READY` · `datos reales validados` · `qué no está incluido` · `problemas resueltos` · `fase siguiente`.
