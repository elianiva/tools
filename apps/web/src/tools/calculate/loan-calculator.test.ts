import { describe, expect, it } from 'vitest'
import { run } from './loan-calculator.ts'

describe('loan-calculator', () => {
  it('case 1', () => {
    expect(run('10000 5 3')).toContain('Monthly payment: 299.71')
  })
  it('case 2', () => {
    expect(run('1200 0 1')).toContain('Monthly payment: 100.00')
  })
  it('case 3', () => {
    expect(run('1200 0 1')).toContain('Total interest: 0.00')
  })
  it('case 4', () => {
    expect(() => run('10000')).toThrow('Enter amount')
  })
})
