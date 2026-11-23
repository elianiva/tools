import { describe, expect, it } from 'vitest'
import { run } from './slope.ts'

describe('slope', () => {
  it('case 1', () => {
    expect(run('1 2 3 6')).toBe('Slope: 2\nIntercept: 0\nDistance: 4.472136\nMidpoint: (2, 4)')
  })
  it('case 2', () => {
    expect(run('1 2 1 6')).toBe('Slope: undefined (vertical line)\nDistance: 4\nMidpoint: (1, 4)')
  })
  it('case 3', () => {
    expect(run('0 1 2 1')).toBe('Slope: 0\nIntercept: 1\nDistance: 2\nMidpoint: (1, 1)')
  })
  it('case 4', () => {
    expect(run('-1 -1 1 1')).toBe('Slope: 1\nIntercept: 0\nDistance: 2.828427\nMidpoint: (0, 0)')
  })
  it('case 5', () => {
    expect(() => run('1 1 1 1')).toThrow('two different points')
  })
  it('case 6', () => {
    expect(() => run('1 2 3')).toThrow('four numbers')
  })
})
