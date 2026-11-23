import { defineTransform } from '../transform.ts'

export const run = (text: string): string => {
  const date = new Date(Date.parse(text.trim()))
  if (Number.isNaN(date.getTime())) throw new Error('Not a date. Try 2024-05-01T12:00:00Z.')
  const zones = [
    'UTC',
    'America/Los_Angeles',
    'America/New_York',
    'Europe/London',
    'Europe/Berlin',
    'Asia/Dubai',
    'Asia/Kolkata',
    'Asia/Jakarta',
    'Asia/Tokyo',
    'Australia/Sydney',
  ]
  const show = (zone: string): string => {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: zone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(date)
    const get = (type: string): string => parts.find((part) => part.type === type)?.value ?? ''
    return `${zone}  ${get('year')}-${get('month')}-${get('day')} ${get('hour')}:${get('minute')}`
  }
  return zones.map(show).join('\n')
}

export const timezones = defineTransform({
  meta: {
    id: 'timezones',
    name: 'Time zone converter',
    category: 'convert',
    description: 'One moment shown in ten time zones.',
    keywords: ['time zone', 'utc', 'convert', 'meeting', 'world clock', 'jakarta'],
  },
  modes: [{ id: 'run', label: 'Run' }],
  placeholder: '2024-05-01T12:00:00Z',
  example: '2024-05-01T12:00:00Z',
  present: 'pairs',
  run,
})
