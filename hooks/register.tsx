import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { Git, Info } from '../types'
import { registerQuiet } from './quiet'

const name = atom({ plugin: 'nebster', key: 'name' } as const, null)
const info = atom({ plugin: 'nebster', key: 'info' } as const, {
  model: null,
  effort: null,
  style: null,
  percent: null,
  fiveHour: null,
  weekly: null,
} as Info)
const git = atom({ plugin: 'nebster', key: 'git' } as const, { branch: null, changed: 0, added: 0, deleted: 0 } as Git)

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

// `medium` → `Medium`, to match the model and style labels.
export const capitalize = (text: string): string => text.charAt(0).toUpperCase() + text.slice(1)

// Green, then yellow from 60%, red from 85%.
export const usageColor = (percent: number): 'green' | 'yellow' | 'red' =>
  percent >= 85 ? 'red' : percent >= 60 ? 'yellow' : 'green'

// A rate-limit window's use, rounded; null when the account reports none.
export const windowPercent = (
  rateLimits: readonly { kind: string; percentUsed: number }[],
  kind: 'five_hour' | 'seven_day',
): number | null => {
  const window = rateLimits.find(limit => limit.kind === kind)
  return window === undefined ? null : Math.round(window.percentUsed)
}

// `git status --porcelain=v1 -b`: the `##` head line, then one line per file;
// untracked (`??`) and staged-new (`A`) files count as added, a `D` on either side
// as deleted, the rest as changed.
export const parseGitStatus = (porcelain: string): Git => {
  const lines = porcelain.split('\n').filter(line => line !== '')
  const head = lines[0]?.startsWith('## ') ? lines[0].slice(3) : null
  const branch =
    head === null ? null : (head.replace(/^No commits yet on /, '').split('...')[0]?.trim() ?? null)
  const files = lines.filter(line => !line.startsWith('## '))
  const added = files.filter(line => line.startsWith('??') || line.startsWith('A')).length
  const deleted = files.filter(line => line[0] === 'D' || line[1] === 'D').length
  return { branch, changed: files.length - added - deleted, added, deleted }
}

// Green for the main line, yellow for develop, gray for anything else.
export const branchColor = (branch: string): 'green' | 'yellow' | 'gray' =>
  branch === 'main' || branch === 'master' ? 'green' : branch === 'develop' ? 'yellow' : 'gray'

async function refreshGit($: EngineInterface) {
  const result = await $.process.run(['git', 'status', '--porcelain=v1', '-b'], {
    cwd: await $.session.root(),
    timeoutMs: 3000,
  })
  const status =
    result.exitCode === 0 ? parseGitStatus(result.stdout) : { branch: null, changed: 0, added: 0, deleted: 0 }
  await update($, git, () => status)
}

async function refresh($: EngineInterface) {
  const config =
    (await $.env.get('CLAUDE_CONFIG_DIR')) ??
    `${(await $.env.get('USERPROFILE')) ?? (await $.env.get('HOME'))}/.claude`
  const project = (await $.session.root()).replace(/[^a-zA-Z0-9]/g, '-')
  const path = `${config}/projects/${project}/${await $.session.id()}.jsonl`
  const title = lastTitle(await $.fs.read(path).catch(() => ''))
  if (title !== null) await update($, name, () => title)

  const { context, rateLimits } = await $.session.usage()
  const model = prettyModel(await $.session.model())
  // `/output-style` writes settings, so they stay right when another plugin's
  // `prompt.compose` hook answers without passing the event on to ours.
  const style = await $.settings.read({ key: 'outputStyle' })
  await update($, info, current => ({
    ...current,
    style: typeof style === 'string' ? style : current.style,
    model: current.model ?? model,
    percent: context.percent ?? current.percent,
    fiveHour: windowPercent(rateLimits, 'five_hour') ?? current.fiveHour,
    weekly: windowPercent(rateLimits, 'seven_day') ?? current.weekly,
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
  registerQuiet(on)

  on('session.start', async ($, e, next) => {
    const result = await next(e)
    await seed($).catch(() => {})
    await refresh($).catch(() => {})
    await refreshGit($).catch(() => {})
    return result
  })

  on('session.append', { door: 'command' }, async ($, e, next) => {
    const result = await next(e)
    await refresh($).catch(() => {})
    await refreshGit($).catch(() => {})
    return result
  })

  on('turn.complete', async ($, e, next) => {
    const result = await next(e)
    await refresh($).catch(() => {})
    await refreshGit($).catch(() => {})
    return result
  })

  // Rate-limit windows move between turns too; the engine pushes each whole-point move.
  on('session.measure', async ($, e, next) => {
    if (e.changed.includes('rateLimits')) {
      const fiveHour = windowPercent(e.rateLimits, 'five_hour')
      const weekly = windowPercent(e.rateLimits, 'seven_day')
      await update($, info, current => ({
        ...current,
        fiveHour: fiveHour ?? current.fiveHour,
        weekly: weekly ?? current.weekly,
      })).catch(() => {})
    }
    return next(e)
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
    const { model, effort, style, percent, fiveHour, weekly } = await read($, info)
    const { branch, changed, added, deleted } = await read($, git)
    if (e.props.hasSurvey) return next(e)

    const { Box, Text } = $.ui.resolve(e)
    const details = [model, effort === null ? null : capitalize(effort), style].filter(Boolean).join(' · ')

    // A dim rule across the band's full width sets it apart from the chat.
    return (
      <Box flexDirection="column">
        <Text dimColor>{'─'.repeat(Math.max(e.props.bodyColumns, 0))}</Text>
        <Box>
          {current !== null && (
            <Text bold color="cyan">
              {'> '}{current}
            </Text>
          )}
          {details !== '' && <Text dimColor>{`${current !== null ? '  ' : ''}${details}`}</Text>}
          {percent !== null && <Text color={usageColor(percent)}>{`  ${percent}% ctx`}</Text>}
          {fiveHour !== null && <Text color={usageColor(fiveHour)}>{`  ${fiveHour}% 5h`}</Text>}
          {weekly !== null && <Text color={usageColor(weekly)}>{`  ${weekly}% 7d`}</Text>}
          {branch !== null && (
            <Box>
              <Text dimColor>{'  │  '}</Text>
              <Text color={branchColor(branch)}>{`⎇ ${branch}`}</Text>
              {changed > 0 && <Text color="yellow">{`  ~${changed}`}</Text>}
              {added > 0 && <Text color="green">{`  +${added}`}</Text>}
              {deleted > 0 && <Text color="red">{`  -${deleted}`}</Text>}
            </Box>
          )}
        </Box>
      </Box>
    )
  })
}
