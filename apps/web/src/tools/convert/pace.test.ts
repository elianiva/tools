import { describe, expect, it } from 'vitest'
import { run } from './pace.ts'

describe('pace', () => {
  it('case 1', () => {
    expect(run('5 25:00', 'km')).toBe('Pace: 5:00 /km\nSpeed: 12.00 km/h')
  })
  it('case 2', () => {
    expect(run('10 1:00:00', 'km')).toBe('Pace: 6:00 /km\nSpeed: 10.00 km/h')
  })
  it('case 3', () => {
    expect(run('26.2 4:00:00', 'mi')).toBe('Pace: 9:10 /mi\nSpeed: 6.55 mi/h')
  })
  it('case 4', () => {
    expect(() => run('5', 'km')).toThrow('Enter distance')
  })
})
