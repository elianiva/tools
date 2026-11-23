import { describe, expect, it } from 'vitest'
import { run } from './caesar-cipher.ts'

describe('caesar-cipher', () => {
  it('case 1', () => {
    expect(run('abc xyz', '3')).toBe('def abc')
  })
  it('case 2', () => {
    expect(run('Hello, World!', '13')).toBe('Uryyb, Jbeyq!')
  })
  it('case 3', () => {
    expect(run('Zz', '1')).toBe('Aa')
  })
  it('case 4', () => {
    expect(run('é1', '5')).toBe('é1')
  })
})
