import { describe, expect, it } from 'vitest'
import { run } from './clock-format.ts'

describe('clock-format', () => {
  it('case 1', () => {
    expect(run('14:30', 'to-12')).toBe('2:30 PM')
  })
  it('case 2', () => {
    expect(run('00:05', 'to-12')).toBe('12:05 AM')
  })
  it('case 3', () => {
    expect(run('12:00', 'to-12')).toBe('12:00 PM')
  })
  it('case 4', () => {
    expect(run('23:59', 'to-12')).toBe('11:59 PM')
  })
  it('case 5', () => {
    expect(run('2:30 PM', 'to-24')).toBe('14:30')
  })
  it('case 6', () => {
    expect(run('12:00 AM', 'to-24')).toBe('00:00')
  })
  it('case 7', () => {
    expect(run('12:30 pm', 'to-24')).toBe('12:30')
  })
  it('case 8', () => {
    expect(run('9:05 am', 'to-24')).toBe('09:05')
  })
  it('case 9', () => {
    expect(run('1:00 PM\n1:00 AM', 'to-24')).toBe('13:00\n01:00')
  })
  it('case 10', () => {
    expect(() => run('25:00', 'to-12')).toThrow('not a valid time')
  })
  it('case 11', () => {
    expect(() => run('13:00 PM', 'to-24')).toThrow('not a valid time')
  })
  it('case 12', () => {
    expect(() => run('14:30', 'to-24')).toThrow('Add AM or PM')
  })
  it('case 13', () => {
    expect(() => run('noon', 'to-12')).toThrow('is not a time')
  })
})
