import { describe, expect, it } from 'vitest'
import { run } from './indent.ts'

describe('indent', () => {
  it('case 1', () => {
    expect(run('a\n\nb', 'indent2')).toBe('  a\n\n  b')
  })
  it('case 2', () => {
    expect(run('x', 'indent4')).toBe('    x')
  })
  it('case 3', () => {
    expect(run('x', 'tab')).toBe('\tx')
  })
  it('case 4', () => {
    expect(run('    a\n      b\n\n    c', 'dedent')).toBe('a\n  b\n\nc')
  })
  it('case 5', () => {
    expect(run('  a\nb', 'dedent')).toBe('  a\nb')
  })
})
