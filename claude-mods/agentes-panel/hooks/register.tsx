import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { Call, FlowRow, FlowsState, Subagent, View } from '../types'

// Dashboard de agentes de RISE HUB.
// Pestaña "Claude": cada herramienta que usan Claude y sus subagentes, en vivo, agrupada por sistema.
// Pestaña "n8n": Jarvis, Payroll Agent, HUB Tools, Nodalys… con su última ejecución y las de 7 días.

const PANE = 'agentes'
const calls = atom({ plugin: 'agentes-panel', key: 'calls' } as const, [] as Call[])
const subagents = atom({ plugin: 'agentes-panel', key: 'subagents' } as const, [] as Subagent[])
const flows = atom({ plugin: 'agentes-panel', key: 'flows' } as const, { rows: [], updatedAt: 0, error: '' } as FlowsState)
const view = atom({ plugin: 'agentes-panel', key: 'view' } as const, 'claude' as View)
const isLoading = atom({ plugin: 'agentes-panel', key: 'isLoading' } as const, false)

const MCP_NAMES: Record<string, string> = {
  n8n: 'n8n / Jarvis', Supabase: 'Supabase', Vercel: 'Vercel', memory: 'Memoria', claude_ai: 'Claude.ai',
  'remote-devices': 'Tu Mac', Remote_Desktop_Commander: 'Tu Mac', Gmail: 'Gmail', Google_Drive: 'Drive',
  Notion: 'Notion', Lovable: 'Lovable', Figma: 'Figma', visualize: 'Visual', widgets: 'Widgets',
}

export function systemOf(tool: string, e: Record<string, unknown>): string {
  if (tool.startsWith('mcp__')) {
    const server = tool.split('__')[1] ?? 'MCP'
    return MCP_NAMES[server] ?? server
  }
  if (tool === 'Bash') {
    const c = String(e.command ?? '')
    if (/\bgh\b/.test(c)) return 'GitHub'
    if (/\bgit\b/.test(c)) return 'Git'
    if (/\bvercel\b|vercel\.app/.test(c)) return 'Vercel'
    if (/\bsupabase\b|\bpsql\b/.test(c)) return 'Supabase'
    if (/\b(npm|node)\b[^\n]*(test|smoke|e2e|check)|renzo-hub (preflight|verify)/.test(c)) return 'Pruebas'
    return 'Shell'
  }
  if (['Read', 'Write', 'Edit', 'Glob', 'Grep', 'NotebookEdit'].includes(tool)) return 'Archivos'
  if (tool === 'WebSearch' || tool === 'WebFetch') return 'Web'
  if (tool === 'Agent' || tool === 'SendMessage') return 'Subagentes'
  if (tool.startsWith('Task')) return 'Tareas'
  if (tool.startsWith('Artifact')) return 'Artifacts'
  if (tool === 'Projects') return 'Bóveda'
  return tool
}

export function detailOf(tool: string, e: Record<string, unknown>): string {
  const s = (v: unknown) => String(v ?? '')
  if (tool === 'Bash') return s(e.description) || s(e.command).slice(0, 70)
  if (['Read', 'Write', 'Edit', 'NotebookEdit'].includes(tool)) return s(e.file_path || e.notebook_path).split('/').pop() ?? ''
  if (tool === 'WebSearch') return s(e.query)
  if (tool === 'WebFetch') { try { return new URL(s(e.url)).host } catch { return s(e.url).slice(0, 50) } }
  if (tool === 'Agent') return `${s(e.subagent_type) || 'general'}: ${s(e.description)}`
  if (tool === 'Glob' || tool === 'Grep') return s(e.pattern)
  if (tool.startsWith('mcp__')) return tool.split('__').slice(2).join('__')
  return s(e.subject || e.description || e.method || e.action).slice(0, 60)
}

