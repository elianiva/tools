import { describe, expect, it } from 'vitest'
import { run } from './rule-of-72.ts'

describe('rule-of-72', () => {
  it('case 1', () => {
    expect(run('8')).toBe('Rule of 72: 9.00 years\nExact: 9.01 years')
  })
  it('case 2', () => {
    expect(run('6')).toBe('Rule of 72: 12.00 years\nExact: 11.90 years')
  })
  it('case 3', () => {
    expect(() => run('0')).toThrow('above zero')
  })
})
