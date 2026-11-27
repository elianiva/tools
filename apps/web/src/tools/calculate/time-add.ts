import { bars, card, column, defineRows, fmt, hero, tiles } from './ui.ts'

export const run = (text: string, mode: string): string => {
  const times = [...text.matchAll(/(\d+):(\d{2})/gu)].map(
    (match) => [Number(match[1]), Number(match[2])] as const,
  )
  if (times.length < 2) throw new Error('Enter two or more times such as 1:30 2:45.')
  if (times.some(([, minutes]) => minutes > 59))
    throw new Error('Minutes must be 00 to 59, written as h:mm.')
  const values = times.map(([hours, minutes]) => hours * 60 + minutes)
  const [first = 0, ...others] = values
  const total =
    mode === 'subtract'
      ? others.reduce((sum, value) => sum - value, first)
      : values.reduce((sum, value) => sum + value, 0)
  const size = Math.abs(total)
  return `${total < 0 ? '-' : ''}${Math.floor(size / 60)}:${String(size % 60).padStart(2, '0')}`
}

export const timeAdd = defineRows({
  meta: {
    id: 'time-add',
    name: 'Time adder',
    category: 'calculate',
    description: 'Add or subtract times written as h:mm.',
    keywords: ['add time', 'subtract time', 'hours', 'minutes', 'duration', 'timesheet'],
  },
  run,
  columns: [{ label: 'Time', kind: 'text', placeholder: 'h:mm', suffix: 'h:mm' }],
  rows: [['1:30'], ['2:45']],
  addLabel: 'Add time',
  modes: [
    { id: 'add', label: 'Add' },
    { id: 'subtract', label: 'Subtract' },
  ],
  compose: (rows) => rows.map(([time = '']) => time).join(' '),
  view: (h, { rows, out }) => {
    const [, sign = '', hours = '0', minutes = '0'] = /^(-?)(\d+):(\d{2})$/u.exec(out) ?? []
    const total = Number(hours) * 60 + Number(minutes)
    const minutesOf = (time: string): number => {
      const [hh = '0', mm = '0'] = time.split(':')
      return Number(hh) * 60 + Number(mm)
    }
    const longest = Math.max(1, ...rows.map(([time = '']) => minutesOf(time)))
    return column(h, [
      hero(h, { label: 'Total', value: out, sub: `${sign}${hours}h ${minutes}m`, copy: out }),
      tiles(h, [
        ['Decimal hours', `${sign}${fmt(total / 60, 2)}`],
        ['Minutes', `${sign}${total}`],
      ]),
      card(h, 'Each time', [
        bars(
          h,
          rows.map(([time = '']) => ({
            label: time,
            value: minutesOf(time),
            limit: longest,
            display: `${minutesOf(time)} min`,
          })),
        ),
      ]),
    ])
  },
})
