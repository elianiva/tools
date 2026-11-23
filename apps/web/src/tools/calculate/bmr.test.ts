import { describe, expect, it } from 'vitest'
import { run } from './bmr.ts'

describe('bmr', () => {
  it('case 1', () => {
    expect(run('70 175 30', 'male')).toBe('BMR: 1649 kcal/day')
  })
  it('case 2', () => {
    expect(run('70 175 30', 'female')).toBe('BMR: 1483 kcal/day')
  })
  it('case 3', () => {
    expect(() => run('70 175', 'male')).toThrow('Enter weight')
  })
})
