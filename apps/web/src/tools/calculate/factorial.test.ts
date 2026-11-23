import { describe, expect, it } from 'vitest'
import { run } from './factorial.ts'

describe('factorial', () => {
  it('case 1', () => {
    expect(run('0')).toBe('1')
  })
  it('case 2', () => {
    expect(run('5')).toBe('120')
  })
  it('case 3', () => {
    expect(run('20')).toBe('2432902008176640000')
  })
  it('case 4', () => {
    expect(run('25')).toBe('15511210043330985984000000')
  })
  it('case 5', () => {
    expect(() => run('1001')).toThrow('up to 1000')
  })
  it('case 6', () => {
    expect(() => run('x')).toThrow('whole number')
  })
})
