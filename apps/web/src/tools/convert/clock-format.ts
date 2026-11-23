import { defineTransform } from '../transform.ts'

export const run = (text: string, mode: string): string => {
  return text
    .split('\n')
    .map((line) => {
      const shown = line.trim()
      const match = /^(\d{1,2}):(\d{2})\s*(am|pm)?$/iu.exec(shown)
      if (match === null) throw new Error(`"${shown}" is not a time such as 14:30 or 2:30 PM.`)
      const hour = Number(match[1])
      const minute = match[2] ?? '00'
      const suffix = (match[3] ?? '').toLowerCase()
      if (Number(minute) > 59 || hour > 23 || (suffix !== '' && (hour < 1 || hour > 12)))
        throw new Error(`"${shown}" is not a valid time.`)
      if (mode === 'to-24') {
        if (suffix === '') throw new Error('Add AM or PM to each time.')
        return `${String(suffix === 'pm' ? (hour % 12) + 12 : hour % 12).padStart(2, '0')}:${minute}`
      }
      if (suffix !== '') return `${hour}:${minute} ${suffix.toUpperCase()}`
      return `${hour % 12 === 0 ? 12 : hour % 12}:${minute} ${hour >= 12 ? 'PM' : 'AM'}`
    })
    .join('\n')
}

export const clockFormat = defineTransform({
  meta: {
    id: 'clock-format',
    name: '12 and 24 hour clock',
    category: 'convert',
    description: 'Convert times between 12-hour and 24-hour clocks, one per line.',
    keywords: ['am pm', '24 hour', 'military time', 'clock', 'time format'],
  },
  modes: [
    { id: 'to-12', label: 'To 12-hour' },
    { id: 'to-24', label: 'To 24-hour' },
  ],
  placeholder: 'Type or paste text',
  acceptsFiles: true,
  example: '14:30',
  fields: [{ label: 'Time', kind: 'text' }],
  run,
})
