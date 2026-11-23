import { describe, expect, it } from 'vitest'
import { run } from './leetspeak.ts'

describe('leetspeak', () => {
  it('case 1', () => {
    expect(run('leet', 'basic')).toBe('l33t')
  })
  it('case 2', () => {
    expect(run('leet', 'heavy')).toBe('l337')
  })
  it('case 3', () => {
    expect(run('Big Fish', 'heavy')).toBe('819 F15h')
  })
})
