import { describe, expect, it } from 'vitest'
import { run } from './cagr.ts'

describe('cagr', () => {
  it('case 1', () => {
    expect(run('1000 2000 5')).toBe('CAGR: 14.87%')
  })
  it('case 2', () => {
    expect(run('100 100 3')).toBe('CAGR: 0.00%')
  })
  it('case 3', () => {
    expect(run('100 50 2')).toBe('CAGR: -29.29%')
  })
  it('case 4', () => {
    expect(() => run('0 10 2')).toThrow('Enter a start value')
  })
})
