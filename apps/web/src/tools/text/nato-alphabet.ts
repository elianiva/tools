import { attempt, defineLab, ioPanels, layout, tile, wordGroups } from './ui-b.ts'
import { panel } from '../kit.ts'

export const run = (text: string): string => {
  const words = [
    'Alfa',
    'Bravo',
    'Charlie',
    'Delta',
    'Echo',
    'Foxtrot',
    'Golf',
    'Hotel',
    'India',
    'Juliett',
    'Kilo',
    'Lima',
    'Mike',
    'November',
    'Oscar',
    'Papa',
    'Quebec',
    'Romeo',
    'Sierra',
    'Tango',
    'Uniform',
    'Victor',
    'Whiskey',
    'Xray',
    'Yankee',
    'Zulu',
  ]
  const digits = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine']
  return text
    .trim()
    .split(/\s+/u)
    .map((word) =>
      Array.from(word)
        .map((char) => {
          const code = char.toUpperCase().charCodeAt(0)
          if (code >= 65 && code <= 90) return words[code - 65] ?? char
          if (code >= 48 && code <= 57) return digits[code - 48] ?? char
          return char
        })
        .join(' '),
    )
    .join(' / ')
}
export const natoAlphabet = defineLab({
  meta: {
    id: 'nato-alphabet',
    name: 'NATO alphabet',
    category: 'text',
    description: 'Spell text with Alfa, Bravo, Charlie.',
    keywords: ['phonetic', 'spelling', 'radio', 'alfa bravo'],
  },
  example: 'Hi 5',
  view: (ctx) => {
    const { h, model } = ctx
    const result =
      model.input.trim() === '' ? { value: '', error: '' } : attempt(() => run(model.input))
    const groups = model.input
      .trim()
      .split(/\s+/u)
      .filter((word) => word !== '')
      .map((word) =>
        Array.from(word).map((char) => {
          const spoken = run(char)
          return tile(h, {
            top: char.toUpperCase(),
            bottom: spoken,
            state: spoken === char ? 'dim' : 'plain',
          })
        }),
      )
    return layout(
      h,
      [],
      [
        ioPanels(ctx, {
          inputLabel: 'Text',
          outputLabel: 'Spelling',
          placeholder: 'Type or paste text',
          result,
        }),
        groups.length === 0 ? null : panel(h, 'Letters', [wordGroups(h, groups)]),
      ],
    )
  },
})
