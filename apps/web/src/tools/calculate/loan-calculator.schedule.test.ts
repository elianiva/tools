import { describe, expect, it } from 'vitest'
import { amortize } from './loan-calculator.ts'

describe('amortize', () => {
  it('repays the whole amount by the last payment', () => {
    const { rows, balances, payment } = amortize(10000, 5, 3)
    expect(payment).toBeCloseTo(299.71, 2)
    expect(balances).toHaveLength(37)
    expect(rows.map((row) => row.year)).toEqual([1, 2, 3])
    expect(rows.reduce((sum, row) => sum + row.principal, 0)).toBeCloseTo(10000, 6)
    expect(rows.at(-1)?.balance).toBe(0)
  })

  it('charges no interest at a zero rate and groups a partial last year', () => {
    const { rows } = amortize(1800, 0, 1.5)
    expect(rows).toHaveLength(2)
    expect(rows.every((row) => row.interest === 0)).toBe(true)
    expect(rows[1]?.principal).toBeCloseTo(600, 6)
  })
})
