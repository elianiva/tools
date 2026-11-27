import { panel } from '../kit.ts'
import { defineLab, ioPanels, layout, tile, tileStrip } from './ui-b.ts'

export const run = (text: string): string => {
  return text.replaceAll(/[A-Za-z]+/gu, (word) => {
    const lower = word.toLowerCase()
    const vowel = lower.search(/[aeiou]/u)
    const out =
      vowel === 0
        ? `${lower}way`
        : vowel === -1
          ? `${lower}ay`
          : `${lower.slice(vowel)}${lower.slice(0, vowel)}ay`
    return word.charAt(0) === word.charAt(0).toLowerCase()
      ? out
      : out.charAt(0).toUpperCase() + out.slice(1)
  })
}
export const pigLatin = defineLab({
  meta: {
    id: 'pig-latin',
    name: 'Pig Latin',
    category: 'text',
    description: 'Translate English into Pig Latin.',
    keywords: ['pig latin', 'game', 'translate', 'fun'],
  },
  example: 'hello world',
  view: (ctx) => {
    const { h, model } = ctx
    const words = model.input
      .split(/\s+/u)
      .filter((word) => /[A-Za-z]/u.test(word))
      .slice(0, 80)
    return layout(
      h,
      [],
      [
        ioPanels(ctx, {
          inputLabel: 'English',
          outputLabel: 'Pig Latin',
          placeholder: 'Type or paste text',
          rows: 6,
          result: { value: run(model.input), error: '' },
        }),
        words.length === 0
          ? null
          : panel(h, 'Words', [
              tileStrip(
                h,
                words.map((word) => tile(h, { top: word, join: '↓', bottom: run(word) })),
              ),
            ]),
      ],
    )
  },
})
