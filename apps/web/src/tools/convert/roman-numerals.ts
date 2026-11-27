import { card, defineForm, errorText, linked, page, rows } from './ui.ts'

export const run = (text: string, mode: string): string => {
  const table: ReadonlyArray<readonly [number, string]> = [
    [1000, 'M'],
    [900, 'CM'],
    [500, 'D'],
    [400, 'CD'],
    [100, 'C'],
    [90, 'XC'],
    [50, 'L'],
    [40, 'XL'],
    [10, 'X'],
    [9, 'IX'],
    [5, 'V'],
    [4, 'IV'],
    [1, 'I'],
  ]
  const input = text.trim()
  if (mode === 'to-roman') {
    if (!/^\d+$/u.test(input)) throw new Error('Enter a whole number from 1 to 3999.')
    let value = Number(input)
    if (value < 1 || value > 3999) throw new Error('Roman numerals here run from 1 to 3999.')
    let out = ''
    for (const [size, symbol] of table) {
      while (value >= size) {
        out += symbol
        value -= size
      }
    }
    return out
  }
  const upper = input.toUpperCase()
  if (!/^M{0,3}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/u.test(upper) || upper === '') {
    throw new Error('This is not a valid Roman numeral.')
  }
  let rest = upper
  let total = 0
  for (const [size, symbol] of table) {
    while (rest.startsWith(symbol)) {
      total += size
      rest = rest.slice(symbol.length)
    }
  }
  return String(total)
}

const PARTS: Readonly<Record<string, number>> = {
  M: 1000,
  CM: 900,
  D: 500,
  CD: 400,
  C: 100,
  XC: 90,
  L: 50,
  XL: 40,
  X: 10,
  IX: 9,
  V: 5,
  IV: 4,
  I: 1,
}

export const romanNumerals = defineForm({
  meta: {
    id: 'roman-numerals',
    name: 'Roman numerals',
    category: 'convert',
    description: 'Convert numbers to Roman numerals and back.',
    keywords: ['roman', 'numeral', 'mcm', 'latin'],
  },
  init: { src: 'number', text: '1994' },
  view: (form, h) => {
    const pair = linked(
      h,
      form,
      [
        { key: 'number', label: 'Number' },
        { key: 'roman', label: 'Roman' },
      ],
      (src, text) =>
        src === 'number' ? { roman: run(text, 'to-roman') } : { number: run(text, 'from-roman') },
    )
    const roman =
      form.get('src') === 'roman' ? form.get('text').toUpperCase() : pair.values['roman']
    const parts = pair.error === '' ? (roman?.match(/CM|CD|XC|XL|IX|IV|[MDCLXVI]/gu) ?? []) : []
    return page(h, [
      card(h, null, [pair.fields, errorText(h, pair.error)]),
      parts.length === 0
        ? null
        : card(h, 'Breakdown', [
            rows(
              h,
              parts.map((part) => [part, String(PARTS[part] ?? 0)] as const),
            ),
          ]),
    ])
  },
})
