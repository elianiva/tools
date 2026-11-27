import { describe, expect, it } from 'vitest'
import { removeRepeats, repeatedRuns } from './duplicate-words.logic.ts'

describe('repeatedRuns', () => {
  it('finds each run with its position', () => {
    const runs = repeatedRuns('the the cat sat sat sat down')
    expect(runs.map((run) => [run.word, run.count, run.start, run.end])).toEqual([
      ['the', 2, 0, 7],
      ['sat', 3, 12, 23],
    ])
  })
})

describe('removeRepeats', () => {
  it('keeps one copy of every run', () => {
    expect(removeRepeats('The the cat sat sat sat down')).toBe('The cat sat down')
  })

  it('leaves text without repeats alone', () => {
    expect(removeRepeats('a b a b')).toBe('a b a b')
  })
})
