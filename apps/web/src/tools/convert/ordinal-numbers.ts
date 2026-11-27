import { textArea } from '../kit.ts'
import { card, cells, defineForm, hero, page, split } from './ui.ts'

export const run = (text: string): string => {
  return text.replaceAll(/(?<![\d.])\d+(?!\d|\.\d)/gu, (digits) => {
    const lastTwo = Number(digits.slice(-2))
    const last = lastTwo % 10
    const suffix =
      lastTwo >= 11 && lastTwo <= 13
        ? 'th'
        : last === 1
          ? 'st'
          : last === 2
            ? 'nd'
            : last === 3
              ? 'rd'
              : 'th'
    return `${digits}${suffix}`
  })
}

export const ordinalNumbers = defineForm({
  meta: {
    id: 'ordinal-numbers',
    name: 'Ordinal numbers',
    category: 'convert',
    description: 'Write 1 as 1st, 2 as 2nd, and so on.',
    keywords: ['ordinal', '1st', '2nd', '3rd', 'suffix', 'rank'],
    accepts: ['text/*', '.txt', '.json', '.md'],
  },
  init: { text: '1 2 3 4 11 12 13 21 22 101 111 112' },
  view: (form, h) => {
    const out = run(form.get('text'))
    const tokens = out.match(/\b\d+(?:st|nd|rd|th)\b/gu) ?? []
    return page(h, [
      split(h, [
        card(h, null, [
          textArea(h, { id: 'text', value: form.get('text'), rows: 5, onInput: form.set('text') }),
        ]),
        hero(h, 'Result', out),
      ]),
      tokens.length === 0
        ? null
        : card(h, null, [
            cells(
              h,
              tokens.slice(0, 60).map((token) => ['', token] as const),
            ),
          ]),
    ])
  },
})
