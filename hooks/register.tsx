import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { Info } from '../types'

const name = atom({ plugin: 'nebster', key: 'name' } as const, null)
const info = atom({ plugin: 'nebster', key: 'info' } as const, {
  model: null,
  effort: null,
  style: null,
  percent: null,
} as Info)

// The latest `/rename` lives in the transcript as a `custom-title` row.
export const lastTitle = (transcript: string): string | null => {
  const lines = transcript.split('\n')
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i]
    if (!line?.includes('"custom-title"')) continue
    try {
      const row = JSON.parse(line) as { type?: string; customTitle?: string }
      if (row.type === 'custom-title' && row.customTitle) return row.customTitle
    } catch {}
  }
  return null
}

// `claude-opus-5-5[1m]` → `Opus 5.5`; anything else passes through.
export const prettyModel = (id: string): string => {
  const match = /^claude-([a-z]+)-(\d+)(?:-(\d{1,2}))?(?:-\d{8})?/.exec(id)
  if (!match) return id
  const [, family = '', major, minor] = match
  const label = family.charAt(0).toUpperCase() + family.slice(1)
  return `${label} ${major}${minor ? `.${minor}` : ''}`
}

async function refresh($: EngineInterface) {
  const config =
    (await $.env.get('CLAUDE_CONFIG_DIR')) ??
    `${(await $.env.get('USERPROFILE')) ?? (await $.env.get('HOME'))}/.claude`
  const project = (await $.session.root()).replace(/[^a-zA-Z0-9]/g, '-')
  const path = `${config}/projects/${project}/${await $.session.id()}.jsonl`
  const title = lastTitle(await $.fs.read(path).catch(() => ''))
  if (title !== null) await update($, name, () => title)

  const { context } = await $.session.usage()
  const model = prettyModel(await $.session.model())
  await update($, info, current => ({
    ...current,
    model: current.model ?? model,
    percent: context.percent ?? current.percent,
  }))
}

// Before the first turn, effort and output style come from settings.
async function seed($: EngineInterface) {
  const settings = await $.settings.read()
  const effort = typeof settings.effortLevel === 'string' ? settings.effortLevel : null
  const style = typeof settings.outputStyle === 'string' ? settings.outputStyle : null
  await update($, info, current => ({
    ...current,
    effort: current.effort ?? effort,
    style: current.style ?? style,
  }))
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const result = await next(e)
    await seed($).catch(() => {})
    await refresh($).catch(() => {})
    return result
  })

  on('session.append', { door: 'command' }, async ($, e, next) => {
    const result = await next(e)
    await refresh($).catch(() => {})
    return result
  })

  on('turn.complete', async ($, e, next) => {
    const result = await next(e)
    await refresh($).catch(() => {})
    return result
  })

  // Each main-loop request carries the model and effort it actually used.
  on('turn.step', async function* ($, e, next) {
    if (e.agentId === undefined) {
      const model = prettyModel(e.model)
      const effort = e.effort === undefined ? null : String(e.effort)
      await update($, info, current => ({ ...current, model, effort })).catch(() => {})
    }
    return yield* next(e)
  })

  // Subagent prompts carry no style, so only a named one counts.
  on('prompt.compose', async ($, e, next) => {
    if (e.outputStyle !== null) {
      const style = e.outputStyle.name
      await update($, info, current => ({ ...current, style })).catch(() => {})
    }
    return next(e)
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const current = await read($, name)
    const { model, effort, style, percent } = await read($, info)
    if (e.props.hasSurvey) return next(e)

    const { Box, Text } = $.ui.resolve(e)
    const details = [model, effort, style].filter(Boolean).join(' · ')
    const level = percent === null ? null : percent >= 85 ? 'red' : percent >= 60 ? 'yellow' : 'green'

    return (
      <Box>
        {current !== null && (
          <Text bold color="cyan">
            ● {current}
          </Text>
        )}
        {details !== '' && <Text dimColor>{`${current !== null ? '  ' : ''}${details}`}</Text>}
        {percent !== null && level !== null && (
          <Text color={level}>{`  ${percent}% ctx`}</Text>
        )}
      </Box>
    )
  })
}
