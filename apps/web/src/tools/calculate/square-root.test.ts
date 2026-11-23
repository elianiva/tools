import { describe, expect, it } from 'vitest'
import { run } from './square-root.ts'

describe('square-root', () => {
  it('case 1', () => {
    expect(run('16')).toBe('Square root: 4\nCube root: 2.519842\nSquare: 256\nCube: 4096')
  })
  it('case 2', () => {
    expect(run('-8')).toBe('Square root: not a real number\nCube root: -2\nSquare: 64\nCube: -512')
  })
  it('case 3', () => {
    expect(run('2')).toBe('Square root: 1.414214\nCube root: 1.259921\nSquare: 4\nCube: 8')
  })
  it('case 4', () => {
    expect(() => run('abc')).toThrow('Enter a number')
  })
})
