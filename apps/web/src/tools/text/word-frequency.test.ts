import { describe, expect, it } from 'vitest'
import { run } from './word-frequency.ts'

describe('word-frequency', () => {
  it('case 1', () => {
    expect(run('the cat the dog')).toBe('the  2\ncat  1\ndog  1')
  })
  it('case 2', () => {
    expect(run('Hi, hi! HI')).toBe('hi  3')
  })
  it('case 3', () => {
    expect(() => run('...')).toThrow('No words')
  })
})
