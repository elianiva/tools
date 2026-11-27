import {
  chipRowCls,
  column,
  dateCard,
  defineCalc,
  hero,
  monthGrid,
  parseIso,
  tiles,
  card,
} from './ui.ts'

export const run = (text: string): string => {
  const match = /(\d{4})-(\d{2})-(\d{2})/u.exec(text)
  if (match === null) throw new Error('Enter a date like 2024-02-29.')
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(Date.UTC(year, month - 1, day))
  if (date.getUTCMonth() !== month - 1) throw new Error('That date does not exist.')
  const name = date.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' })
  const dayOfYear = Math.round((date.getTime() - Date.UTC(year, 0, 0)) / 86_400_000)
  return `${name}, day ${dayOfYear} of ${year}`
}

export const weekday = defineCalc({
  meta: {
    id: 'weekday',
    name: 'Weekday finder',
    category: 'calculate',
    description: 'The weekday and day of the year for any date.',
    keywords: ['day of week', 'date', 'calendar', 'day of year'],
  },
  run,
  fields: [{ label: 'Date', value: '2024-02-29', kind: 'date' }],
  view: (h, { values, out }) => {
    const date = parseIso(values[0] ?? '')
    if (date === null) return column(h, [])
    const name = out.split(',')[0] ?? ''
    const dayOfYear = /day (\d+)/u.exec(out)?.[1] ?? ''
    return column(h, [
      hero(h, { label: 'Weekday', value: name, copy: out }),
      h.div([h.Class(chipRowCls)], [dateCard(h, date)]),
      tiles(h, [['Day of year', dayOfYear]]),
      card(h, 'Calendar', [monthGrid(h, { year: date[0], month0: date[1] - 1, marked: date[2] })]),
    ])
  },
})
