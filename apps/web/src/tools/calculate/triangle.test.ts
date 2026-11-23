import { describe, expect, it } from 'vitest'
import { run } from './triangle.ts'

describe('triangle', () => {
  it('case 1', () => {
    expect(run('3 4 5')).toBe('Perimeter: 12\nArea: 6\nType: scalene, right')
  })
  it('case 2', () => {
    expect(run('2 2 2')).toBe('Perimeter: 6\nArea: 1.732051\nType: equilateral, acute')
  })
  it('case 3', () => {
    expect(run('5 5 8')).toBe('Perimeter: 18\nArea: 12\nType: isosceles, obtuse')
  })
  it('case 4', () => {
    expect(run('8 5 5')).toBe('Perimeter: 18\nArea: 12\nType: isosceles, obtuse')
  })
  it('case 5', () => {
    expect(() => run('1 2 3')).toThrow('do not form a triangle')
  })
  it('case 6', () => {
    expect(() => run('3 4')).toThrow('three side lengths')
  })
})
