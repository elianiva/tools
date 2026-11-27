import { panel } from '../kit.ts'
import { banner, defineLab, layout, pairOf, pairPanel, tile, tileStrip } from './ui-b.ts'

export const run = (text: string): string => {
  const lines = text.split('\n').map((line) => line.replace(/\r$/u, ''))
  const [first, second] = lines
  if (lines.length !== 2 || first === undefined || second === undefined)
    throw new Error('Enter two lines to compare.')
  const letters = (value: string): string =>
    Array.from(value.normalize('NFD').replaceAll(/\p{M}/gu, '').toLowerCase())
      .filter((char) => /[\p{L}\p{N}]/u.test(char))
      .toSorted()
      .join('')
  return letters(first) === letters(second)
    ? 'Yes, they are anagrams.'
    : 'No, they are not anagrams.'
}
const lettersOf = (value: string): ReadonlyArray<string> =>
  Array.from(value.normalize('NFD').replaceAll(/\p{M}/gu, '').toLowerCase()).filter((char) =>
    /[\p{L}\p{N}]/u.test(char),
  )

const counts = (letters: ReadonlyArray<string>): Map<string, number> => {
  const map = new Map<string, number>()
  for (const letter of letters) map.set(letter, (map.get(letter) ?? 0) + 1)
  return map
}

export const anagramChecker = defineLab({
  meta: {
    id: 'anagram-checker',
    name: 'Anagram checker',
    category: 'text',
    description: 'Check if two lines use exactly the same letters.',
    keywords: ['anagram', 'letters', 'word game', 'scrabble', 'compare'],
  },
  example: 'listen\nsilent',
  view: (ctx) => {
    const { h, model } = ctx
    const [first, second] = pairOf(model.input)
    const left = counts(lettersOf(first))
    const right = counts(lettersOf(second))
    const all = [...new Set([...left.keys(), ...right.keys()])].toSorted()
    const differing = all.filter((letter) => left.get(letter) !== right.get(letter))
    const yes = run(`${first}\n${second}`).startsWith('Yes')
    return layout(
      h,
      [],
      [
        pairPanel(ctx, {
          labels: ['First text', 'Second text'],
          placeholders: ['listen', 'silent'],
        }),
        all.length === 0
          ? null
          : banner(h, {
              yes,
              title: yes ? 'Anagrams' : 'Not anagrams',
              detail: yes
                ? `Both use the same ${lettersOf(first).length} letters.`
                : `Different counts: ${differing.join(', ')}`,
            }),
        all.length === 0
          ? null
          : panel(h, 'Letter counts', [
              tileStrip(
                h,
                all.map((letter) =>
                  tile(h, {
                    top: letter,
                    bottom: `${left.get(letter) ?? 0} · ${right.get(letter) ?? 0}`,
                    state: differing.includes(letter) ? 'diff' : 'same',
                  }),
                ),
              ),
            ]),
      ],
    )
  },
})
