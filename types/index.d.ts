export type Info = {
  model: string | null
  effort: string | null
  style: string | null
  percent: number | null
  fiveHour: number | null
  weekly: number | null
}

declare module 'claude-code' {
  interface PluginState {
    nebster: { name: string | null; info: Info }
  }
}
