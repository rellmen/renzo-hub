export type CallStatus = 'run' | 'ok' | 'error' | 'bloqueado'
export type Call = {
  id: string
  tool: string
  system: string
  agent: string
  detail: string
  status: CallStatus
  startedAt: number
  ms: number
}
export type Subagent = { id: string; label: string; startedAt: number; isDone: boolean }
export type FlowRow = {
  id: string
  name: string
  isActive: boolean
  lastStatus: string
  lastAt: string
  ok7: number
  err7: number
}
export type FlowsState = { rows: FlowRow[]; updatedAt: number; error: string }
export type View = 'claude' | 'n8n'

declare module 'claude-code' {
  interface PluginState {
    'agentes-panel': { calls: Call[]; subagents: Subagent[]; flows: FlowsState; view: View; isLoading: boolean }
  }
}
