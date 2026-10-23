import { describe, expect, test } from 'claude-code/testing'

import { formatDuration } from '../hooks/quiet'

const mount = ($: any, component: string, props: object) =>
  $.ui.mount({ plugin: 'nebster', surface: 'terminal', component, props } as never)

describe('helpers', () => {
  test('formats durations', () => {
    expect(formatDuration(3200)).toBe('3s')
    expect(formatDuration(64000)).toBe('1m 4s')
    expect(formatDuration(7_500_000)).toBe('2h 5m')
  })
})

describe('quiet rows', () => {
  test('a finished tool group draws nothing', async $ => {
    const call = { tool: 'Bash', input: {}, isRunning: false, isErrored: false, isInterrupted: false }
    const ui = await mount($, 'ToolGroup', {
      calls: [call, call],
      isActive: false,
      isExpanded: false,
      isCallsOnly: true,
    })
    expect(await ui.find({ type: 'Text' } as never)).toBeUndefined()
    await ui.unmount()
  })

  test('a finished group with a failed call draws nothing too', async $ => {
    const failed = { tool: 'Bash', input: {}, isRunning: false, isErrored: true, isInterrupted: false }
    const ui = await mount($, 'ToolGroup', {
      calls: [failed],
      isActive: false,
      isExpanded: false,
      isCallsOnly: false,
    })
    expect(await ui.find({ type: 'Text' } as never)).toBeUndefined()
    await ui.unmount()
  })

  test("another agent's message draws nothing; the person's prompt is left alone", async ($, on) => {
    on('ui.render', ($, e) => {
      const { Text } = $.ui.resolve(e)
      return <Text>engine</Text>
    })

    const agent = await mount($, 'UserMessage', {
      text: 'long report',
      origin: { kind: 'peer' },
      isExpanded: false,
      from: { name: 'general-purpose' },
    })
    expect(await agent.find({ type: 'Text' } as never)).toBeUndefined()
    await agent.unmount()

    const prompt = await mount($, 'UserMessage', {
      text: 'hello',
      origin: { kind: 'composer' },
      isExpanded: false,
    })
    expect((await prompt.find({ type: 'Text' } as never))?.text).toBe('engine')
    await prompt.unmount()
  })

  test('the turn footer shows only its duration', async $ => {
    const ui = await mount($, 'TurnDuration', {
      word: 'Baked',
      durationMs: 64000,
      waitingFor: { agents: [{ id: 'a', agentType: 'general-purpose' }], workflows: 0 },
    })
    expect((await ui.find({ type: 'Text' } as never))?.text).toBe('Worked: 1m 4s')
    await ui.unmount()
  })
})

describe('spinner', () => {
  test('names what the turn is doing', async ($, on) => {
    on('ui.render', ($, e) => {
      const { Text } = $.ui.resolve(e)
      return <Text>{(e.props as { word: string }).word}</Text>
    })
    const ui = await mount($, 'Spinner', { word: 'Sauteing', message: null, suffix: '…', mode: 'tool-use' })
    expect((await ui.find({ type: 'Text' } as never))?.text).toBe('Running tools')
    await ui.unmount()
  })
})
