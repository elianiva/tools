import { describe, expect, it } from 'vitest'
import { run } from './quadratic.ts'

describe('quadratic', () => {
  it('case 1', () => {
    expect(run('1 -3 2')).toBe('Discriminant: 1\nx1 = 2\nx2 = 1')
  })
  it('case 2', () => {
    expect(run('1 2 1')).toBe('Discriminant: 0\nx = -1')
  })
  it('case 3', () => {
    expect(run('1 2 5')).toBe('Discriminant: -16\nx1 = -1 + 2i\nx2 = -1 - 2i')
  })
  it('case 4', () => {
    expect(run('2 0 -8')).toBe('Discriminant: 64\nx1 = 2\nx2 = -2')
  })
  it('case 5', () => {
    expect(() => run('0 1 1')).toThrow('a cannot be zero')
  })
  it('case 6', () => {
    expect(() => run('1 2')).toThrow('Enter a, b, and c')
  })
})
