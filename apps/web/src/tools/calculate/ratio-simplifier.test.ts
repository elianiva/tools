import { describe, expect, it } from 'vitest'
import { run } from './ratio-simplifier.ts'

describe('ratio-simplifier', () => {
  it('case 1', () => {
    expect(run('8:12')).toBe('2:3')
  })
  it('case 2', () => {
    expect(run('10 25 15')).toBe('2:5:3')
  })
  it('case 3', () => {
    expect(run('7:13')).toBe('7:13')
  })
  it('case 4', () => {
    expect(run('0:5')).toBe('0:1')
  })
  it('case 5', () => {
    expect(() => run('5')).toThrow('two or more')
  })
  it('case 6', () => {
    expect(() => run('0:0')).toThrow('two or more')
  })
})
