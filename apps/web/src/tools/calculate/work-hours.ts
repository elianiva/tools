import { column, defineCalc, draw, figure, fmt, hero, num, tiles } from './ui.ts'

export const run = (text: string): string => {
  const match = /(\d{1,2}):(\d{2})\s+(\d{1,2}):(\d{2})(?:\s+(\d+))?/u.exec(text)
  if (match === null)
    throw new Error('Enter start, end, and optionally a break in minutes, such as 9:00 17:30 30.')
  const [startHour, startMinute, endHour, endMinute] = [match[1], match[2], match[3], match[4]].map(
    Number,
  )
  if (
    (startHour ?? 0) > 23 ||
    (endHour ?? 0) > 23 ||
    (startMinute ?? 0) > 59 ||
    (endMinute ?? 0) > 59
  )
    throw new Error('Use times from 0:00 to 23:59.')
  const start = (startHour ?? 0) * 60 + (startMinute ?? 0)
  let end = (endHour ?? 0) * 60 + (endMinute ?? 0)
  if (end <= start) end += 1440
  const worked = end - start - Number(match[5] ?? 0)
  if (worked < 0) throw new Error('The break is longer than the shift.')
  return `Worked: ${Math.floor(worked / 60)}h ${worked % 60}m (${(worked / 60).toFixed(2)} hours)`
}

export const workHours = defineCalc({
  meta: {
    id: 'work-hours',
    name: 'Work hours',
    category: 'calculate',
    description: 'Hours worked between a start and an end time, minus a break.',
    keywords: ['timesheet', 'hours', 'shift', 'time card', 'overtime', 'break'],
  },
  run,
  fields: [
    { label: 'Start', value: '09:00', kind: 'time' },
    { label: 'End', value: '17:30', kind: 'time' },
    { label: 'Break', value: '30', suffix: 'min' },
  ],
  view: (h, { values, out }) => {
    const d = draw(h)
    const minutesOf = (time: string | undefined): number => {
      const [hh = '0', mm = '0'] = (time ?? '').split(':')
      return Number(hh) * 60 + Number(mm)
    }
    const start = minutesOf(values[0])
    const end = minutesOf(values[1])
    const x = (minute: number): number => 10 + (minute / 1440) * 280
    const spans =
      end > start
        ? [[start, end]]
        : [
            [start, 1440],
            [0, end],
          ]
    const [, hoursText = '', minutesText = '', decimal = ''] =
      /(\d+)h (\d+)m \((.+) hours\)/u.exec(out) ?? []
    return column(h, [
      figure(h, { width: 300, height: 70, label: 'The shift on a 24 hour timeline' }, [
        d.rect({ class: 'well', x: 10, y: 20, width: 280, height: 20, rx: 4 }),
        ...spans.map(([from = 0, to = 0]) =>
          d.rect({
            class: 'fill',
            x: x(from),
            y: 20,
            width: Math.max(2, x(to) - x(from)),
            height: 20,
            rx: 4,
          }),
        ),
        ...[0, 6, 12, 18, 24].map((hour) =>
          d.text(
            {
              class: `lbl ${hour === 0 ? '' : hour === 24 ? 'end' : 'mid'}`,
              x: x(hour * 60),
              y: 58,
            },
            String(hour),
          ),
        ),
      ]),
      hero(h, {
        label: 'Worked',
        value: `${hoursText}h ${minutesText}m`,
        sub: `${decimal} hours`,
        copy: out,
      }),
      tiles(h, [
        ['Decimal hours', fmt(Number(decimal), 2)],
        ['Break', `${fmt(num(values[2]), 0)} min`],
      ]),
    ])
  },
})
