import { describe, expect, it } from 'vitest'
import { run } from './duplicate-words.ts'

describe('duplicate-words', () => {
  it('case 1', () => {
    expect(run('the the cat sat sat down')).toBe('the: words 1-2\nsat: words 4-5')
  })
  it('case 2', () => {
    expect(run('go go go now')).toBe('go: words 1-3')
  })
  it('case 3', () => {
    expect(run('The the end')).toBe('the: words 1-2')
  })
  it('case 4', () => {
    expect(run('a b a b')).toBe('No repeated words.')
  })
  it('case 5', () => {
    expect(run('the cat the dog')).toBe('No repeated words.')
  })
})
