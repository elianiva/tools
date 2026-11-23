import { describe, expect, it } from 'vitest'
import { run } from './prime-factors.ts'

describe('prime-factors', () => {
  it('case 1', () => {
    expect(run('97')).toBe('97 is prime')
  })
  it('case 2', () => {
    expect(run('84')).toBe('84 = 2^2 × 3 × 7')
  })
  it('case 3', () => {
    expect(run('1')).toBe('1 is neither prime nor composite')
  })
  it('case 4', () => {
    expect(run('2')).toBe('2 is prime')
  })
  it('case 5', () => {
    expect(run('1,000,000')).toBe('1000000 = 2^6 × 5^6')
  })
  it('case 6', () => {
    expect(run('999999999989')).toBe('999999999989 is prime')
  })
  it('case 7', () => {
    expect(() => run('x')).toThrow('whole number')
  })
  it('case 8', () => {
    expect(() => run('1000000000001')).toThrow('1,000,000,000,000')
  })
})
