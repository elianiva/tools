import { describe, expect, it } from 'vitest'
import { run } from './leap-year.ts'

describe('leap-year', () => {
  it('case 1', () => {
    expect(run('2024')).toBe('2024 is a leap year (366 days)')
  })
  it('case 2', () => {
    expect(run('1900')).toBe('1900 is not a leap year (365 days)')
  })
  it('case 3', () => {
    expect(run('2000')).toBe('2000 is a leap year (366 days)')
  })
  it('case 4', () => {
    expect(run('2023')).toBe('2023 is not a leap year (365 days)')
  })
  it('case 5', () => {
    expect(() => run('abc')).toThrow('Enter a year')
  })
})
