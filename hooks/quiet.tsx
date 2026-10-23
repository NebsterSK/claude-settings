import type { Register } from 'claude-code'

// Background chatter (finished tool groups, agent messages, task notices) is hidden
// and the turn footer is reduced to its duration, so the person's prompts and
// Claude's answers carry the transcript. ctrl+o still draws every row in full.

// `3s`, `1m 4s`, `2h 5m`.
export const formatDuration = (milliseconds: number): string => {
  const seconds = Math.max(0, Math.round(milliseconds / 1000))
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ${seconds % 60}s`
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`
}

// What the turn is doing, said plainly instead of a random gerund.
const SPINNER_WORDS = {
  requesting: 'Waiting for the model',
  thinking: 'Thinking',
  'tool-input': 'Preparing a tool call',
  'tool-use': 'Running tools',
  responding: 'Writing',
} as const

// Close to a black background: readable when looked for, out of the way otherwise.
const FAINT = '#4a4a4a'

export const registerQuiet: Register = on => {
  on('ui.render', { component: 'Spinner' }, async ($, e, next) => {
    if (e.props.message !== null) return next(e)
    return next({ ...e, props: { ...e.props, word: SPINNER_WORDS[e.props.mode] } })
  })

  // Tool groups: hidden once finished, failed calls included (Claude reacts to those
  // itself); only the live group keeps the engine's line.
  on('ui.render', { component: 'ToolGroup' }, async ($, e, next) => {
    if (e.props.isExpanded || e.props.isActive) return next(e)

    const { Box } = $.ui.resolve(e)
    return <Box display="none" />
  })

  // Another agent's message or a background task's notice: hidden. The person's prompts pass.
  on('ui.render', { component: 'UserMessage' }, async ($, e, next) => {
    const { from, origin, isExpanded } = e.props
    if (isExpanded) return next(e)
    if (from === undefined && origin.kind !== 'task-notification') return next(e)

    const { Box } = $.ui.resolve(e)
    return <Box display="none" />
  })

  // The turn's closing line: only how long it took, faint.
  on('ui.render', { component: 'TurnDuration' }, async ($, e, next) => {
    const { isExpanded, durationMs } = e.props
    if (isExpanded) return next(e)

    const { Box, Text } = $.ui.resolve(e)
    return (
      <Box marginTop={1} marginLeft={2}>
        <Text color={FAINT}>{`Worked: ${formatDuration(durationMs)}`}</Text>
      </Box>
    )
  })
}
