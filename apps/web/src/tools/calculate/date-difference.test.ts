import { describe, expect, it } from 'vitest'
import { run } from './date-difference.ts'

describe('date-difference', () => {
  it('case 1', () => {
    expect(run('2024-01-01 2024-03-01')).toBe('Days: 60\nWeeks: 8 weeks 4 days')
  })
  it('case 2', () => {
    expect(run('2024-03-01 2024-01-01')).toBe('Days: 60\nWeeks: 8 weeks 4 days')
  })
  it('case 3', () => {
    expect(run('2023-12-31 to 2024-12-31')).toBe('Days: 366\nWeeks: 52 weeks 2 days')
  })
  it('case 4', () => {
    expect(() => run('2024-01-01')).toThrow('two dates')
  })
})
