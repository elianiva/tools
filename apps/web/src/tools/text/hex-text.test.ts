import { describe, expect, it } from 'vitest'
import { run } from './hex-text.ts'

describe('hex-text', () => {
  it('case 1', () => {
    expect(run('Hi', 'to-hex')).toBe('48 69')
  })
  it('case 2', () => {
    expect(run('€', 'to-hex')).toBe('e2 82 ac')
  })
  it('case 3', () => {
    expect(run('4869', 'from-hex')).toBe('Hi')
  })
  it('case 4', () => {
    expect(run('0x48, 0x69', 'from-hex')).toBe('Hi')
  })
  it('case 5', () => {
    expect(() => run('486', 'from-hex')).toThrow('pairs')
  })
})
