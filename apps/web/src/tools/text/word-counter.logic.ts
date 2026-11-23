export type Stats = Readonly<{
  words: number
  characters: number
  charactersNoSpaces: number
  sentences: number
  paragraphs: number
  lines: number
  uniqueWords: number
  readingSeconds: number
  speakingSeconds: number
}>

export type Keyword = Readonly<{ word: string; count: number; percent: number }>

const STOP_WORDS = new Set(
  `a an and are as at be but by for from has have he her his i if in into is it its of on or our she so that the their them they this to was we were what when which who will with you your`.split(
    ' ',
  ),
)

// Reading speed for alphabetic text, and for scripts with no spaces between words,
// where a word count says little and characters are the better measure.
const WORDS_PER_MINUTE = 238
const CJK_CHARACTERS_PER_MINUTE = 500
const SPEAKING_WORDS_PER_MINUTE = 150
const CJK = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uac00-\ud7af]/gu

const segments = (text: string, granularity: 'word' | 'sentence' | 'grapheme', locale: string) => [
  ...new Intl.Segmenter(locale, { granularity }).segment(text),
]

export const wordsOf = (text: string, locale = 'en'): ReadonlyArray<string> =>
  segments(text, 'word', locale)
    .filter((segment) => segment.isWordLike === true)
    .map((segment) => segment.segment)

export const analyze = (text: string, locale = 'en'): Stats => {
  const words = wordsOf(text, locale)
  const characters = segments(text, 'grapheme', locale).length
  const spaces = segments(text, 'grapheme', locale).filter((g) => /^\s+$/u.test(g.segment)).length
  const cjk = (text.match(CJK) ?? []).length
  const readingMinutes =
    cjk > words.length / 2 ? cjk / CJK_CHARACTERS_PER_MINUTE : words.length / WORDS_PER_MINUTE
  return {
    words: words.length,
    characters,
    charactersNoSpaces: characters - spaces,
    sentences: segments(text, 'sentence', locale).filter((s) => s.segment.trim() !== '').length,
    paragraphs: text.split(/\n\s*\n/u).filter((p) => p.trim() !== '').length,
    lines: text === '' ? 0 : text.split('\n').length,
    uniqueWords: new Set(words.map((word) => word.toLocaleLowerCase(locale))).size,
    readingSeconds: Math.round(readingMinutes * 60),
    speakingSeconds: Math.round((words.length / SPEAKING_WORDS_PER_MINUTE) * 60),
  }
}

/** The most used words of three letters or more, without the common English filler. */
export const keywords = (text: string, limit = 8, locale = 'en'): ReadonlyArray<Keyword> => {
  const words = wordsOf(text, locale)
    .map((word) => word.toLocaleLowerCase(locale))
    .filter((word) => word.length >= 3 && !STOP_WORDS.has(word) && !/^\d+$/u.test(word))
  const counts = new Map<string, number>()
  for (const word of words) counts.set(word, (counts.get(word) ?? 0) + 1)
  return [...counts]
    .toSorted(([a, x], [b, y]) => y - x || a.localeCompare(b))
    .slice(0, limit)
    .map(([word, count]) => ({ word, count, percent: (count / words.length) * 100 }))
}

/** `75` becomes `1 min 15 s`; under a minute it is just seconds. */
export const duration = (seconds: number): string => {
  if (seconds < 60) return `${seconds} s`
  const minutes = Math.floor(seconds / 60)
  const rest = seconds % 60
  return rest === 0 ? `${minutes} min` : `${minutes} min ${rest} s`
}

export const LIMITS = [
  { label: 'X post', limit: 280 },
  { label: 'SMS', limit: 160 },
  { label: 'Meta description', limit: 160 },
  { label: 'Page title', limit: 60 },
] as const
