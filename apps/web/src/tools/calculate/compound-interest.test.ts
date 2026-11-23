import { describe, expect, it } from 'vitest'
import { run } from './compound-interest.ts'

describe('compound-interest', () => {
  it('case 1', () => {
    expect(run('1000 5 10', 'yearly')).toBe('Final amount: 1628.89\nInterest earned: 628.89')
  })
  it('case 2', () => {
    expect(run('1000 5 10', 'monthly')).toContain('Final amount: 1647.01')
  })
  it('case 3', () => {
    expect(() => run('1000', 'yearly')).toThrow('Enter principal')
  })
})
