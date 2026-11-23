import { describe, expect, it } from 'vitest'
import { run } from './gcd-lcm.ts'

describe('gcd-lcm', () => {
  it('case 1', () => {
    expect(run('12 18')).toBe('GCD: 6\nLCM: 36')
  })
  it('case 2', () => {
    expect(run('4 6 10')).toBe('GCD: 2\nLCM: 60')
  })
  it('case 3', () => {
    expect(run('7 13')).toBe('GCD: 1\nLCM: 91')
  })
  it('case 4', () => {
    expect(() => run('5')).toThrow('two or more')
  })
  it('case 5', () => {
    expect(() => run('0 4')).toThrow('two or more')
  })
})
