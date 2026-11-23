import { describe, expect, it } from 'vitest'
import { run } from './fuel-cost.ts'

describe('fuel-cost', () => {
  it('case 1', () => {
    expect(run('300 8 15000', 'l100')).toBe('Fuel: 24.00 L\nCost: 360000.00')
  })
  it('case 2', () => {
    expect(run('300 12 15000', 'kmpl')).toBe('Fuel: 25.00 L\nCost: 375000.00')
  })
  it('case 3', () => {
    expect(() => run('300 0 15000', 'l100')).toThrow('Enter distance')
  })
})
