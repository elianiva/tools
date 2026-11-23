import { describe, expect, it } from 'vitest'
import { run } from './text-wrap.ts'

describe('text-wrap', () => {
  it('case 1', () => {
    expect(run('the quick brown fox jumps', '10')).toBe('the quick\nbrown fox\njumps')
  })
  it('case 2', () => {
    expect(run('abcdefghijkl x', '10')).toBe('abcdefghijkl\nx')
  })
  it('case 3', () => {
    expect(run('a b\n\nc d', '80')).toBe('a b\n\nc d')
  })
  it('case 4', () => {
    expect(run('one two three four five six seven eight nine ten eleven', '40')).toBe(
      'one two three four five six seven eight\nnine ten eleven',
    )
  })
})
