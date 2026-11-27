import { card, cells, defineForm, errorText, linked, page } from './ui.ts'

export const run = (text: string, mode: string): string => {
  if (mode === 'to-time') {
    const value = Number(text.trim())
    if (text.trim() === '' || !Number.isFinite(value) || value < 0)
      throw new Error('Enter hours as a number such as 2.25.')
    const minutes = Math.round(value * 60)
    return `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, '0')}`
  }
  const match = /^\s*(\d+):(\d{2})\s*$/u.exec(text)
  if (match === null || Number(match[2]) > 59)
    throw new Error('Write the time as h:mm, such as 1:45.')
  return String(Number((Number(match[1]) + Number(match[2]) / 60).toFixed(4)))
}

export const hoursDecimal = defineForm({
  meta: {
    id: 'hours-decimal',
    name: 'Hours and decimals',
    category: 'convert',
    description: 'Turn 1:30 into 1.5 hours and back.',
    keywords: ['decimal hours', 'hh:mm', 'timesheet', 'payroll', 'minutes'],
  },
  init: { src: 'time', text: '1:45' },
  view: (form, h) => {
    const pair = linked(
      h,
      form,
      [
        { key: 'time', label: 'Hours and minutes', suffix: 'h:mm' },
        { key: 'decimal', label: 'Decimal hours', suffix: 'h' },
      ],
      (src, text) =>
        src === 'time' ? { decimal: run(text, 'to-decimal') } : { time: run(text, 'to-time') },
    )
    return page(h, [
      card(h, null, [pair.fields, errorText(h, pair.error)]),
      card(h, 'Minutes', [
        cells(
          h,
          [5, 10, 15, 20, 30, 40, 45, 50].map((minutes) => [
            `${minutes} min`,
            String(Number((minutes / 60).toFixed(4))),
          ]),
        ),
      ]),
    ])
  },
})
