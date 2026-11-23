import { describe, expect, it } from 'vitest'
import { run } from './discount-calculator.ts'

describe('discount-calculator', () => {
  it('case 1', () => {
    expect(run('100 25')).toBe('Sale price: 75.00\nYou save: 25.00')
  })
  it('case 2', () => {
    expect(run('19.99 10')).toBe('Sale price: 17.99\nYou save: 2.00')
  })
  it('case 3', () => {
    expect(() => run('100')).toThrow('Enter a price')
  })
})
