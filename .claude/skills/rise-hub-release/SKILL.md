---
name: rise-hub-release
description: Llevar un cambio de RISE HUB de feature a staging y, con OK de Renzo, a producción, con preflight, verify y el informe obligatorio. Úsala al terminar cualquier cambio del repo o cuando Renzo diga "publicado".
---

# Release de RISE HUB

Sigue `AGENTS.md` y `docs/RELEASE-CHECKLIST.md`. Esta skill es el orden de los pasos.

## 1. Antes de abrir el PR
1. Rama `feature/<tarea>` desde `staging` actualizado. Nunca trabajar sobre `main` ni `staging`.
2. Si cambia la app publicada: sube `release.json`, renombra `CACHE` en `sw.js` y añade la entrada en `RENZO-HUB-CURRENT.md`.
3. `npm run check` y `npm test` en verde. Si toca Nóminas, también `tests/e2e/payroll.mjs`.
4. Migraciones: solo aditivas, con rollback en `supabase/rollbacks/`, probadas en réplica (`tools/db-replica/`). Las de producción van a `supabase/pending/`.

## 2. Abrir el PR y dar el enlace
- PR hacia `staging` con la plantilla de `.github/pull_request_template.md`. Commits y PR con la atribución de la sesión.
- `./scripts/renzo-hub preflight <nº>`: pega la salida tal cual. Con alguna FALLA, arréglala antes de pedir el merge.
- Da a Renzo el enlace y estas instrucciones: "Create a merge commit", **no borrar la rama `staging`**.
- Tú no fusionas nunca. El mod `renzo-guardrails` lo bloquea.

## 3. Cuando Renzo diga "publicado"
- `./scripts/renzo-hub verify staging <versión> --smoke` (necesita `VERCEL_PROTECTION_BYPASS` en la shell; si no está, dilo y no lo des por verificado).
- Producción: solo con OK explícito de Renzo, PR `staging` → `main`, y después `verify prod <versión> --smoke`.

## 4. Informe (formato obligatorio)
1. **Verificado:** con la salida del comando, el hash o la URL.
2. **Preparado, sin aplicar.**
3. **Pendiente de Renzo:** pasos numerados y enlace.
4. **Necesita autorización.**
Sin el punto 1 no digas "hecho". Sin guiones largos. Si Renzo pide un documento, va en PDF y se guarda también en la bóveda del proyecto.
