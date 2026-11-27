import { panel, stack, columns, hint, stats } from '../kit.ts'
import { attempt, defineTextTool, marked, sourcePanel, type Piece } from './ui.ts'

export const run = (text: string): string => {
  let vowels = 0
  let consonants = 0
  let other = 0
  for (const char of Array.from(text.normalize('NFD').replaceAll(/\p{M}/gu, ''))) {
    if (/[aeiou]/iu.test(char)) vowels += 1
    else if (/\p{L}/u.test(char)) consonants += 1
    else other += 1
  }
  return `Vowels: ${vowels}\nConsonants: ${consonants}\nOther: ${other}`
}

const kindOf = (char: string): 'vowel' | 'consonant' | 'other' => {
  const base = char.normalize('NFD').replaceAll(/\p{M}/gu, '')
  return /[aeiou]/iu.test(base) ? 'vowel' : /\p{L}/u.test(base) ? 'consonant' : 'other'
}

/** The text with vowels marked; consonants stay plain and everything else fades. */
const pieces = (text: string): ReadonlyArray<Piece> =>
  Array.from(text.slice(0, 4000), (char): Piece => {
    const kind = kindOf(char)
    return kind === 'vowel'
      ? { text: char, kind: 'hit' }
      : kind === 'other'
        ? { text: char, kind: 'dim' }
        : { text: char }
  })

const share = (part: number, whole: number): string =>
  whole === 0 ? '0%' : `${Math.round((part / whole) * 100)}%`

export const vowelCounter = defineTextTool({
  meta: {
    id: 'vowel-counter',
    name: 'Vowel counter',
    category: 'text',
    description: 'Count vowels, consonants, and other characters.',
    keywords: ['vowels', 'consonants', 'letters', 'count', 'aeiou'],
  },
  example: 'Hello World',
  files: true,
  render: (c) => {
    const { h } = c
    const result = attempt(() => run(c.input))
    const [vowels = 0, consonants = 0, other = 0] = result.value
      .split('\n')
      .map((line) => Number(line.split(': ')[1]))
    const total = vowels + consonants + other
    return h.div(
      [h.Class(stack)],
      [
        columns(h, [
          sourcePanel(c),
          panel(h, 'Highlighted', [
            c.input === ''
              ? hint(h, 'Paste text to count.')
              : marked(h, 'Text with vowels highlighted', pieces(c.input)),
          ]),
        ]),
        stats(h, [
          ['Vowels', `${vowels} · ${share(vowels, total)}`],
          ['Consonants', `${consonants} · ${share(consonants, total)}`],
          ['Other', `${other} · ${share(other, total)}`],
        ]),
      ],
    )
  },
})
