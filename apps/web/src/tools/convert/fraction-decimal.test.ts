import { describe, expect, it } from 'vitest'
import { run } from './fraction-decimal.ts'

describe('fraction-decimal', () => {
  it('case 1', () => {
    expect(run('3/8', 'to-decimal')).toBe('0.375')
  })
  it('case 2', () => {
    expect(run('1 1/2', 'to-decimal')).toBe('1.5')
  })
  it('case 3', () => {
    expect(run('-1 1/2', 'to-decimal')).toBe('-1.5')
  })
  it('case 4', () => {
    expect(run('1/3', 'to-decimal')).toBe('0.3333333333')
  })
  it('case 5', () => {
    expect(run('0.75', 'to-fraction')).toBe('3/4')
  })
  it('case 6', () => {
    expect(run('2.5', 'to-fraction')).toBe('5/2')
  })
  it('case 7', () => {
    expect(run('-0.125', 'to-fraction')).toBe('-1/8')
  })
  it('case 8', () => {
    expect(run('3', 'to-fraction')).toBe('3')
  })
  it('case 9', () => {
    expect(() => run('1/0', 'to-decimal')).toThrow('zero')
  })
  it('case 10', () => {
    expect(() => run('abc', 'to-fraction')).toThrow('Enter a decimal')
  })
  it('case 11', () => {
    expect(() => run('abc', 'to-decimal')).toThrow('Enter a fraction')
  })
})
