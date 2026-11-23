import { describe, expect, it } from 'vitest'
import { run } from './pythagorean.ts'

describe('pythagorean', () => {
  it('case 1', () => {
    expect(run('3 4', 'hypotenuse')).toBe('Hypotenuse: 5')
  })
  it('case 2', () => {
    expect(run('1 1', 'hypotenuse')).toBe('Hypotenuse: 1.414214')
  })
  it('case 3', () => {
    expect(run('5 3', 'leg')).toBe('Missing leg: 4')
  })
  it('case 4', () => {
    expect(() => run('3 5', 'leg')).toThrow('longer than the leg')
  })
  it('case 5', () => {
    expect(() => run('3', 'hypotenuse')).toThrow('Enter two side')
  })
})
