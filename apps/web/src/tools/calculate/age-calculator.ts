import {
  chipRowCls,
  column,
  dateCard,
  daysIn,
  defineCalc,
  dayNumber,
  elapsed,
  hero,
  parseIso,
  spoken,
  tiles,
  WEEKDAYS,
  utc,
  type Ymd,
} from './ui.ts'

export const run = (text: string): string => {
  const found = [...text.matchAll(/(\d{4})-(\d{2})-(\d{2})/gu)].map(
    (match) => [Number(match[1]), Number(match[2]), Number(match[3])] as const,
  )
  const [birth, end] = found
  if (birth === undefined || end === undefined)
    throw new Error('Enter a birth date and an as-of date, such as 1990-08-15 2024-08-14.')
  if (end[0] * 10_000 + end[1] * 100 + end[2] < birth[0] * 10_000 + birth[1] * 100 + birth[2])
    throw new Error('The second date is before the birth date.')
  let years = end[0] - birth[0]
  let months = end[1] - birth[1]
  let days = end[2] - birth[2]
  let year = end[0]
  let month = end[1]
  while (days < 0) {
    month -= 1
    if (month === 0) {
      month = 12
      year -= 1
    }
    days += new Date(Date.UTC(year, month, 0)).getUTCDate()
    months -= 1
  }
  if (months < 0) {
    years -= 1
    months += 12
  }
  return `Age: ${years} years, ${months} months, ${days} days`
}

export const ageCalculator = defineCalc({
  meta: {
    id: 'age-calculator',
    name: 'Age calculator',
    category: 'calculate',
    description: 'Exact age in years, months, and days between a birth date and another date.',
    keywords: ['age', 'birthday', 'years', 'months', 'days', 'birth date'],
  },
  run,
  fields: [
    { label: 'Born', value: '1990-08-15', kind: 'date' },
    { label: 'On this day', value: '2024-08-14', kind: 'date' },
  ],
  view: (h, { values, out }) => {
    const birth = parseIso(values[0] ?? '')
    const end = parseIso(values[1] ?? '')
    if (birth === null || end === null) return column(h, [])
    const span = elapsed(birth, end)
    const birthday = (year: number): Ymd => [
      year,
      birth[1],
      Math.min(birth[2], daysIn(year, birth[1] - 1)),
    ]
    const upcoming =
      dayNumber(birthday(end[0])) >= dayNumber(end) ? birthday(end[0]) : birthday(end[0] + 1)
    const until = dayNumber(upcoming) - dayNumber(end)
    return column(h, [
      hero(h, { label: 'Age', value: spoken(span), copy: out }),
      h.div([h.Class(chipRowCls)], [dateCard(h, birth, 'Born'), dateCard(h, end, 'On')]),
      tiles(h, [
        ['Total months', String(span.years * 12 + span.months)],
        ['Total days', String(dayNumber(end) - dayNumber(birth))],
        ['Born on a', WEEKDAYS[utc(birth[0], birth[1] - 1, birth[2]).getUTCDay()] ?? ''],
        ['Next birthday', until === 0 ? 'Today' : `in ${until} days`],
      ]),
    ])
  },
})