const ago = (now: number, t: number) => {
  const s = Math.max(0, Math.round((now - t) / 1000))
  if (s < 60) return `${s}s`
  if (s < 3600) return `${Math.round(s / 60)}m`
  if (s < 86400) return `${Math.round(s / 3600)}h`
  return `${Math.round(s / 86400)}d`
}
const dur = (ms: number) => (ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(ms < 10000 ? 1 : 0)}s`)
const GLYPH: Record<Call['status'], string> = { run: '…', ok: '✓', error: '✗', bloqueado: '⊘' }
const COLOR: Record<Call['status'], 'warning' | 'success' | 'error' | 'subtle'> = { run: 'warning', ok: 'success', error: 'error', bloqueado: 'error' }

const parse = (text: string | undefined): any => {
  if (!text) return undefined
  try { return JSON.parse(text) } catch { const m = text.match(/\{[\s\S]*\}/); try { return m ? JSON.parse(m[0]) : undefined } catch { return undefined } }
}

let isRefreshing = false

async function refreshFlows($: EngineInterface) {
  if (isRefreshing) return
  isRefreshing = true
  await update($, isLoading, () => true)
  try {
    const now = await $.clock.now()
    const wf = await $.tool.call({ tool: 'mcp__n8n__search_workflows', limit: 100 } as any)
    const ex = await $.tool.call({ tool: 'mcp__n8n__search_workflow_executions', limit: 200, startedAfter: new Date(now - 7 * 86400_000).toISOString() } as any)
    if (wf.deny || ex.deny) throw new Error(wf.deny || ex.deny)
    const workflows: any[] = parse(wf.text)?.data ?? []
    const runs: any[] = parse(ex.text)?.data ?? []
    if (!workflows.length) throw new Error('n8n no devolvió workflows')
    const rows: FlowRow[] = workflows.map(w => {
      const mine = runs.filter(r => r.workflowId === w.id).sort((a, b) => String(b.startedAt).localeCompare(String(a.startedAt)))
      return {
        id: w.id, name: String(w.name), isActive: Boolean(w.active),
        lastStatus: mine[0]?.status ?? 'sin ejecuciones', lastAt: mine[0]?.startedAt ?? '',
        ok7: mine.filter(r => r.status === 'success').length,
        err7: mine.filter(r => ['error', 'crashed'].includes(r.status)).length,
      }
    }).sort((a, b) => Number(b.isActive) - Number(a.isActive) || b.lastAt.localeCompare(a.lastAt))
    await update($, flows, () => ({ rows, updatedAt: now, error: '' }))
  } catch (err) {
    const now = await $.clock.now()
    await update($, flows, f => ({ ...f, updatedAt: now, error: String((err as Error)?.message ?? err).slice(0, 200) }))
  } finally {
    isRefreshing = false
    await update($, isLoading, () => false)
  }
}


export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'agentes', description: 'Abre el dashboard de agentes (Claude, subagentes y n8n)' })
    // Se abre solo donde hay sitio para un panel lateral; si no, espera a /agentes.
    void $.ui.open({ id: PANE, title: 'Agentes' })
    return next(e)
  })

  on('command.run', { command: 'agentes' }, async $ => {
    const opened = await $.ui.open({ id: PANE, title: 'Agentes' })
    return { text: opened.isPlaced ? 'Dashboard de agentes abierto.' : 'El panel se abrirá cuando haya sitio en pantalla.' }
  })

  on('tool.call', async ($, e, next) => {
    const tool = String(e.tool)
    const args = e as unknown as Record<string, unknown>
    // Las consultas del propio panel a n8n no se cuentan como trabajo de agentes.
    if (isRefreshing && tool.startsWith('mcp__n8n__search_')) return next(e)
    const startedAt = await $.clock.now()
    const call: Call = {
      id: e.tool_use_id ?? `${tool}-${startedAt}`, tool, system: systemOf(tool, args),
      agent: e.agentId ? `sub·${e.agentId.slice(0, 6)}` : 'principal', detail: detailOf(tool, args),
      status: 'run', startedAt, ms: 0,
    }
    await update($, calls, list => [...list, call].slice(-300))
    if (tool === 'Agent') await update($, subagents, l => [...l, { id: call.id, label: call.detail, startedAt, isDone: false }].slice(-30))
    const ran = await next(e)
    const ms = (await $.clock.now()) - startedAt
    const status: Call['status'] = ran.deny !== undefined ? 'bloqueado' : ran.isError ? 'error' : 'ok'
    await update($, calls, list => list.map(c => (c.id === call.id ? { ...c, status, ms } : c)))
    if (tool === 'Agent') await update($, subagents, l => l.map(s => (s.id === call.id ? { ...s, isDone: true } : s)))
    return ran
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Text, Button } = $.ui.resolve(e)
    const now = await $.clock.now()
    const tab = await read($, view)
    const width = e.props.bodyColumns ?? e.viewport?.columns ?? 60
    const room = Math.max(4, (e.viewport?.rows ?? 30) - 12)

    const tabs = (
      <Box key="tabs" flexDirection="row" gap={1}>
        <Button key="tab-claude" label={tab === 'claude' ? '● Claude' : 'Claude'} variant={tab === 'claude' ? 'primary' : 'secondary'} onPress={() => update($, view, () => 'claude')} />
        <Button key="tab-n8n" label={tab === 'n8n' ? '● n8n' : 'n8n'} variant={tab === 'n8n' ? 'primary' : 'secondary'} onPress={async () => { await update($, view, () => 'n8n'); if (!(await read($, flows)).updatedAt) void refreshFlows($) }} />
      </Box>
    )

    if (tab === 'n8n') {
      const f = await read($, flows)
      const loading = await read($, isLoading)
      const active = f.rows.filter(r => r.isActive)
      const failing = f.rows.filter(r => r.err7 > 0)
      return (
        <Box flexDirection="column">
          {tabs}
          <Box key="n8n-head" flexDirection="row" gap={1}>
            <Text dimColor>{loading ? 'Consultando n8n…' : f.updatedAt ? `Actualizado hace ${ago(now, f.updatedAt)}` : 'Sin consultar'}</Text>
            <Button key="refresh" label="Actualizar" onPress={() => refreshFlows($)} />
          </Box>
          {f.error !== '' && <Text color="error" wrap="wrap">n8n no responde: {f.error}</Text>}
          {f.rows.length > 0 && (
            <Text>
              <Text bold>{active.length}</Text> activos de {f.rows.length} · <Text color={failing.length ? 'error' : 'success'} bold>{failing.length}</Text> con errores en 7 días
            </Text>
          )}
          {f.rows.slice(0, room).map(r => (
            <Box key={`wf-${r.id}`} flexDirection="column">
              <Text wrap="truncate-end">
                <Text color={r.isActive ? 'success' : 'subtle'}>{r.isActive ? '●' : '○'}</Text> <Text bold={r.isActive}>{r.name}</Text>
              </Text>
              <Text dimColor wrap="truncate-end">
                {'   '}{r.lastAt ? `última: ${r.lastStatus} hace ${ago(now, Date.parse(r.lastAt))}` : 'sin ejecuciones en 7 días'} · 7d: <Text color="success">{r.ok7} ok</Text>{r.err7 > 0 ? <Text color="error"> · {r.err7} error</Text> : ''}
              </Text>
            </Box>
          ))}
        </Box>
      )
    }

    const list = await read($, calls)
    const subs = await read($, subagents)
    const running = list.filter(c => c.status === 'run')
    const errors = list.filter(c => c.status === 'error').length
    const blocked = list.filter(c => c.status === 'bloqueado').length
    const bySystem = new Map<string, number>()
    for (const c of list) bySystem.set(c.system, (bySystem.get(c.system) ?? 0) + 1)
    const systems = [...bySystem.entries()].sort((a, b) => b[1] - a[1])
    const shown = list.slice(-room).reverse()
    const nameCol = Math.min(14, Math.max(8, Math.floor(width / 5)))

    return (
      <Box flexDirection="column">
        {tabs}
        <Text>
          <Text bold>{list.length}</Text> acciones · <Text color="warning" bold>{running.length}</Text> en curso · <Text color={errors ? 'error' : 'success'} bold>{errors}</Text> errores · <Text color={blocked ? 'error' : 'subtle'} bold>{blocked}</Text> bloqueadas
        </Text>
        {systems.length > 0 && <Text dimColor wrap="wrap">{systems.map(([s, n]) => `${s} ${n}`).join(' · ')}</Text>}
        {subs.length > 0 && (
          <Box key="subs" flexDirection="column">
            <Text bold>Subagentes</Text>
            {subs.slice(-5).reverse().map(s => (
              <Text key={`sub-${s.id}`} wrap="truncate-end">
                <Text color={s.isDone ? 'success' : 'warning'}>{s.isDone ? '✓' : '…'}</Text> {s.label} <Text dimColor>hace {ago(now, s.startedAt)}</Text>
              </Text>
            ))}
          </Box>
        )}
        <Text bold>Actividad</Text>
        {list.length === 0 && <Text dimColor>Aún no hay actividad en esta sesión.</Text>}
        {shown.map(c => (
          <Text key={`c-${c.id}`} wrap="truncate-end" dimColor={c.status === 'ok'}>
            <Text color={COLOR[c.status]}>{GLYPH[c.status]}</Text> {c.system.padEnd(nameCol).slice(0, nameCol)} {c.detail}
            <Text dimColor> {c.status === 'run' ? ago(now, c.startedAt) : dur(c.ms)}{c.agent !== 'principal' ? ` · ${c.agent}` : ''}</Text>
          </Text>
        ))}
        {list.length > 0 && <Button key="clear" label="Vaciar" onPress={async () => { await update($, calls, () => []); await update($, subagents, () => []) }} />}
      </Box>
    )
  })
}
