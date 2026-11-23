import { describe, expect, it } from 'vitest'
import { run } from './hours-decimal.ts'

describe('hours-decimal', () => {
  it('case 1', () => {
    expect(run('1:45', 'to-decimal')).toBe('1.75')
  })
  it('case 2', () => {
    expect(run('0:20', 'to-decimal')).toBe('0.3333')
  })
  it('case 3', () => {
    expect(run('8:00', 'to-decimal')).toBe('8')
  })
  it('case 4', () => {
    expect(run('2.25', 'to-time')).toBe('2:15')
  })
  it('case 5', () => {
    expect(run('0.1', 'to-time')).toBe('0:06')
  })
  it('case 6', () => {
    expect(run('1.999', 'to-time')).toBe('2:00')
  })
  it('case 7', () => {
    expect(() => run('1:75', 'to-decimal')).toThrow('h:mm')
  })
  it('case 8', () => {
    expect(() => run('abc', 'to-time')).toThrow('such as 2.25')
  })
})
