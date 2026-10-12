# Mods de Claude para RISE HUB

Dos mods para Claude Code (terminal o la pestaña Code de la app de escritorio):

| Mod | Qué hace |
|---|---|
| `renzo-guardrails` | Bloquea técnicamente producción y los workflows activos de Jarvis/Nodalys. `/autorizo produccion 30` o `/autorizo jarvis 30` abre una ventana temporal (solo si la escribe Renzo); `/revoco` la cierra. Fija las reglas y el formato de informe en el prompt. `/preflight [nº PR]` y `/verificar <staging\|prod> [versión]`. |
| `agentes-panel` | `/agentes`: dashboard con lo que hacen Claude y sus subagentes en vivo (por sistema, errores, bloqueos) y una pestaña n8n con Jarvis, Payroll Agent, HUB Tools, Nodalys: activo, última ejecución, éxitos y errores en 7 días. |

## Instalar

En una sesión de Claude Code en la terminal:

```
/plugin install renzo-guardrails --marketplace rellmen/renzo-hub
/plugin install agentes-panel --marketplace rellmen/renzo-hub
```

Responde `y` para añadir el marketplace y elige el ámbito de usuario. El repo es privado: `gh` tiene que tener sesión.

## Desarrollo

`claude plugin validate claude-mods/<mod>` y `claude plugin test claude-mods/<mod>`.
