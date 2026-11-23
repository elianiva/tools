import { describe, expect, it } from 'vitest'
import { run } from './vat-calculator.ts'

describe('vat-calculator', () => {
  it('case 1', () => {
    expect(run('100 11', 'add')).toBe('Net: 100.00\nVAT: 11.00\nGross: 111.00')
  })
  it('case 2', () => {
    expect(run('111 11', 'remove')).toBe('Net: 100.00\nVAT: 11.00\nGross: 111.00')
  })
  it('case 3', () => {
    expect(run('50 20', 'add')).toBe('Net: 50.00\nVAT: 10.00\nGross: 60.00')
  })
  it('case 4', () => {
    expect(() => run('100', 'add')).toThrow('Enter an amount')
  })
})
