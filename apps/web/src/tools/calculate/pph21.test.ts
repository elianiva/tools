import { describe, expect, it } from 'vitest'
import { run } from './pph21.ts'

describe('pph21', () => {
  it('case 1', () => {
    expect(run('15000000 TK/0', 'monthly')).toContain('Category: TER A (TK/0)')
  })
  it('case 2', () => {
    expect(run('15000000 TK/0', 'monthly')).toContain('Rate: 6%')
  })
  it('case 3', () => {
    expect(run('15000000 TK/0', 'monthly')).toContain('PPh 21: Rp 900.000')
  })
  it('case 4', () => {
    expect(run('15.000.000 tk/0', 'monthly')).toContain('PPh 21: Rp 900.000')
  })
  it('case 5', () => {
    expect(run('5400000 TK/0', 'monthly')).toContain('PPh 21: Rp 0')
  })
  it('case 6', () => {
    expect(run('5400001 TK/0', 'monthly')).toContain('Rate: 0.25%')
  })
  it('case 7', () => {
    expect(run('5400200 TK/0', 'monthly')).toContain('PPh 21: Rp 13.500')
  })
  it('case 8', () => {
    expect(run('5400201 TK/0', 'monthly')).toContain('PPh 21: Rp 13.501')
  })
  it('case 9', () => {
    expect(run('30080000 K/0', 'monthly')).toContain('PPh 21: Rp 3.910.400')
  })
  it('case 10', () => {
    expect(run('6800000 K/2', 'monthly')).toContain('Category: TER B (K/2)')
  })
  it('case 11', () => {
    expect(run('6800000 K/2', 'monthly')).toContain('PPh 21: Rp 34.000')
  })
  it('case 12', () => {
    expect(run('10545000 K/1', 'monthly')).toContain('PPh 21: Rp 158.175')
  })
  it('case 13', () => {
    expect(run('30000000 K/3', 'monthly')).toContain('Category: TER C (K/3)')
  })
  it('case 14', () => {
    expect(run('30000000 K/3', 'monthly')).toContain('PPh 21: Rp 3.300.000')
  })
  it('case 15', () => {
    expect(run('60000000 TK/0', 'monthly')).toContain('PPh 21: Rp 12.000.000')
  })
  it('case 16', () => {
    expect(run('2000000000 TK/0', 'monthly')).toContain('PPh 21: Rp 680.000.000')
  })
  it('case 17', () => {
    expect(run('6200000 TK/2', 'monthly')).toContain('Category: TER B (TK/2)')
  })
  it('case 18', () => {
    expect(run('10000000 TK/0', 'year')).toContain('Withheld in December: Rp 800.000')
  })
  it('case 19', () => {
    expect(run('10000000 TK/0', 'year')).toContain('Taxable income (PKP): Rp 60.000.000')
  })
  it('case 20', () => {
    expect(run('10000000 TK/0', 'year')).toContain('PPh 21 for the year: Rp 3.000.000')
  })
  it('case 21', () => {
    expect(run('15000000 TK/0', 'year')).toContain('Withheld in December: Rp 2.100.000')
  })
  it('case 22', () => {
    expect(run('15000000 TK/0 100000', 'year')).toContain('Taxable income (PKP): Rp 118.800.000')
  })
  it('case 23', () => {
    expect(run('15000000 TK/0 100000', 'year')).toContain('Withheld in December: Rp 1.920.000')
  })
  it('case 24', () => {
    expect(run('10000500 TK/0 123', 'year')).toContain('Taxable income (PKP): Rp 60.004.000')
  })
  it('case 25', () => {
    expect(run('10000500 TK/0 123', 'year')).toContain('PPh 21 for the year: Rp 3.000.600')
  })
  it('case 26', () => {
    expect(run('10000500 TK/0 123', 'year')).toContain('Withheld in December: Rp 800.490')
  })
  it('case 27', () => {
    expect(run('5500000 K/0 100000', 'year')).toContain('PPh 21 for the year: Rp 150.000')
  })
  it('case 28', () => {
    expect(run('5500000 K/0 100000', 'year')).toContain('Withheld in December: Rp -1.250')
  })
  it('case 29', () => {
    expect(run('6000000 K/0 100000', 'year')).toContain('PPh 21 for the year: Rp 435.000')
  })
  it('case 30', () => {
    expect(run('6000000 K/0 100000', 'year')).toContain('Withheld in December: Rp -60.000')
  })
  it('case 31', () => {
    expect(run('10000000 K/0 100000', 'year')).toContain('PPh 21 for the year: Rp 2.715.000')
  })
  it('case 32', () => {
    expect(run('10000000 K/0 100000', 'year')).toContain('Withheld in December: Rp 515.000')
  })
  it('case 33', () => {
    expect(run('200000000 TK/0', 'year')).toContain('PPh 21 for the year: Rp 646.000.000')
  })
  it('case 34', () => {
    expect(run('200000000 TK/0', 'year')).toContain('Withheld in December: Rp 52.000.000')
  })
  it('case 35', () => {
    expect(run('500000000 TK/0', 'year')).toContain('PPh 21 for the year: Rp 1.773.000.000')
  })
  it('case 36', () => {
    expect(run('3000000 TK/0', 'year')).toContain('PPh 21 for the year: Rp 0')
  })
  it('case 37', () => {
    expect(run('15000000 TK/0', 'year')).toContain(
      'https://peraturan.bpk.go.id/Download/346093/2023pmkeuangan168.pdf',
    )
  })
  it('case 38', () => {
    expect(() => run('15000000', 'monthly')).toThrow('PTKP status')
  })
  it('case 39', () => {
    expect(() => run('TK/0', 'monthly')).toThrow('monthly gross salary')
  })
  it('case 40', () => {
    expect(() => run('0 K/1', 'year')).toThrow('monthly gross salary')
  })
})
