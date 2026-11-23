import { describe, expect, it } from 'vitest'
import { run } from './binary-text.ts'

describe('binary-text', () => {
  it('case 1', () => {
    expect(run('Hi', 'to-binary')).toBe('01001000 01101001')
  })
  it('case 2', () => {
    expect(run('é', 'to-binary')).toBe('11000011 10101001')
  })
  it('case 3', () => {
    expect(run('01001000 01101001', 'from-binary')).toBe('Hi')
  })
  it('case 4', () => {
    expect(run('0100100001101001', 'from-binary')).toBe('Hi')
  })
  it('case 5', () => {
    expect(() => run('102', 'from-binary')).toThrow('eight')
  })
  it('case 6', () => {
    expect(() => run('11111111', 'from-binary')).toThrow('UTF-8')
  })
})
