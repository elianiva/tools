import { describe, expect, it } from 'vitest'
import { run } from './number-stats.ts'

describe('number-stats', () => {
  it('case 1', () => {
    expect(run('1 2 3 4')).toBe(
      'Count: 4\nSum: 10\nMean: 2.5\nMedian: 2.5\nMin: 1\nMax: 4\nStd dev: 1.118034',
    )
  })
  it('case 2', () => {
    expect(run('5, 1, 9')).toBe(
      'Count: 3\nSum: 15\nMean: 5\nMedian: 5\nMin: 1\nMax: 9\nStd dev: 3.265986',
    )
  })
  it('case 3', () => {
    expect(run('-2.5\n7')).toBe(
      'Count: 2\nSum: 4.5\nMean: 2.25\nMedian: 2.25\nMin: -2.5\nMax: 7\nStd dev: 4.75',
    )
  })
  it('case 4', () => {
    expect(() => run('abc')).toThrow('Enter some numbers')
  })
})
