import { describe, expect, it } from 'vitest'
import { run } from './strikethrough.ts'

describe('strikethrough', () => {
  it('case 1', () => {
    expect(run('ab', 'strike')).toBe('a\u0336b\u0336')
  })
  it('case 2', () => {
    expect(run('a b', 'underline')).toBe('a\u0332 \u0332b\u0332')
  })
  it('case 3', () => {
    expect(run('x\ny', 'slash')).toBe('x\u0338\ny\u0338')
  })
})
