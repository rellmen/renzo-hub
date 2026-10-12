import { test, expect, mock } from 'claude-code/testing'
import { judge } from './register'

const bash = (command: string) => judge({ tool: 'Bash', command })

test('bloquea fusionar, force push y push directo a main/staging', async () => {
  expect(bash('gh pr merge 33 --merge')?.scope).toBe('nunca')
  expect(bash('git push --force origin feature/x')?.scope).toBe('nunca')
  expect(bash('git push origin main')?.scope).toBe('nunca')
  expect(bash('git push origin staging')?.scope).toBe('nunca')
})

test('deja pasar el flujo normal de feature', async () => {
  expect(bash('git push -u origin feature/mods-release-y-agentes')).toBeUndefined()
  expect(bash('git push origin feature/staging-fix')).toBeUndefined()
  expect(bash('gh api repos/rellmen/renzo-hub/pulls/32')).toBeUndefined()
  expect(bash('./scripts/renzo-hub verify prod')).toBeUndefined()
})

test('producción requiere autorización', async () => {
  expect(bash('vercel deploy --prod')?.scope).toBe('produccion')
  expect(bash('supabase db push --project-ref mgncykyrhavpepfggmng')?.scope).toBe('produccion')
  expect(judge({ tool: 'mcp__Supabase__execute_sql', project_id: 'mgncykyrhavpepfggmng', query: 'select 1' })?.scope).toBe('produccion')
  expect(judge({ tool: 'mcp__Supabase__execute_sql', project_id: 'zpueziugbezqxompwsol', query: 'select 1' })).toBeUndefined()
  expect(judge({ tool: 'mcp__Supabase__list_tables', project_id: 'mgncykyrhavpepfggmng' })).toBeUndefined()
})

test('Jarvis: publicar o editar workflows activos requiere autorización', async () => {
  expect(judge({ tool: 'mcp__n8n__publish_workflow', workflowId: 'x' })?.scope).toBe('jarvis')
  expect(judge({ tool: 'mcp__n8n__update_workflow', workflowId: 'WH0kGpw0dg83yvdM' })?.scope).toBe('jarvis')
  expect(judge({ tool: 'mcp__n8n__update_workflow', workflowId: 'Gmw3cCTFaluDC5bQ' })).toBeUndefined()
  expect(judge({ tool: 'mcp__n8n__search_workflow_executions' })).toBeUndefined()
})

test('una llamada bloqueada devuelve deny y cuenta', async ($, on) => {
  mock.clock(on)
  on('tool.call', () => ({ result: 'ran' }))
  const r = await $.tool.call({ tool: 'Bash', command: 'gh pr merge 1' })
  expect(r.deny).toContain('bloqueado')
})
