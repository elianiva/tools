import { describe, expect, it } from 'vitest'
import { run } from './weighted-average.ts'

describe('weighted-average', () => {
  it('case 1', () => {
    expect(run('90*40\n80*60')).toBe('Weighted average: 84\nTotal weight: 100')
  })
  it('case 2', () => {
    expect(run('70*1 80*1 90*1')).toBe('Weighted average: 80\nTotal weight: 3')
  })
  it('case 3', () => {
    expect(run('100 x 3, 70 x 1')).toBe('Weighted average: 92.5\nTotal weight: 4')
  })
  it('case 4', () => {
    expect(() => run('10*0')).toThrow('add up to zero')
  })
  it('case 5', () => {
    expect(() => run('abc')).toThrow('Enter pairs')
  })
})
