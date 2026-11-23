import { describe, expect, it } from 'vitest'
import { run } from './base32.ts'

describe('base32', () => {
  it('case 1', () => {
    expect(run('foobar', 'encode')).toBe('MZXW6YTBOI======')
  })
  it('case 2', () => {
    expect(run('f', 'encode')).toBe('MY======')
  })
  it('case 3', () => {
    expect(run('fo', 'encode')).toBe('MZXQ====')
  })
  it('case 4', () => {
    expect(run('MZXW6YTBOI======', 'decode')).toBe('foobar')
  })
  it('case 5', () => {
    expect(run('mzxw6ytboi', 'decode')).toBe('foobar')
  })
  it('case 6', () => {
    expect(run('日本', 'encode')).toBe('42L2LZU4VQ======')
  })
  it('case 7', () => {
    expect(() => run('1', 'decode')).toThrow('not valid Base32')
  })
})
