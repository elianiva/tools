import { describe, expect, it } from 'vitest'
import { run } from './px-rem.ts'

describe('px-rem', () => {
  it('case 1', () => {
    expect(run('24', 'px-to-rem')).toBe('1.5rem')
  })
  it('case 2', () => {
    expect(run('24 12', 'px-to-rem')).toBe('2rem')
  })
  it('case 3', () => {
    expect(run('1.5', 'rem-to-px')).toBe('24px')
  })
  it('case 4', () => {
    expect(run('10', 'px-to-rem')).toBe('0.625rem')
  })
  it('case 5', () => {
    expect(() => run('abc', 'px-to-rem')).toThrow('Enter a number')
  })
})
