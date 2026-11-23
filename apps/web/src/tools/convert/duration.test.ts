import { describe, expect, it } from 'vitest'
import { run } from './duration.ts'

describe('duration', () => {
  it('case 1', () => {
    expect(run('3661', 'to-duration')).toBe('1h 1m 1s')
  })
  it('case 2', () => {
    expect(run('90000', 'to-duration')).toBe('1d 1h')
  })
  it('case 3', () => {
    expect(run('0', 'to-duration')).toBe('0s')
  })
  it('case 4', () => {
    expect(run('1d 2h', 'to-seconds')).toBe('93600')
  })
  it('case 5', () => {
    expect(run('1h 30m', 'to-seconds')).toBe('5400')
  })
  it('case 6', () => {
    expect(run('1.5h', 'to-seconds')).toBe('5400')
  })
  it('case 7', () => {
    expect(run('2M 5s', 'to-seconds')).toBe('125')
  })
  it('case 8', () => {
    expect(() => run('abc', 'to-duration')).toThrow('whole number')
  })
  it('case 9', () => {
    expect(() => run('abc', 'to-seconds')).toThrow('Use units')
  })
})
