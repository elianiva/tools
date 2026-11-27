import {
  chipRowCls,
  column,
  dateCard,
  defineCalc,
  elapsed,
  hero,
  parseIso,
  spoken,
  dayNumber,
  tiles,
  fact,
} from './ui.ts'

export const run = (text: string): string => {
  const found = text.match(/\d{4}-\d{2}-\d{2}/gu) ?? []
  const [first, second] = found.map((value) => {
    const [year = '0', month = '0', day = '0'] = value.split('-')
    return Date.UTC(Number(year), Number(month) - 1, Number(day))
  })
  if (first === undefined || second === undefined)
    throw new Error('Enter two dates like 2024-01-01 2024-03-01.')
  const days = Math.round(Math.abs(second - first) / 86_400_000)
  return [`Days: ${days}`, `Weeks: ${Math.floor(days / 7)} weeks ${days % 7} days`].join('\n')
}

export const dateDifference = defineCalc({
  meta: {
    id: 'date-difference',
    name: 'Date difference',
    category: 'calculate',
    description: 'Days and weeks between two dates.',
    keywords: ['days between', 'date', 'duration', 'weeks', 'countdown'],
  },
  run,
  fields: [
    { label: 'From', value: '2024-01-01', kind: 'date' },
    { label: 'To', value: '2024-03-01', kind: 'date' },
  ],
  view: (h, { values, out }) => {
    const a = parseIso(values[0] ?? '')
    const b = parseIso(values[1] ?? '')
    if (a === null || b === null) return column(h, [])
    const [from, to] = dayNumber(a) <= dayNumber(b) ? [a, b] : [b, a]
    const human = spoken(elapsed(from, to))
    return column(h, [
      hero(h, { label: 'Difference', value: human, sub: `${fact(out, 'Days')} days`, copy: out }),
      h.div([h.Class(chipRowCls)], [dateCard(h, from), dateCard(h, to)]),
      tiles(h, [
        ['Days', fact(out, 'Days')],
        ['Weeks', fact(out, 'Weeks')],
      ]),
    ])
  },
})
