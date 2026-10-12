import { atom, read, update } from 'claude-code'
import type { Register, ToolCallInput } from 'claude-code'

import type { Grants, Scope } from '../types'

// RISE HUB · guardarraíles técnicos (no solo de prompt).
// Lo que Renzo repetía en cada brief de autorización, aplicado en el motor:
// producción y los workflows activos de Jarvis/Nodalys quedan bloqueados salvo que
// Renzo abra una ventana con /autorizo, escrita por él (el modelo no puede abrirla).

const PROD_SUPABASE = 'mgncykyrhavpepfggmng'
const ACTIVE_N8N = ['WH0kGpw0dg83yvdM', 'ELk5v7XYBSohFAce', 'VOKcnoaLBjVXzTka', 'v9C8W9OtTw1bSzFJ', 'IwXFXS47IfjOflkt']
const grants = atom({ plugin: 'renzo-guardrails', key: 'grants' } as const, {} as Grants)
const denied = atom({ plugin: 'renzo-guardrails', key: 'denied' } as const, 0)

type Rule = { scope: Scope | 'nunca'; why: string }

// Devuelve la regla que bloquea la llamada, o undefined si está permitida.
export function judge(e: { tool: string } & Record<string, unknown>): Rule | undefined {
  const tool = String(e.tool)
  if (tool === 'Bash') {
    const c = String(e.command ?? '')
    if (/\bgh\s+pr\s+merge\b/.test(c) || /\bgh\s+api\b[^\n]*pulls\/\d+\/merge/.test(c))
      return { scope: 'nunca', why: 'fusionar PR es siempre de Renzo' }
    if (/\bgit\s+push\b[^\n]*(\s--force\b|\s-f\b|--force-with-lease)/.test(c))
      return { scope: 'nunca', why: 'push --force reescribe historia publicada' }
    if (/\bgit\s+push\b[^\n]*\s(origin\s+)?(HEAD:)?(main|staging)\b/.test(c))
      return { scope: 'nunca', why: 'main y staging solo cambian por PR' }
    if (/\bvercel\b[^\n]*(--prod\b|\bpromote\b|\brollback\b|\balias\b)/.test(c))
      return { scope: 'produccion', why: 'desplegar o promover en Vercel producción' }
    if (c.includes(PROD_SUPABASE) && /\b(supabase|psql|pg_dump|pg_restore)\b/.test(c))
      return { scope: 'produccion', why: 'comando contra la base de producción' }
    if (/\bsupabase\s+(db\s+push|db\s+reset|migration\s+up)\b/.test(c) && !c.includes('zpueziugbezqxompwsol'))
      return { scope: 'produccion', why: 'migración sin proyecto staging explícito' }
    return undefined
  }
  if (tool.startsWith('mcp__Supabase__')) {
    const op = tool.slice('mcp__Supabase__'.length)
    if (['delete_branch', 'merge_branch', 'reset_branch', 'pause_project', 'restore_project', 'rebase_branch'].includes(op))
      return { scope: 'nunca', why: `Supabase ${op}` }
    const project = String(e.project_id ?? '')
    if (project === PROD_SUPABASE && !['list_tables', 'list_migrations', 'list_extensions', 'get_advisors', 'get_project', 'get_project_url', 'search_docs', 'query_logs', 'list_edge_functions', 'list_branches'].includes(op))
      return { scope: 'produccion', why: `Supabase producción: ${op}` }
    return undefined
  }
  if (tool.startsWith('mcp__Vercel__')) {
    const op = tool.slice('mcp__Vercel__'.length)
    if (/^(create_deployment|request_promote|request_rollback|assign_alias|update_project|edit_project_env|create_project_env|start_rolling_release|complete_rolling_release|pause_project|update_firewall_config|put_firewall_config)$/.test(op))
      return { scope: 'produccion', why: `Vercel ${op}` }
    return undefined
  }
  if (tool.startsWith('mcp__n8n__')) {
    const op = tool.slice('mcp__n8n__'.length)
    if (/^(publish_workflow|unpublish_workflow|archive_workflow|publish_agent|unpublish_agent|delete_agent|restore_workflow_version)$/.test(op))
      return { scope: 'jarvis', why: `n8n ${op}` }
    const id = String(e.workflowId ?? e.id ?? '')
    if (op === 'update_workflow' && ACTIVE_N8N.includes(id))
      return { scope: 'jarvis', why: `editar un workflow activo (${id})` }
    return undefined
  }
  return undefined
}

