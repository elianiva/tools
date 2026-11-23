import { describe, expect, it } from 'vitest'
import { run } from './readability.ts'

describe('readability', () => {
  it('case 1', () => {
    expect(run('The quick brown fox jumps over the lazy dog.')).toContain('Words: 9')
  })
  it('case 2', () => {
    expect(run('The quick brown fox jumps over the lazy dog.')).toContain('Syllables: 11')
  })
  it('case 3', () => {
    expect(run('The quick brown fox jumps over the lazy dog.')).toContain(
      'Flesch reading ease: 94.3 (Very easy)',
    )
  })
  it('case 4', () => {
    expect(run('The quick brown fox jumps over the lazy dog.')).toContain('Grade level: 2.3')
  })
  it('case 5', () => {
    expect(() => run('123')).toThrow('English text')
  })
})
