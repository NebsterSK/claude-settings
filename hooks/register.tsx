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
// Segment tints, a step above a dark terminal background; empty meter cells sit between.
const TINT_A = '#1c2129'
const TINT_B = '#232934'
const METER_EMPTY = '#4a505a'

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

// Green, then yellow from 60%, red from 80%: the third and fourth of the meter's five cells.
export const usageColor = (percent: number): 'green' | 'yellow' | 'red' =>
  percent >= 80 ? 'red' : percent >= 60 ? 'yellow' : 'green'

// A five-cell meter, each cell 20%: 12% → `▰▱▱▱▱`, 40% → `▰▰▱▱▱`, 100% → `▰▰▰▰▰`.
export const meterCells = (percent: number): { filled: string; empty: string } => {
  const filled = Math.min(5, Math.max(0, Math.ceil(percent / 20)))
  return { filled: '▰'.repeat(filled), empty: '▱'.repeat(5 - filled) }
}

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
  // `$.fs.read` refuses files over 4 MiB, which a long session's transcript outgrows;
  // then only its `custom-title` rows are pulled out with grep.
  const transcript = await $.fs
    .read(path)
    .catch(() => $.process.run(['grep', '-F', '"custom-title"', path], { timeoutMs: 3000 }).then(result => result.stdout))
    .catch(() => '')
  const title = lastTitle(transcript)
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
    const meters = [
      { label: 'ctx', value: percent },
      { label: '5h', value: fiveHour },
      { label: '7d', value: weekly },
    ].flatMap(meter => (meter.value === null ? [] : [{ label: meter.label, value: meter.value }]))

    // Three tinted segments, Claude · usage · git: the tints group them, so no separators.
    // The top margin matches the empty row Claude Code leaves between the band and the input.
    // Every Text carries the tint itself, so the segment stays solid whatever the terminal does.
    return (
      <Box flexWrap="wrap" columnGap={1} marginTop={1}>
        <Box>
          <Text backgroundColor={TINT_A}> </Text>
          {current !== null && (
            <Text backgroundColor={TINT_A} bold color="cyan">{`${current}  `}</Text>
          )}
          <Text backgroundColor={TINT_A} dimColor>{`${details} `}</Text>
        </Box>
        {meters.length > 0 && (
          <Box>
            {meters.map((meter, index) => {
              const { filled, empty } = meterCells(meter.value)
              return (
                <Box key={meter.label}>
                  <Text backgroundColor={TINT_B} dimColor>{`${index === 0 ? ' ' : '  '}${meter.label} `}</Text>
                  <Text backgroundColor={TINT_B} color={usageColor(meter.value)}>{filled}</Text>
                  <Text backgroundColor={TINT_B} color={METER_EMPTY}>{empty}</Text>
                  <Text backgroundColor={TINT_B} color={usageColor(meter.value)}>{` ${meter.value}%`}</Text>
                </Box>
              )
            })}
            <Text backgroundColor={TINT_B}> </Text>
          </Box>
        )}
        {branch !== null && (
          <Box>
            <Text backgroundColor={TINT_A} color={branchColor(branch)}>{` ⎇ ${branch}`}</Text>
            {changed > 0 && <Text backgroundColor={TINT_A} color="yellow">{`  ~${changed}`}</Text>}
            {added > 0 && <Text backgroundColor={TINT_A} color="green">{`  +${added}`}</Text>}
            {deleted > 0 && <Text backgroundColor={TINT_A} color="red">{`  -${deleted}`}</Text>}
            <Text backgroundColor={TINT_A}> </Text>
          </Box>
        )}
      </Box>
    )
  })
}
