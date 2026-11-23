import { describe, expect, it } from 'vitest'
import { run } from './base-converter.ts'

describe('base-converter', () => {
  it('case 1', () => {
    expect(run('255', 'dec')).toBe('Decimal: 255\nHex: ff\nBinary: 11111111\nOctal: 377')
  })
  it('case 2', () => {
    expect(run('0xFF', 'hex')).toBe('Decimal: 255\nHex: ff\nBinary: 11111111\nOctal: 377')
  })
  it('case 3', () => {
    expect(run('1010', 'bin')).toBe('Decimal: 10\nHex: a\nBinary: 1010\nOctal: 12')
  })
  it('case 4', () => {
    expect(run('-17', 'oct')).toBe('Decimal: -15\nHex: -f\nBinary: -1111\nOctal: -17')
  })
  it('case 5', () => {
    expect(run('18446744073709551616', 'dec')).toBe(
      'Decimal: 18446744073709551616\nHex: 10000000000000000\nBinary: 1' +
        '0'.repeat(64) +
        '\nOctal: 2000000000000000000000',
    )
  })
  it('case 6', () => {
    expect(() => run('xyz', 'dec')).toThrow('valid number')
  })
  it('case 7', () => {
    expect(() => run('12', 'bin')).toThrow('valid number')
  })
})
