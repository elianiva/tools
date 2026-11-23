import { describe, expect, it } from 'vitest'
import { run } from './sort-words.ts'

describe('sort-words', () => {
  it('case 1', () => {
    expect(run('pear apple fig', 'asc')).toBe('apple fig pear')
  })
  it('case 2', () => {
    expect(run('pear apple fig', 'desc')).toBe('pear fig apple')
  })
  it('case 3', () => {
    expect(run('pear apple fig', 'length')).toBe('fig pear apple')
  })
  it('case 4', () => {
    expect(run('a b a c b', 'unique')).toBe('a b c')
  })
})
