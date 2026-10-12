export type Scope = 'produccion' | 'jarvis'
export type Grants = { produccion?: number; jarvis?: number }

declare module 'claude-code' {
  interface PluginState {
    'renzo-guardrails': { grants: Grants; denied: number }
  }
}
