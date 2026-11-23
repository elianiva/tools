import { describe, expect, it } from 'vitest'
import { run } from './edit-distance.ts'

describe('edit-distance', () => {
  it('case 1', () => {
    expect(run('kitten\nsitting')).toBe('Distance: 3\nSimilarity: 57.1%')
  })
  it('case 2', () => {
    expect(run('flaw\nlawn')).toBe('Distance: 2\nSimilarity: 50.0%')
  })
  it('case 3', () => {
    expect(run('abc\nabc')).toBe('Distance: 0\nSimilarity: 100.0%')
  })
  it('case 4', () => {
    expect(run('é\ne')).toBe('Distance: 1\nSimilarity: 0.0%')
  })
  it('case 5', () => {
    expect(run('\nabc')).toBe('Distance: 3\nSimilarity: 0.0%')
  })
  it('case 6', () => {
    expect(() => run('one line')).toThrow('Enter two lines')
  })
  it('case 7', () => {
    expect(() => run('a\nb\nc')).toThrow('Enter two lines')
  })
})
