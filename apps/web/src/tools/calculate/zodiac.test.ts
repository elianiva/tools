import { describe, expect, it } from 'vitest'
import { run } from './zodiac.ts'

describe('zodiac', () => {
  it('case 1', () => {
    expect(run('1990-08-15')).toBe('Leo')
  })
  it('case 2', () => {
    expect(run('2000-03-21')).toBe('Aries')
  })
  it('case 3', () => {
    expect(run('2000-03-20')).toBe('Pisces')
  })
  it('case 4', () => {
    expect(run('2000-12-25')).toBe('Capricorn')
  })
  it('case 5', () => {
    expect(run('2001-01-19')).toBe('Capricorn')
  })
  it('case 6', () => {
    expect(run('2001-01-20')).toBe('Aquarius')
  })
  it('case 7', () => {
    expect(run('12-22')).toBe('Capricorn')
  })
  it('case 8', () => {
    expect(run('12-21')).toBe('Sagittarius')
  })
  it('case 9', () => {
    expect(() => run('2001-02-30')).toThrow('does not exist')
  })
  it('case 10', () => {
    expect(() => run('soon')).toThrow('Enter a date')
  })
})
