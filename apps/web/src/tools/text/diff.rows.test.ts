import { describe, expect, it } from 'vitest'
import { compare } from './diff.logic.ts'
import { lineRows } from './diff.rows.ts'

describe('lineRows', () => {
  it('puts a replaced line beside its replacement and numbers each side', () => {
    const rows = lineRows(compare('a\nb\nc', 'a\nB\nc\nd', 'lines'))
    expect(rows.map((row) => [row.left?.n, row.left?.text, row.right?.n, row.right?.text])).toEqual(
      [
        [1, 'a', 1, 'a'],
        [2, 'b', 2, 'B'],
        [3, 'c', 3, 'c'],
        [undefined, undefined, 4, 'd'],
      ],
    )
  })

  it('keeps removed lines with no replacement on the left only', () => {
    const rows = lineRows(compare('a\nb', 'a', 'lines'))
    expect(rows[1]?.left?.kind).toBe('remove')
    expect(rows[1]?.right).toBeNull()
  })
})