const RULES = `## RISE HUB: reglas permanentes (mod renzo-guardrails)
Estas reglas valen siempre en las tareas de RISE HUB / Renzo HUB / Jarvis, sin que Renzo las repita:
- Renzo fusiona los PR. Tú preparas, das el enlace del PR hacia staging al terminar cada cambio y verificas después.
- Producción (merge a main, Vercel prod, Supabase ${PROD_SUPABASE}) y los workflows activos de n8n están bloqueados técnicamente. Si una acción se bloquea, no la rodees por otra vía: explica qué hace falta y que Renzo puede escribir "/autorizo produccion 30" o "/autorizo jarvis 30".
- Antes de pedir un merge: \`./scripts/renzo-hub preflight <nº>\`. Cuando Renzo diga "publicado": \`./scripts/renzo-hub verify staging|prod <versión>\`. Pega la salida, no la resumas de memoria.
- Formato obligatorio de cada informe: 1) Verificado (con evidencia de este turno), 2) Preparado sin aplicar, 3) Pendiente de Renzo (pasos y enlace), 4) Necesita autorización. Nunca digas "ya está hecho" sin el punto 1; si no pudiste comprobarlo, di "no verificado" y por qué.
- Renzo no usa guiones largos (—) en los textos que le escribes.`

const isPerson = (kind: string) => kind === 'composer' || kind === 'bridge'

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'autorizo', description: 'Abre una ventana de autorización: /autorizo <produccion|jarvis> [minutos]', argumentHint: '<produccion|jarvis> [minutos]' })
    await $.command.register({ name: 'revoco', description: 'Cierra todas las ventanas de autorización abiertas' })
    await $.command.register({ name: 'preflight', description: 'Comprobaciones fijas antes de fusionar un PR de RISE HUB', argumentHint: '[nº PR]' })
    await $.command.register({ name: 'verificar', description: 'Comprobaciones fijas tras publicar RISE HUB', argumentHint: '<staging|prod> [versión]' })
    return next(e)
  })

  on('prompt.compose', async ($, e, next) => {
    const out = await next(e)
    return { sections: [...out.sections, { id: 'renzo-guardrails:reglas', text: RULES, scope: 'session' as const }] }
  })

  on('command.run', { command: 'autorizo' }, async ($, e) => {
    if (!isPerson(e.origin.kind)) return { text: 'Solo Renzo puede autorizar, escribiéndolo él.' }
    const [scope, mins] = e.args.trim().split(/\s+/)
    if (scope !== 'produccion' && scope !== 'jarvis') return { text: 'Uso: /autorizo produccion|jarvis [minutos, por defecto 30, máximo 120]' }
    const minutes = Math.min(120, Math.max(1, Number(mins) || 30))
    const until = (await $.clock.now()) + minutes * 60_000
    await update($, grants, g => ({ ...g, [scope]: until }))
    $.ui.status(`autorizado: ${scope} (${minutes} min)`)
    return { text: `Autorizado ${scope} durante ${minutes} min. Se cierra solo; /revoco lo cierra ya.`, context: [`Renzo ha autorizado "${scope}" durante ${minutes} minutos. Lo demás sigue bloqueado.`] }
  })

  on('command.run', { command: 'revoco' }, async $ => {
    await update($, grants, () => ({}))
    $.ui.status(undefined)
    return { text: 'Autorizaciones cerradas.', context: ['Renzo ha cerrado todas las autorizaciones.'] }
  })

  on('command.run', { command: 'preflight' }, async ($, e) => {
    const pr = e.args.trim()
    await $.prompt.submit({ text: `Preflight de RISE HUB${pr ? ` para el PR #${pr}` : ' para el PR de la rama actual'}: ejecuta \`./scripts/renzo-hub preflight ${pr}\` en el clon del repo, pega la salida tal cual y dime si puedo fusionar. Si algo FALLA, dime cómo lo arreglas. No fusiones nada.` })
    return { text: 'Lanzando el preflight…' }
  })

  on('command.run', { command: 'verificar' }, async ($, e) => {
    const [env = 'staging', version = ''] = e.args.trim().split(/\s+/)
    await $.prompt.submit({ text: `He publicado. Verifica RISE HUB en ${env}: ejecuta \`./scripts/renzo-hub verify ${env} ${version} --smoke\` (en staging con el bypass de Vercel si lo tienes), pega la salida tal cual y dame el informe con el formato obligatorio.` })
    return { text: `Lanzando la verificación de ${env}…` }
  })

  on('tool.call', async ($, e, next) => {
    const rule = judge(e as ToolCallInput & Record<string, unknown>)
    if (!rule) return next(e)
    const now = await $.clock.now()
    const g = await read($, grants)
    if (rule.scope !== 'nunca' && (g[rule.scope] ?? 0) > now) return next(e)
    await update($, denied, n => n + 1)
    $.ui.toast(`Bloqueado: ${rule.why}`)
    const how = rule.scope === 'nunca'
      ? 'Esto no se autoriza: lo hace Renzo a mano.'
      : `Renzo puede escribir "/autorizo ${rule.scope} 30" si quiere permitirlo.`
    return { deny: `renzo-guardrails: bloqueado (${rule.why}). ${how} No lo intentes por otra vía.` }
  }).catch(($, e, next) => (next.called ? next(e) : { deny: 'renzo-guardrails: el guardarraíl falló; acción bloqueada por seguridad.' }))
}
