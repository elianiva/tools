import { describe, expect, it } from 'vitest'
import { percentage } from './percentage.logic.ts'

describe('percentage', () => {
  it('finds a share, a ratio, a change and an adjustment', () => {
    expect(percentage('20% of 150')).toBe('30')
    expect(percentage('30 is what % of 120')).toBe('25%')
    expect(percentage('80 to 100')).toBe('+25%')
    expect(percentage('100 to 80')).toBe('-20%')
    expect(percentage('150 + 20%')).toBe('180')
    expect(percentage('150 - 20%')).toBe('120')
  })
  it('does not divide by zero', () => {
    expect(() => percentage('5 is what % of 0')).toThrow('zero')
    expect(() => percentage('0 to 5')).toThrow('zero')
  })
  it('explains unknown input', () => {
    expect(() => percentage('lots')).toThrow('Try')
  })
})
