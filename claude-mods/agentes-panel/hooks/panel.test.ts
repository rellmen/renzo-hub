import { test, expect, mock } from 'claude-code/testing'
import { detailOf, systemOf } from './register'

test('clasifica cada herramienta por sistema', async () => {
  expect(systemOf('Bash', { command: 'gh api repos/x/pulls/1' })).toBe('GitHub')
  expect(systemOf('Bash', { command: './scripts/renzo-hub verify prod' })).toBe('Pruebas')
  expect(systemOf('mcp__n8n__search_workflows', {})).toBe('n8n / Jarvis')
  expect(systemOf('mcp__Supabase__execute_sql', {})).toBe('Supabase')
  expect(systemOf('Edit', { file_path: '/a/b.js' })).toBe('Archivos')
  expect(detailOf('Edit', { file_path: '/a/b.js' })).toBe('b.js')
  expect(detailOf('Agent', { subagent_type: 'Explore', description: 'buscar X' })).toBe('Explore: buscar X')
})

for (const surface of ['terminal', 'desktop'] as const) {
  test(`registra la actividad y la dibuja (${surface})`, async ($, on) => {
    mock.clock(on)
    on('tool.call', () => ({ result: 'ok' }))
    await $.tool.call({ tool: 'Bash', command: 'gh pr view 3', description: 'Ver PR' })
    await $.tool.call({ tool: 'Read', file_path: '/x/AGENTS.md' })
    const ui = await $.ui.mount({ plugin: 'agentes-panel', surface, component: 'Pane', requestId: 'agentes', props: {} as never })
    expect(await ui.find({ type: 'Text', text: /2 acciones/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /Ver PR/ })).toBeDefined()
    await ui.press({ key: 'clear' })
    expect(await ui.find({ type: 'Text', text: /Aún no hay actividad/ })).toBeDefined()
    await ui.unmount()
  })

  test(`pestaña n8n con datos de n8n (${surface})`, async ($, on) => {
    mock.clock(on)
    on('tool.call', (_$, e) => {
      if (e.tool === 'mcp__n8n__search_workflows')
        return { result: {}, text: JSON.stringify({ data: [{ id: 'J', name: 'Jarvis personal', active: true }, { id: 'L', name: 'Lab', active: false }] }) }
      if (e.tool === 'mcp__n8n__search_workflow_executions')
        return { result: {}, text: JSON.stringify({ data: [{ id: '1', workflowId: 'J', status: 'error', startedAt: '1970-01-01T00:00:00.000Z' }] }) }
      return { result: 'ok' }
    })
    const ui = await $.ui.mount({ plugin: 'agentes-panel', surface, component: 'Pane', requestId: 'agentes', props: {} as never })
    await ui.press({ key: 'tab-n8n' })
    await ui.press({ key: 'refresh' })
    expect(await ui.find({ type: 'Text', text: /Jarvis personal/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /1 activos de 2/ })).toBeDefined()
    // Las consultas del propio panel no cuentan como actividad.
    await ui.press({ key: 'tab-claude' })
    expect(await ui.find({ type: 'Text', text: /Aún no hay actividad/ })).toBeDefined()
    await ui.unmount()
  })
}
