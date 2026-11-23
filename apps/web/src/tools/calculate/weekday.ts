import { defineTransform } from '../transform.ts'

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

export const weekday = defineTransform({
  meta: {
    id: 'weekday',
    name: 'Weekday finder',
    category: 'calculate',
    description: 'The weekday and day of the year for any date.',
    keywords: ['day of week', 'date', 'calendar', 'day of year'],
  },
  modes: [{ id: 'run', label: 'Run' }],
  placeholder: '2024-02-29',
  example: '2024-02-29',
  run,
})
