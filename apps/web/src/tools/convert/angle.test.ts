import { describe, expect, it } from 'vitest'
import { run } from './angle.ts'

describe('angle', () => {
  it('case 1', () => {
    expect(run('180', 'deg')).toBe('Degrees: 180\nRadians: 3.141593\nGradians: 200')
  })
  it('case 2', () => {
    expect(run('3.141592653589793', 'rad')).toBe('Degrees: 180\nRadians: 3.141593\nGradians: 200')
  })
  it('case 3', () => {
    expect(run('100', 'grad')).toBe('Degrees: 90\nRadians: 1.570796\nGradians: 100')
  })
  it('case 4', () => {
    expect(run('-90', 'deg')).toBe('Degrees: -90\nRadians: -1.570796\nGradians: -100')
  })
  it('case 5', () => {
    expect(() => run('abc', 'deg')).toThrow('Enter a number')
  })
})
