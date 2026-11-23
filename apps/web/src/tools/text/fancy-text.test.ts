import { describe, expect, it } from 'vitest'
import { run } from './fancy-text.ts'

describe('fancy-text', () => {
  it('case 1', () => {
    expect(run('Ab1', 'bold')).toBe('\u{1D400}\u{1D41B}\u{1D7CF}')
  })
  it('case 2', () => {
    expect(run('a', 'monospace')).toBe('\u{1D68A}')
  })
  it('case 3', () => {
    expect(run('Ab', 'circled')).toBe('\u24B6\u24D1')
  })
  it('case 4', () => {
    expect(run('A!', 'fullwidth')).toBe('\uFF21\uFF01')
  })
  it('case 5', () => {
    expect(run('é ', 'bold')).toBe('é ')
  })
})
