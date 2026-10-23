# Claude · ejecución Nocturne · 23 octubre 2026

Rama `feature/nocturne-integral-migration`, PR #150 (draft → `staging`). Base del handoff `953f1bcb72`. UI Nocturne congelada: solo se añadieron paneles dentro de `SectionCard`/clases existentes; shell, Home, paleta, tipografías y las 7 imágenes Lovable sin cambios (hash verificado por CI). Classic solo leído; copias de lógica Classic son **byte-idénticas** y un test lo exige.

Estados: `DONE+VERIFIED` · `IMPLEMENTED/QA PENDING` · `BLOCKED` · `NOT IMPLEMENTED`.

## Verificado en esta ejecución

- Inicio: HEAD remoto = `953f1bcb72`, CI verde; alias QA `rise-hub-nocturne-qa.vercel.app` → `/api/deployment-info` SHA `953f1bcb72`, proyecto `renzo-hub-2-1-staging`; `/api/supabase-config` → `zpueziugbezqxompwsol` (staging); `/api/payroll-upload` → `configured:false`.
- Local sobre SHA final: **646/646 Node**, **18/18 Vitest**, `tsc --noEmit` y build TanStack OK; 7 scripts `tools/db-replica` en PostgreSQL 17 PASS; mock autenticado Chromium + WebKit iPhone: **22 rutas**, recarga y logout OK; smoke sin sesión 19 rutas protegidas OK.
- Supabase staging (solo lectura): 22/22 tablas con RLS, 4 buckets privados con políticas por carpeta del propietario, 0 funciones SECURITY DEFINER ejecutables por `anon`. Historial de migraciones intacto (no se aplicó nada).

## Bloques

| Bloque | Estado | Commit | Prueba |
|---|---|---|---|
| P0 Payroll credencial staging | BLOCKED | — | `configured:false`; requiere operador con clave server-only de staging |
| P0 Payroll CAS concurrente | DONE+VERIFIED (BD) · HTTP/JWT BLOCKED | 25d3ec0 | 2 conexiones PG17: B espera lock y recibe 40001, 1 corrección, rollback sin pérdida |
| P0 Revisión de capturas concurrente | DONE+VERIFIED (BD) | 25d3ec0 | 1 recibo, 1 evento, 0 `bank_tx` |
| P0 SelfLearn XP/FSRS concurrencia | DONE+VERIFIED (BD) | 4e3739f | 1 repaso por versión, reintento idempotente, 0 XP; finalize ya cubierto por `selflearn_test.sh` |
| P0 Ares contrato de herramientas + entrega | IMPLEMENTED/QA PENDING (apagado) | 207baa4 | 9 tests; deny-by-default, solo preview + flag, bloqueo de finanzas/nóminas/credenciales/Nodalys, CAS de reserva, 1 intento |
| P0 Seguridad advisors | Revisado | — | 3 avisos previos sin cambios (ver abajo) |
| P1 Turnos (Shift Tracker nativo) | IMPLEMENTED/QA PENDING | a4d41f4 | contratos, turnos, descansos, ORT, DST, vacaciones, CSV idéntico a Classic, CAS |
| P1 Quest misiones diarias | IMPLEMENTED/QA PENDING | d521644 | reglas Classic, sin XP desde render |
| P1 News / Agent Monitor filtros | IMPLEMENTED/QA PENDING | 52f52dd | fuentes, búsqueda, alta manual https-only |
| P1 Career formación/skills/portfolio | IMPLEMENTED/QA PENDING | f7f0b16 | evidencias privadas `portfolio-files/<uid>/career`, archivar sin borrar |
| P1 Projects Idea Vault + Sprint | IMPLEMENTED/QA PENDING | 2c5b9af | promoción idempotente, alertas Classic |
| P1 Gym progresión/series/RPC | IMPLEMENTED/QA PENDING | 1297e43 | progression.js idéntico; RPC `gym_save_session_cas` **pendiente, no aplicada** |
| P1 Gym fotos privadas | IMPLEMENTED/QA PENDING | ce71b67 | progress-photos.js idéntico, URLs firmadas 5 min |
| P1 Skin compatibilidad/historial/fotos | IMPLEMENTED/QA PENDING | 10214c8 | reglas solo de notas del catálogo |
| P1 Body objetivos/perfil/historial | IMPLEMENTED/QA PENDING | 023edb9 | sanitizer = Classic, CAS en ajustes y peso |
| P1 Food edición + compra mensual | IMPLEMENTED/QA PENDING | 46d7dd8 | lista = index.html Classic |
| P1 Notas paginación + CAS | IMPLEMENTED/QA PENDING | 06f4966 | hasta 5.000, búsqueda |
| P1 Gastos reglas por comercio | IMPLEMENTED/QA PENDING | ebd0c1e | mismo `money_rule` que Classic |
| P1 Money conciliación ingresos | Ya existía (motor Classic) | — | sin cambios |
| P1 Car/Inbox QA auténtica | BLOCKED | — | requiere sesión QA real |
| P2 CI mock: Storage | DONE+VERIFIED | (este commit) | el mock QA no simulaba `/storage/v1/object/list`; añadido; Chromium + WebKit PASS |

## Preparado, sin aplicar

- `supabase/pending/20261023190000_gym_save_session_cas.sql` + rollback. Solo función nueva (SECURITY INVOKER, `search_path` vacío, `anon` sin EXECUTE). Probada en réplica PG17 con 2 conexiones. El cliente la usa si existe y solo cae al guardado antiguo si la función no está instalada. **Necesita "Autorizo" de Renzo para staging.**
- Entrega Ares → Jarvis: código listo, `ARES_JARVIS_DISPATCH_ENABLED` no configurado. No activar sin autorización y destino Jarvis de staging.

## Avisos de seguridad (staging)

1. `selflearn_tutor_take_quota()` SECURITY DEFINER ejecutable por `authenticated`: **intencional**. Solo incrementa la fila de `auth.uid()`, tope 12/día, `search_path` vacío; la tabla de cuota no tiene políticas para que nadie la escriba directamente. Riesgo residual: un usuario solo puede agotar su propia cuota.
2. Tabla `selflearn_tutor_quota` con RLS sin políticas (INFO): consecuencia deliberada del punto 1.
3. Leaked password protection desactivada: ajuste de Auth del propietario (Dashboard → Auth). No se cambió.

## Pendiente exclusivamente externo

- Credencial Payroll server-only de staging (operador seguro, nunca por chat).
- Sesiones QA reales (cuenta A; la B fue omitida por Renzo, el aislamiento A/B sigue sin PASS).
- Autorización para aplicar la RPC Gym en staging.
- iPhone físico para PWA/offline.
- Exportación de datos locales de Classic desde los dispositivos originales; restauración integral Auth + Storage + filas.
- Reconciliación `main`/`staging` y aprobación de release.

## GO/NO-GO

**NO-GO** para producción y para retirar Classic. Motivos: QA autenticada de los nuevos flujos sin hacer, Payroll upload bloqueado, aislamiento A/B sin PASS, restauración integral no ensayada, iPhone PWA no certificada. `tools/react-cutover-audit.mjs` → `ready:false`.

**GO** para seguir probando en staging: el código compila, los tests pasan y cada escritura nueva está protegida por propietario + versión.

## Rollback

Código: revertir con commits nuevos (sin force-push). Ninguna migración aplicada en esta ejecución. Si se aplica la RPC Gym: `supabase/pending/20261023190000_gym_save_session_cas.rollback.sql` retira solo la función.
