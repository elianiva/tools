import { describe, expect, it } from 'vitest'
import { run } from './time-add.ts'

describe('time-add', () => {
  it('case 1', () => {
    expect(run('1:30 2:45', 'add')).toBe('4:15')
  })
  it('case 2', () => {
    expect(run('0:45 0:45 0:45', 'add')).toBe('2:15')
  })
  it('case 3', () => {
    expect(run('10:00 2:30', 'subtract')).toBe('7:30')
  })
  it('case 4', () => {
    expect(run('1:00 1:30', 'subtract')).toBe('-0:30')
  })
  it('case 5', () => {
    expect(() => run('1:75 2:00', 'add')).toThrow('Minutes must be')
  })
  it('case 6', () => {
    expect(() => run('1:30', 'add')).toThrow('two or more')
  })
})
