import { describe, expect, it } from 'vitest'
import { run } from './bitwise.ts'

describe('bitwise', () => {
  it('case 1', () => {
    expect(run('12 & 10')).toBe('Decimal: 8\nHex: 8\nBinary: 1000')
  })
  it('case 2', () => {
    expect(run('12 | 10')).toBe('Decimal: 14\nHex: e\nBinary: 1110')
  })
  it('case 3', () => {
    expect(run('12 ^ 10')).toBe('Decimal: 6\nHex: 6\nBinary: 110')
  })
  it('case 4', () => {
    expect(run('1 << 4')).toBe('Decimal: 16\nHex: 10\nBinary: 10000')
  })
  it('case 5', () => {
    expect(run('-16 >> 2')).toBe('Decimal: -4\nHex: -4\nBinary: -100')
  })
  it('case 6', () => {
    expect(run('~5')).toBe('Decimal: -6\nHex: -6\nBinary: -110')
  })
  it('case 7', () => {
    expect(run('255&15')).toBe('Decimal: 15\nHex: f\nBinary: 1111')
  })
  it('case 8', () => {
    expect(run('1 << 70')).toBe(
      'Decimal: 1180591620717411303424\nHex: 400000000000000000\nBinary: 1' + '0'.repeat(70),
    )
  })
  it('case 9', () => {
    expect(() => run('1 << -1')).toThrow('Shift by')
  })
  it('case 10', () => {
    expect(() => run('abc')).toThrow('Write an expression')
  })
})
