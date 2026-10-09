import { describe, expect, test } from 'claude-code/testing'

import { lastTitle } from '../hooks/register'

describe('lastTitle', () => {
  test('picks the latest custom-title row', () => {
    const rows = [
      '{"type":"custom-title","customTitle":"modes"}',
      '{"type":"user","message":"hi"}',
      '{"type":"custom-title","customTitle":"mods"}',
      '',
    ].join('\n')
    expect(lastTitle(rows)).toBe('mods')
  })

  test('null when never renamed', () => {
    expect(lastTitle('{"type":"user"}\n')).toBe(null)
  })
})

import { prettyModel } from '../hooks/register'

describe('prettyModel', () => {
  test('formats claude ids', () => {
    expect(prettyModel('claude-opus-5-5')).toBe('Opus 5.5')
    expect(prettyModel('claude-opus-5-5[1m]')).toBe('Opus 5.5')
    expect(prettyModel('claude-haiku-4-5-20251001')).toBe('Haiku 4.5')
  })

  test('passes other names through', () => {
    expect(prettyModel('Opus 5.5')).toBe('Opus 5.5')
  })
})

describe('band', () => {
  test('draws a full-width divider above the session line', async $ => {
    const BAND = {
      component: 'AbovePrompt',
      props: { hasSurvey: false, isWorking: false, maxRows: 10, bodyColumns: 40 },
    } as const
    const ui = await $.ui.mount({ plugin: 'nebster', surface: 'terminal', ...BAND } as never)
    expect((await ui.find({ type: 'Text', text: /^─+$/ } as never))?.text).toBe('─'.repeat(40))
    await ui.unmount()
  })
})

import { usageColor, windowPercent } from '../hooks/register'

describe('usage', () => {
  test('colours by threshold', () => {
    expect(usageColor(59)).toBe('green')
    expect(usageColor(60)).toBe('yellow')
    expect(usageColor(84)).toBe('yellow')
    expect(usageColor(85)).toBe('red')
  })

  test('reads a rate-limit window, rounded', () => {
    const limits = [
      { kind: 'five_hour', percentUsed: 23.5 },
      { kind: 'seven_day', percentUsed: 41.2 },
    ]
    expect(windowPercent(limits, 'five_hour')).toBe(24)
    expect(windowPercent(limits, 'seven_day')).toBe(41)
    expect(windowPercent([], 'five_hour')).toBe(null)
  })
})
