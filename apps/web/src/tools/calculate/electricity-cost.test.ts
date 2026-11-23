import { describe, expect, it } from 'vitest'
import { run } from './electricity-cost.ts'

describe('electricity-cost', () => {
  it('case 1', () => {
    expect(run('1000 5 1500')).toBe(
      'Energy per day: 5.00 kWh\nCost per day: 7500.00\nCost per 30 days: 225000.00',
    )
  })
  it('case 2', () => {
    expect(run('60 8 1444')).toBe(
      'Energy per day: 0.48 kWh\nCost per day: 693.12\nCost per 30 days: 20793.60',
    )
  })
  it('case 3', () => {
    expect(() => run('1000 5')).toThrow('Enter watts')
  })
})
