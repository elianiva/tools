import { describe, expect, it } from 'vitest'
import { run } from './number-format.ts'

describe('number-format', () => {
  it('case 1', () => {
    expect(run('1234567.891', 'en')).toBe('1,234,567.891')
  })
  it('case 2', () => {
    expect(run('1234567.891', 'de')).toBe('1.234.567,891')
  })
  it('case 3', () => {
    expect(run('1234567.891', 'in')).toBe('12,34,567.891')
  })
  it('case 4', () => {
    expect(run('1234567.891', 'id')).toBe('1.234.567,891')
  })
  it('case 5', () => {
    expect(run('1,234', 'en')).toBe('1,234')
  })
  it('case 6', () => {
    expect(() => run('abc', 'en')).toThrow('Enter a number')
  })
})
