import { defineTransform } from '../transform.ts'

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

export const timeAdd = defineTransform({
  meta: {
    id: 'time-add',
    name: 'Time adder',
    category: 'calculate',
    description: 'Add or subtract times written as h:mm.',
    keywords: ['add time', 'subtract time', 'hours', 'minutes', 'duration', 'timesheet'],
  },
  modes: [
    { id: 'add', label: 'Add' },
    { id: 'subtract', label: 'Subtract from the first' },
  ],
  placeholder: '1:30 2:45',
  example: '1:30 2:45',
  run,
})
