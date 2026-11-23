import { defineTransform } from '../transform.ts'

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

export const dateDifference = defineTransform({
  meta: {
    id: 'date-difference',
    name: 'Date difference',
    category: 'calculate',
    description: 'Days and weeks between two dates.',
    keywords: ['days between', 'date', 'duration', 'weeks', 'countdown'],
  },
  modes: [{ id: 'run', label: 'Run' }],
  placeholder: '2024-01-01 2024-03-01',
  example: '2024-01-01 2024-03-01',
  fields: [
    { label: 'From', kind: 'date' },
    { label: 'To', kind: 'date' },
  ],
  run,
})
