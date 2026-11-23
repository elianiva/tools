import { describe, expect, it } from 'vitest'
import { run } from './circle.ts'

describe('circle', () => {
  it('case 1', () => {
    expect(run('5', 'radius')).toBe(
      'Radius: 5\nDiameter: 10\nCircumference: 31.4159\nArea: 78.5398',
    )
  })
  it('case 2', () => {
    expect(run('10', 'diameter')).toBe(
      'Radius: 5\nDiameter: 10\nCircumference: 31.4159\nArea: 78.5398',
    )
  })
  it('case 3', () => {
    expect(run('1', 'radius')).toBe('Radius: 1\nDiameter: 2\nCircumference: 6.2832\nArea: 3.1416')
  })
  it('case 4', () => {
    expect(() => run('-1', 'radius')).toThrow('positive number')
  })
})
