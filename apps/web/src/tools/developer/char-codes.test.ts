import { describe, expect, it } from 'vitest'
import { run } from './char-codes.ts'

describe('char-codes', () => {
  it('case 1', () => {
    expect(run('Hi€', 'to-codes')).toBe('72 105 8364')
  })
  it('case 2', () => {
    expect(run('72 105 0x20AC U+1F600', 'from-codes')).toBe('Hi€😀')
  })
  it('case 3', () => {
    expect(run('65, 66', 'from-codes')).toBe('AB')
  })
  it('case 4', () => {
    expect(() => run('abc', 'from-codes')).toThrow('not a code point')
  })
  it('case 5', () => {
    expect(() => run('1114112', 'from-codes')).toThrow('not a code point')
  })
})
