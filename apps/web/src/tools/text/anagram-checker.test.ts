import { describe, expect, it } from 'vitest'
import { run } from './anagram-checker.ts'

describe('anagram-checker', () => {
  it('case 1', () => {
    expect(run('listen\nsilent')).toBe('Yes, they are anagrams.')
  })
  it('case 2', () => {
    expect(run('Dormitory\ndirty room')).toBe('Yes, they are anagrams.')
  })
  it('case 3', () => {
    expect(run('abc\nabd')).toBe('No, they are not anagrams.')
  })
  it('case 4', () => {
    expect(run('aab\nab')).toBe('No, they are not anagrams.')
  })
  it('case 5', () => {
    expect(() => run('one line')).toThrow('Enter two lines')
  })
})
