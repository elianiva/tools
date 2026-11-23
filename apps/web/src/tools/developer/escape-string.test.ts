import { describe, expect, it } from 'vitest'
import { run } from './escape-string.ts'

describe('escape-string', () => {
  it('case 1', () => {
    expect(run('a"b\nc', 'escape')).toBe('a\\"b\\nc')
  })
  it('case 2', () => {
    expect(run('a\\"b\\nc\\u00e9', 'unescape')).toBe('a"b\ncé')
  })
  it('case 3', () => {
    expect(run('a.b*(c)', 'regex')).toBe('a\\.b\\*\\(c\\)')
  })
  it('case 4', () => {
    expect(() => run('\\x', 'unescape')).toThrow('not a valid')
  })
})
