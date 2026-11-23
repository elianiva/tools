import { describe, expect, it } from 'vitest'
import { runLines } from './line-tools.logic.ts'

describe('runLines', () => {
  it('sorts numbers by value, not by digits', () => {
    expect(runLines('item 10\nitem 9\nitem 100', 'sort')).toBe('item 9\nitem 10\nitem 100')
    expect(runLines('b\nc\na', 'sort-desc')).toBe('c\nb\na')
  })

  it('removes duplicates and keeps the first of each', () => {
    expect(runLines('b\na\nb\nc\na', 'dedupe')).toBe('b\na\nc')
  })

  it('drops blank lines, including whitespace-only ones', () => {
    expect(runLines('a\n\n  \nb', 'remove-empty')).toBe('a\nb')
  })

  it('numbers lines with aligned width', () => {
    const text = Array.from({ length: 10 }, (_, i) => `l${i + 1}`).join('\n')
    const lines = runLines(text, 'number').split('\n')
    expect(lines[0]).toBe(' 1  l1')
    expect(lines[9]).toBe('10  l10')
  })
})
