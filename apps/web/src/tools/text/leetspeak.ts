import { panel } from '../kit.ts'
import { defineLab, gallery, inputPanel, layout, tile, tileStrip } from './ui-b.ts'

export const run = (text: string, mode: string): string => {
  const basic: Readonly<Record<string, string>> = { a: '4', e: '3', i: '1', o: '0' }
  const heavy: Readonly<Record<string, string>> = { ...basic, s: '5', t: '7', b: '8', g: '9' }
  const table = mode === 'heavy' ? heavy : basic
  return Array.from(text, (char) => table[char.toLowerCase()] ?? char).join('')
}
const LETTERS = ['a', 'e', 'i', 'o', 's', 't', 'b', 'g']

export const leetspeak = defineLab({
  meta: {
    id: 'leetspeak',
    name: 'Leetspeak',
    category: 'text',
    description: 'Write text in 1337 speak.',
    keywords: ['leet', '1337', 'hacker', 'l33t'],
  },
  example: 'leet speak',
  view: (ctx) => {
    const { h, model } = ctx
    const empty = model.input === ''
    const source = empty ? ctx.example : model.input
    const lower = model.input.toLowerCase()
    return layout(
      h,
      [],
      [
        inputPanel(ctx, { label: 'Text', placeholder: 'Type or paste text', rows: 4 }),
        gallery(
          h,
          [
            { label: 'Basic', text: run(source, 'basic') },
            { label: 'Heavy', text: run(source, 'heavy') },
          ],
          empty,
        ),
        panel(h, 'Substitutions', [
          tileStrip(
            h,
            LETTERS.map((letter) =>
              tile(h, {
                top: letter,
                join: '↓',
                bottom: run(letter, 'heavy'),
                state: lower.includes(letter) ? 'on' : 'plain',
              }),
            ),
          ),
        ]),
      ],
    )
  },
})
