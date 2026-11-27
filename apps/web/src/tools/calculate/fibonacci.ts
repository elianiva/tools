import { chipCls, chipRowCls, column, defineCalc, hero, num, tiles } from './ui.ts'

export const run = (text: string): string => {
  if (!/^\d+$/u.test(text.trim())) throw new Error('Enter how many terms, such as 10.')
  const count = Number(text.trim())
  if (count < 1 || count > 200) throw new Error('Choose from 1 up to 200 terms.')
  const terms: Array<bigint> = []
  let a = 0n
  let b = 1n
  for (let i = 0; i < count; i += 1) {
    terms.push(a)
    ;[a, b] = [b, a + b]
  }
  return terms.join(', ')
}

export const fibonacci = defineCalc({
  meta: {
    id: 'fibonacci',
    name: 'Fibonacci',
    category: 'calculate',
    description: 'The first n Fibonacci numbers, exactly.',
    keywords: ['fibonacci', 'sequence', 'golden ratio', 'series'],
  },
  run,
  fields: [{ label: 'Terms', value: '10' }],
  view: (h, { values, out }) => {
    const terms = out.split(', ')
    const count = num(values[0])
    const chip = (term: string, on: boolean) =>
      h.span([h.Class(chipCls), ...(on ? [h.Attribute('data-on', '')] : [])], [term])
    const last = terms[terms.length - 1] ?? ''
    const before = terms[terms.length - 2]
    const shown =
      terms.length <= 30
        ? terms.map((term, i) => chip(term, i === terms.length - 1))
        : [
            ...terms.slice(0, 12).map((term) => chip(term, false)),
            h.span([h.Class(chipCls)], ['…']),
            ...terms.slice(-3).map((term, i) => chip(term, i === 2)),
          ]
    const ratio =
      before === undefined || before === '0' ? '—' : (Number(last) / Number(before)).toFixed(6)
    return column(h, [
      hero(h, {
        label: `Term ${count}`,
        value:
          last.length > 18
            ? `${last.slice(0, 1)}.${last.slice(1, 7)} × 10^${last.length - 1}`
            : last,
        copy: out,
      }),
      h.div([h.Class(chipRowCls)], shown),
      tiles(h, [
        ['Ratio of last two', ratio],
        ['Terms', String(terms.length)],
      ]),
    ])
  },
})
