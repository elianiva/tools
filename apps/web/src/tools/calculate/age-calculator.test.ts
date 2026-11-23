import { describe, expect, it } from 'vitest'
import { run } from './age-calculator.ts'

describe('age-calculator', () => {
  it('case 1', () => {
    expect(run('1990-08-15 2024-08-14')).toBe('Age: 33 years, 11 months, 30 days')
  })
  it('case 2', () => {
    expect(run('2000-02-29 2024-02-29')).toBe('Age: 24 years, 0 months, 0 days')
  })
  it('case 3', () => {
    expect(run('2024-01-31 2024-03-01')).toBe('Age: 0 years, 0 months, 30 days')
  })
  it('case 4', () => {
    expect(run('2000-01-01 2000-01-01')).toBe('Age: 0 years, 0 months, 0 days')
  })
  it('case 5', () => {
    expect(() => run('2024-03-01 2024-01-01')).toThrow('before the birth date')
  })
  it('case 6', () => {
    expect(() => run('2024-01-01')).toThrow('Enter a birth date')
  })
})
