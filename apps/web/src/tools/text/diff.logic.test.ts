import { describe, expect, it } from 'vitest'
import { compare, countChanges } from './diff.logic.ts'

describe('compare', () => {
  it('marks a changed line as removed then added', () => {
    const parts = compare('a\nb\nc\n', 'a\nB\nc\n', 'lines')
    expect(parts.map((p) => [p.kind, p.text])).toEqual([
      ['same', 'a\n'],
      ['remove', 'b\n'],
      ['add', 'B\n'],
      ['same', 'c\n'],
    ])
  })

  it('does not report the last line as changed when only one side ends with a newline', () => {
    const parts = compare('one\ntwo\nthree', 'one\n2\nthree\nfour', 'lines')
    expect(parts.filter((p) => p.kind === 'same').map((p) => p.text)).toEqual(['one\n', 'three\n'])
    expect(countChanges(parts)).toEqual({ added: 2, removed: 1 })
  })

  it('finds a single changed word', () => {
    const parts = compare('the quick fox', 'the slow fox', 'words')
    expect(parts.filter((p) => p.kind !== 'same').map((p) => [p.kind, p.text.trim()])).toEqual([
      ['remove', 'quick'],
      ['add', 'slow'],
    ])
  })

  it('shows no change for equal text', () => {
    expect(countChanges(compare('same', 'same', 'chars'))).toEqual({ added: 0, removed: 0 })
  })
})
