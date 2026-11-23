import { diffChars, diffLines, diffWords } from 'diff'

export type Part = Readonly<{ kind: 'same' | 'add' | 'remove'; text: string }>

// A last line without a newline would differ from the same line with one, so line mode ends both texts alike.
const terminated = (text: string): string =>
  text === '' || text.endsWith('\n') ? text : `${text}\n`

export const compare = (before: string, after: string, mode: string): ReadonlyArray<Part> => {
  const changes =
    mode === 'chars'
      ? diffChars(before, after)
      : mode === 'words'
        ? diffWords(before, after)
        : diffLines(terminated(before), terminated(after))
  return changes.map((change) => ({
    kind: change.added ? 'add' : change.removed ? 'remove' : 'same',
    text: change.value,
  }))
}

export const countChanges = (
  parts: ReadonlyArray<Part>,
): Readonly<{ added: number; removed: number }> => ({
  added: parts.filter((part) => part.kind === 'add').length,
  removed: parts.filter((part) => part.kind === 'remove').length,
})
