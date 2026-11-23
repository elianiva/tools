import { describe, expect, it } from 'vitest'
import { run } from './scientific-notation.ts'

describe('scientific-notation', () => {
  it('case 1', () => {
    expect(run('12345', 'to-scientific')).toBe('1.2345 × 10^4')
  })
  it('case 2', () => {
    expect(run('0.00012', 'to-scientific')).toBe('1.2 × 10^-4')
  })
  it('case 3', () => {
    expect(run('0', 'to-scientific')).toBe('0 × 10^0')
  })
  it('case 4', () => {
    expect(run('-500', 'to-scientific')).toBe('-5 × 10^2')
  })
  it('case 5', () => {
    expect(run('1.2345 × 10^4', 'to-decimal')).toBe('12345')
  })
  it('case 6', () => {
    expect(run('1.5e3', 'to-decimal')).toBe('1500')
  })
  it('case 7', () => {
    expect(run('2x10^-3', 'to-decimal')).toBe('0.002')
  })
  it('case 8', () => {
    expect(run('-3 * 10^2', 'to-decimal')).toBe('-300')
  })
  it('case 9', () => {
    expect(() => run('5', 'to-decimal')).toThrow('Use a form')
  })
  it('case 10', () => {
    expect(() => run('1e30', 'to-decimal')).toThrow('between -20 and 20')
  })
  it('case 11', () => {
    expect(() => run('abc', 'to-scientific')).toThrow('Enter a number')
  })
})
