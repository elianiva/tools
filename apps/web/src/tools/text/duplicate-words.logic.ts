export type Repeat = Readonly<{
  /** Where the first copy starts, where it ends, and where the last copy ends. */
  start: number
  keepEnd: number
  end: number
  word: string
  /** How many times the word stands in a row. */
  count: number
}>

/** Words typed more than once in a row, ignoring case. */
export const repeatedRuns = (text: string): ReadonlyArray<Repeat> => {
  const words = [...new Intl.Segmenter(undefined, { granularity: 'word' }).segment(text)].filter(
    (part) => part.isWordLike === true,
  )
  const found: Array<Repeat> = []
  let first = 0
  for (let i = 1; i <= words.length; i += 1) {
    const a = words[first]
    const b = words[i]
    if (a !== undefined && b !== undefined && a.segment.toLowerCase() === b.segment.toLowerCase())
      continue
    const last = words[i - 1]
    if (i - first > 1 && a !== undefined && last !== undefined) {
      found.push({
        start: a.index,
        keepEnd: a.index + a.segment.length,
        end: last.index + last.segment.length,
        word: a.segment.toLowerCase(),
        count: i - first,
      })
    }
    first = i
  }
  return found
}

/** The text with every repeat cut down to one copy. */
export const removeRepeats = (text: string): string =>
  repeatedRuns(text).reduceRight(
    (result, run) => result.slice(0, run.keepEnd) + result.slice(run.end),
    text,
  )
