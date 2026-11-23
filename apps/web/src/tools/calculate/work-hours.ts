import { defineTransform } from '../transform.ts'

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

export const workHours = defineTransform({
  meta: {
    id: 'work-hours',
    name: 'Work hours',
    category: 'calculate',
    description: 'Hours worked between a start and an end time, minus a break.',
    keywords: ['timesheet', 'hours', 'shift', 'time card', 'overtime', 'break'],
  },
  modes: [{ id: 'run', label: 'Run' }],
  placeholder: 'start, end, break minutes: 9:00 17:30 30',
  example: '9:00 17:30 30',
  run,
})
