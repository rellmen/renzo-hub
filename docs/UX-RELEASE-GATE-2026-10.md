# RISE HUB — UX release gate (fases 5–11)

## Alcance verificado en repositorio
- 5 Body: hojas de estilo reales para Gym, Food y Skin; este lote añade controles táctiles, focus visible, corrección de overflow y motion reducido. No sustituye lógica de negocio.
- 6 SelfLearn: accesibilidad de unidades, navegación y feedback; **persistencia del progreso requiere validación autenticada de extremo a extremo antes de publicar**.
- 7 Ares: foco, teclado móvil y sugerencias; **no se habilitan automatizaciones ni accesos nuevos a datos**.
- 8 Finance, Work, System: coherencia de formularios, foco y overflow; sin alterar cuentas ni importes.
- 9 Design System: se refuerzan estados de enfoque, tamaño táctil y preferencia de movimiento reducido en estilos compartidos.
- 10 QA: GitHub CI automatizado y revisión manual requerida.
- 11 Release: `main` / producción **bloqueada hasta completar los criterios siguientes**.

## QA obligatoria antes de merge a main
- [ ] CI del PR y CI de staging verdes (Chromium/WebKit, mobile audits y pruebas financieras).
- [ ] Revisar 320 / 390 / 768 / 1440 px, incluyendo orientación horizontal y safe areas.
- [ ] Login / logout real; rutas directas; navegación Hoy, Body, Ares, Learn y Más.
- [ ] Gym: sesión, ejercicio, descanso, guardado y reapertura; comprobar accesibilidad.
- [ ] Food: registro de comida y lista de compra, persistencia tras reinicio.
- [ ] Skin: rutina AM/PM y checks, persistencia tras reinicio.
- [ ] SelfLearn: completar ejercicio, XP/progreso, cerrar sesión y volver a iniciar, comprobando Supabase y ausencia de duplicados.
- [ ] Ares: abrir/cerrar en móvil, teclado, mensajes, estados de error, sin revelar datos ajenos.
- [ ] Finanzas/Nóminas: precisión de importes, datos vacíos sin cifras ficticias y control de privacidad.
- [ ] Work, Sistema: sin enlaces rotos ni controles engañosos.
- [ ] Auditar consola y red sin errores; comprobar que la nueva UI no altera datos ni RLS.
- [ ] Capturas comparativas en preview autenticado y revisión humana.

## Salida a producción
1. Congelar staging y validar su SHA exacto, no solo el PR.
2. Confirmar propietario de Vercel, target de producción y rollback anterior.
3. Fusionar staging a main solo tras QA. Comprobar SHA de despliegue, URL pública, rutas críticas y errores.
4. Si hay regresión, revertir el cambio en main o redeploy anterior; nunca modificar datos manualmente como rollback visual.

## No cubierto por este rediseño
Nuevas acciones de Ares AI, n8n, sincronización bidireccional externa o reparaciones funcionales no verificadas. El diseño no demuestra que esos sistemas estén implementados.
