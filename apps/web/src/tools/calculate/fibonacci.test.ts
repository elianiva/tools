import { describe, expect, it } from 'vitest'
import { run } from './fibonacci.ts'

describe('fibonacci', () => {
  it('case 1', () => {
    expect(run('10')).toBe('0, 1, 1, 2, 3, 5, 8, 13, 21, 34')
  })
  it('case 2', () => {
    expect(run('1')).toBe('0')
  })
  it('case 3', () => {
    expect(run('100')).toContain('218922995834555169026')
  })
  it('case 4', () => {
    expect(() => run('201')).toThrow('up to 200')
  })
  it('case 5', () => {
    expect(() => run('0')).toThrow('up to 200')
  })
  it('case 6', () => {
    expect(() => run('x')).toThrow('how many terms')
  })
})
