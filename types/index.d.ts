export type Info = {
  model: string | null
  effort: string | null
  style: string | null
  percent: number | null
}

declare module 'claude-code' {
  interface PluginState {
    nebster: { name: string | null; info: Info }
  }
}
