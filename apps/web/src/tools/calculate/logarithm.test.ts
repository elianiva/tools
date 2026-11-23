import { describe, expect, it } from 'vitest'
import { run } from './logarithm.ts'

describe('logarithm', () => {
  it('case 1', () => {
    expect(run('1000')).toBe('log10: 3\nln: 6.907755\nlog2: 9.965784')
  })
  it('case 2', () => {
    expect(run('1')).toBe('log10: 0\nln: 0\nlog2: 0')
  })
  it('case 3', () => {
    expect(run('0.5')).toBe('log10: -0.30103\nln: -0.693147\nlog2: -1')
  })
  it('case 4', () => {
    expect(() => run('0')).toThrow('above zero')
  })
  it('case 5', () => {
    expect(() => run('-4')).toThrow('above zero')
  })
})
