import { describe, expect, it } from 'vitest'
import { run } from './weekday.ts'

describe('weekday', () => {
  it('case 1', () => {
    expect(run('2024-02-29')).toBe('Thursday, day 60 of 2024')
  })
  it('case 2', () => {
    expect(run('2024-12-31')).toBe('Tuesday, day 366 of 2024')
  })
  it('case 3', () => {
    expect(() => run('2023-02-29')).toThrow('does not exist')
  })
  it('case 4', () => {
    expect(() => run('soon')).toThrow('Enter a date')
  })
})
