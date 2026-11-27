/** Page numbers in this file are 1-based, the way a person counts them. */

const NUMBER = /^\d+$/u

const pageOf = (token: string, total: number): number => {
  const page = Number(token)
  if (page < 1 || page > total) throw new Error(`Page ${page} is outside 1–${total}.`)
  return page
}

const rangeOf = (token: string, total: number): ReadonlyArray<number> => {
  if (NUMBER.test(token)) return [pageOf(token, total)]
  const match = /^(\d*)\s*-\s*(\d*)$/u.exec(token)
  if (match === null || (match[1] === '' && match[2] === ''))
    throw new Error(`"${token}" is not a page or a range. Try 1-3, 5, 8-.`)
  const from = match[1] === '' ? 1 : pageOf(match[1] ?? '', total)
  const to = match[2] === '' ? total : pageOf(match[2] ?? '', total)
  const length = Math.abs(to - from) + 1
  const step = to >= from ? 1 : -1
  return Array.from({ length }, (_, index) => from + index * step)
}

/**
 * `1-3, 5, 8-` as page numbers, in the order written. `8-` runs to the last page and a
 * range written backwards (`5-3`) runs backwards. Empty text means every page.
 */
export const parsePages = (text: string, total: number): ReadonlyArray<number> => {
  const tokens = text
    .split(/[,;\s]+/u)
    .map((token) => token.trim())
    .filter((token) => token !== '')
  if (tokens.length === 0) return Array.from({ length: total }, (_, index) => index + 1)
  return tokens.flatMap((token) => rangeOf(token, total))
}

/** `1-3, 4-6` as two groups, one per output file. Empty text is one group of every page. */
export const parseGroups = (text: string, total: number): ReadonlyArray<ReadonlyArray<number>> => {
  const groups = text
    .split(/[,;]+/u)
    .map((group) => group.trim())
    .filter((group) => group !== '')
  return groups.length === 0
    ? [parsePages('', total)]
    : groups.map((group) => parsePages(group, total))
}

/** Page numbers in blocks of `size`: 5 pages by 2 are `[1,2] [3,4] [5]`. */
export const blocksOf = (total: number, size: number): ReadonlyArray<ReadonlyArray<number>> => {
  const step = Math.max(1, Math.floor(size))
  return Array.from({ length: Math.ceil(total / step) }, (_, block) =>
    Array.from(
      { length: Math.min(step, total - block * step) },
      (_, index) => block * step + index + 1,
    ),
  )
}

/** Every page except the listed ones. */
export const withoutPages = (total: number, drop: ReadonlyArray<number>): ReadonlyArray<number> => {
  const dropped = new Set(drop)
  return Array.from({ length: total }, (_, index) => index + 1).filter((page) => !dropped.has(page))
}

/** `report.pdf` with `-part-2` becomes `report-part-2.pdf`. */
export const pdfName = (name: string, suffix: string): string => {
  const base = name.replace(/\.[^.]+$/u, '')
  return `${base}${suffix}.pdf`
}

/** `"3"` or `"-3"` as a count of pages, kept in `[min, max]`. */
export const clampCount = (text: string, min: number, max: number): number => {
  const value = Math.floor(Number(text))
  return Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : min
}

/** A4 and Letter in points, which is what a PDF page is measured in. */
export const PAPER = {
  a4: [595.28, 841.89],
  letter: [612, 792],
} as const

const near = (a: number, b: number): boolean => Math.abs(a - b) < 2

/** `595 × 842 pt (A4)`; the name appears when the page is a known size in either direction. */
export const describeSize = (width: number, height: number): string => {
  const [short, long] = width <= height ? [width, height] : [height, width]
  const known = Object.entries(PAPER).find(
    ([, [paperWidth, paperHeight]]) => near(short, paperWidth) && near(long, paperHeight),
  )
  const name = known === undefined ? '' : ` (${known[0] === 'a4' ? 'A4' : 'Letter'})`
  return `${Math.round(width)} × ${Math.round(height)} pt${name}`
}

/** A PDF date such as `D:20240131120000Z` as `2024-01-31`; anything else comes back as written. */
export const pdfDate = (value: Date | undefined): string =>
  value === undefined || Number.isNaN(value.getTime()) ? '' : value.toISOString().slice(0, 10)
