import { describe, expect, it } from 'vitest'
import { run } from './work-hours.ts'

describe('work-hours', () => {
  it('case 1', () => {
    expect(run('9:00 17:30 30')).toBe('Worked: 8h 0m (8.00 hours)')
  })
  it('case 2', () => {
    expect(run('22:00 6:00')).toBe('Worked: 8h 0m (8.00 hours)')
  })
  it('case 3', () => {
    expect(run('9:00 10:15')).toBe('Worked: 1h 15m (1.25 hours)')
  })
  it('case 4', () => {
    expect(() => run('9:00 9:30 60')).toThrow('break is longer')
  })
  it('case 5', () => {
    expect(() => run('25:00 9:00')).toThrow('Use times')
  })
  it('case 6', () => {
    expect(() => run('abc')).toThrow('Enter start')
  })
})
