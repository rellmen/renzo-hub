# RISE HUB — coordinación del release integral (#76)

**Rama integradora:** `release/body-profile-skin-inventory`. **PR final:** https://github.com/rellmen/renzo-hub/pull/76. **No realizar pushes directos a `main`**. No generar despliegues de Vercel por commit. No cerrar PR #76 ni publicar sin CI completo, pruebas autenticadas en staging y aprobación.

## Contrato para trabajar en paralelo con Claude
Claude debe crear una rama propia **desde el HEAD actual de `main`**, como `feature/claude-profile-work-finance`, y entregar su commit SHA, rutas modificadas y pruebas ejecutadas. **No editar en paralelo** `gym.js`, `profile.js`, `microapps/skin/skin.js`, `index.html`, `sw.js`, `tests/pwa-cache-unique.test.mjs` ni `microapps/gym/goals.js` durante el trabajo de integración de ChatGPT. No crear despliegues ni realizar merge a `main`.

### Claude: trabajo asignado sin colisiones
1. **Work:** propuestas e implementación aislada de registro de turnos, minutos de descanso no remunerado, horas extraordinarias y conciliación con nóminas. No inventar porcentajes de pluses: deben ser configurables y estar documentados.
2. **My Finance:** mejora de presupuestos/deudas/ahorros/calendario; importes históricos **sin declarar vigencia** y con confirmación explícita antes de activar saldos o calendarios. Trabajar solo en `microapps/finance/**` y tests nuevos.
3. **SelfLearn:** lecciones neerlandés A1–A2 hacia B1 usando vocabulario cotidiano y logística; nada de cambiar el progreso histórico.
4. **Ares AI:** preparar un contrato de lectura autorizado con procedencia y fechas; **no incluir datos personales por defecto en prompts enviados a servicios externos**.
5. Escribir pruebas aisladas. Cuando termines, informar archivos, SHA y posibles migraciones.

### ChatGPT: trabajo reservado
- Ajustes y perfil de datos conocidos con fecha/procedencia y confirmación.
- Gym Ascend: objetivos y datos autodeclarados, sin inventar entrenamientos, récords, medidas ni peso actualizado.
- Skin Routine: inventario configurable, historial estable, calendario por fases; no recomendar retinoides combinados.
- Pantalla Home y consolidación final, conflictos Git, caché PWA y CI.

## Datos de referencia (no equivalen a hechos actuales)
- Residencia indicada: Leende, Países Bajos. Idiomas: español, catalán; inglés y neerlandés en estudio.
- Turnos descritos: semana mañana 06:00–15:00; semana tarde 15:00–00:00; descansos habitualmente de 30 min no remunerados. Comprobar turnos concretos antes de generar calendario.
- Estatura comunicada: 1,70 m; peso último comunicado: 84 kg; metas anteriores: 78 y después 74–75 kg. No establecer como peso actual ni crear mediciones.
- Trayectoria logística en entorno ASML, objetivo profesional Logistics Data Analyst; neerlandés aproximado A1–A2 hacia B1.
- Finanzas: **toda cifra histórica requiere reconfirmación**; no sobrescribir registros bancarios.
- Skin: prioridad manchas, tono y reparación de barrera por sequedad/descamación; Arencia, Heliocare Pigment Solution y celimax Retinal Shot, además del inventario del PR #76. Diferin/adapaleno es alternativa, no compatible en la misma pauta con retinal.

## Puertas de calidad
- Tests unitarios + browser/e2e + migraciones/RLS en GitHub Actions.
- Protección de usuario/privacidad, no volcar datos privados en logs.
- Una verificación manual de staging y un único despliegue final de producción cuando Vercel permita.
- PR #76 es el único PR integrador; branches de Claude son ramas de trabajo, no releases desplegables.
