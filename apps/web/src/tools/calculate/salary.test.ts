import { describe, expect, it } from 'vitest'
import { run } from './salary.ts'

describe('salary', () => {
  it('case 1', () => {
    expect(run('50000', 'yearly')).toBe(
      'Hourly: 24.04\nDaily: 192.31\nWeekly: 961.54\nMonthly: 4166.67\nYearly: 50000.00',
    )
  })
  it('case 2', () => {
    expect(run('25', 'hourly')).toContain('Yearly: 52000.00')
  })
  it('case 3', () => {
    expect(run('5,000', 'monthly')).toContain('Yearly: 60000.00')
  })
  it('case 4', () => {
    expect(() => run('lots', 'yearly')).toThrow('Enter an amount')
  })
})
