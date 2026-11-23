import { describe, expect, it } from 'vitest'
import { run } from './tip-calculator.ts'

describe('tip-calculator', () => {
  it('case 1', () => {
    expect(run('100 20 4')).toBe('Tip: 20.00\nTotal: 120.00\nPer person: 30.00')
  })
  it('case 2', () => {
    expect(run('45.50 15')).toBe('Tip: 6.83\nTotal: 52.33\nPer person: 52.33')
  })
  it('case 3', () => {
    expect(() => run('100')).toThrow('Enter bill')
  })
})
