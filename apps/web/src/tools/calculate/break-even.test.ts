import { describe, expect, it } from 'vitest'
import { run } from './break-even.ts'

describe('break-even', () => {
  it('case 1', () => {
    expect(run('1000 25 15')).toBe('Break-even units: 100\nRevenue at break-even: 2500.00')
  })
  it('case 2', () => {
    expect(run('1001 25 15')).toBe('Break-even units: 101\nRevenue at break-even: 2525.00')
  })
  it('case 3', () => {
    expect(() => run('1000 10 15')).toThrow('higher than the variable cost')
  })
  it('case 4', () => {
    expect(() => run('1000 25')).toThrow('Enter fixed costs')
  })
})
