import { describe, expect, it } from 'vitest'
import { run } from './roman-numerals.ts'

describe('roman-numerals', () => {
  it('case 1', () => {
    expect(run('1994', 'to-roman')).toBe('MCMXCIV')
  })
  it('case 2', () => {
    expect(run('4', 'to-roman')).toBe('IV')
  })
  it('case 3', () => {
    expect(run('3999', 'to-roman')).toBe('MMMCMXCIX')
  })
  it('case 4', () => {
    expect(run('mmxxiv', 'from-roman')).toBe('2024')
  })
  it('case 5', () => {
    expect(run('XLII', 'from-roman')).toBe('42')
  })
  it('case 6', () => {
    expect(() => run('4000', 'to-roman')).toThrow('1 to 3999')
  })
  it('case 7', () => {
    expect(() => run('IIII', 'from-roman')).toThrow('valid Roman')
  })
  it('case 8', () => {
    expect(() => run('0', 'to-roman')).toThrow('1 to 3999')
  })
})
