export type Found = Readonly<{
  index: number
  text: string
  groups: ReadonlyArray<string | undefined>
}>

export type Run = Readonly<{ matches: ReadonlyArray<Found>; error: string; truncated: boolean }>

const MAX_MATCHES = 500

export const runRegex = (pattern: string, flags: string, text: string): Run => {
  if (pattern === '') return { matches: [], error: '', truncated: false }
  let regex: RegExp
  try {
    regex = new RegExp(pattern, flags.includes('g') ? flags : `${flags}g`)
  } catch (error) {
    return {
      matches: [],
      error:
        error instanceof Error
          ? error.message.replace(/^Invalid regular expression: /u, '')
          : 'Invalid pattern',
      truncated: false,
    }
  }
  const matches: Array<Found> = []
  // `matchAll` steps past an empty match, so a pattern like `a*` cannot loop forever.
  for (const match of text.matchAll(regex)) {
    if (matches.length === MAX_MATCHES) return { matches, error: '', truncated: true }
    matches.push({ index: match.index, text: match[0], groups: match.slice(1) })
  }
  return { matches, error: '', truncated: false }
}

export type Slice = Readonly<{ text: string; hit: boolean }>

/** The text cut into plain and matched runs, for highlighting. Empty matches show nothing. */
export const slices = (text: string, matches: ReadonlyArray<Found>): ReadonlyArray<Slice> => {
  const out: Array<Slice> = []
  let cursor = 0
  for (const match of matches) {
    if (match.text === '') continue
    if (match.index > cursor) out.push({ text: text.slice(cursor, match.index), hit: false })
    out.push({ text: match.text, hit: true })
    cursor = match.index + match.text.length
  }
  if (cursor < text.length) out.push({ text: text.slice(cursor), hit: false })
  return out
}
