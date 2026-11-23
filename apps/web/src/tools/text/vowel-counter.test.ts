import { describe, expect, it } from 'vitest'
import { run } from './vowel-counter.ts'

describe('vowel-counter', () => {
  it('case 1', () => {
    expect(run('Hello World')).toBe('Vowels: 3\nConsonants: 7\nOther: 1')
  })
  it('case 2', () => {
    expect(run('Crème')).toBe('Vowels: 2\nConsonants: 3\nOther: 0')
  })
  it('case 3', () => {
    expect(run('123!')).toBe('Vowels: 0\nConsonants: 0\nOther: 4')
  })
})
