import { describe, expect, it } from 'vitest'
import { run } from './simple-interest.ts'

describe('simple-interest', () => {
  it('case 1', () => {
    expect(run('1000 5 3')).toBe('Interest: 150.00\nTotal: 1150.00')
  })
  it('case 2', () => {
    expect(run('2500 4.5 2')).toBe('Interest: 225.00\nTotal: 2725.00')
  })
  it('case 3', () => {
    expect(() => run('1000 5')).toThrow('Enter principal')
  })
})
