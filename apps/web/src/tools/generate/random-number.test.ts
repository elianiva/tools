import { describe, expect, it } from 'vitest'
import { run } from './random-number.ts'

describe('random-number', () => {
  it('draws the asked count inside the range and reaches both ends', () => {
    const seen = new Set<number>()
    for (let i = 0; i < 300; i += 1) {
      const numbers = run('-1 1 4').split(', ').map(Number)
      expect(numbers).toHaveLength(4)
      for (const n of numbers) seen.add(n)
    }
    expect([...seen].toSorted((a, b) => a - b)).toEqual([-1, 0, 1])
  })

  it('draws one number when no count is given', () => {
    expect(run('5 5')).toBe('5')
  })

  it('rejects bad ranges and counts', () => {
    expect(() => run('9 1')).toThrow('cannot be above')
    expect(() => run('1')).toThrow('Enter a minimum')
    expect(() => run('1 10 101')).toThrow('1 to 100')
    expect(() => run('0 4294967296')).toThrow('4 billion')
  })
})
