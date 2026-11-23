import { describe, expect, it } from 'vitest'
import { run } from './cipher.ts'

describe('cipher', () => {
  it('case 1', () => {
    expect(run('Hello', 'rot13')).toBe('Uryyb')
  })
  it('case 2', () => {
    expect(run('Uryyb', 'rot13')).toBe('Hello')
  })
  it('case 3', () => {
    expect(run('abc XYZ', 'atbash')).toBe('zyx CBA')
  })
  it('case 4', () => {
    expect(run('Hello', 'rot47')).toBe('w6==@')
  })
  it('case 5', () => {
    expect(run('a é1', 'rot13')).toBe('n é1')
  })
})
