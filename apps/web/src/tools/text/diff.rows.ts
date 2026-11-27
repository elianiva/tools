import type { Part } from './diff.logic.ts'

export type Cell = Readonly<{ n: number; text: string; kind: 'same' | 'add' | 'remove' }>
export type Row = Readonly<{ left: Cell | null; right: Cell | null }>

const linesOf = (text: string): ReadonlyArray<string> => {
  const lines = text.split('\n')
  if (lines.at(-1) === '') lines.pop()
  return lines
}

/** Line diff parts as rows for two columns: a removed line sits beside the added line that replaces it. */
export const lineRows = (parts: ReadonlyArray<Part>): ReadonlyArray<Row> => {
  const rows: Array<Row> = []
  let left = 0
  let right = 0
  let removed: Array<string> = []
  const flush = (): void => {
    for (const text of removed) {
      left += 1
      rows.push({ left: { n: left, text, kind: 'remove' }, right: null })
    }
    removed = []
  }
  for (const part of parts) {
    const lines = linesOf(part.text)
    if (part.kind === 'remove') {
      removed.push(...lines)
    } else if (part.kind === 'add') {
      for (const text of lines) {
        right += 1
        const gone = removed.shift()
        if (gone === undefined) {
          rows.push({ left: null, right: { n: right, text, kind: 'add' } })
        } else {
          left += 1
          rows.push({
            left: { n: left, text: gone, kind: 'remove' },
            right: { n: right, text, kind: 'add' },
          })
        }
      }
      flush()
    } else {
      flush()
      for (const text of lines) {
        left += 1
        right += 1
        rows.push({
          left: { n: left, text, kind: 'same' },
          right: { n: right, text, kind: 'same' },
        })
      }
    }
  }
  flush()
  return rows
}
