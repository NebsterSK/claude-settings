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
