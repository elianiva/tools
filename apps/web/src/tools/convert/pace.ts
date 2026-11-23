import { defineTransform } from '../transform.ts'

export const run = (text: string, mode: string): string => {
  const match = /^\s*(\d+(?:\.\d+)?)\s*(?:km|mi)?\s+(\d+(?::\d{1,2}){1,2})\s*$/iu.exec(text)
  if (match === null) throw new Error('Enter distance and time, such as 5 25:00 or 42.2 3:45:00.')
  const distance = Number(match[1])
  const [a = 0, b = 0, c] = (match[2] ?? '').split(':').map(Number)
  const seconds = c === undefined ? a * 60 + b : a * 3600 + b * 60 + c
  if (distance <= 0 || seconds <= 0) throw new Error('Distance and time must be above zero.')
  const pace = Math.round(seconds / distance)
  const unit = mode === 'mi' ? 'mi' : 'km'
  return [
    `Pace: ${Math.floor(pace / 60)}:${String(pace % 60).padStart(2, '0')} /${unit}`,
    `Speed: ${((distance / seconds) * 3600).toFixed(2)} ${unit}/h`,
  ].join('\n')
}

export const pace = defineTransform({
  meta: {
    id: 'pace',
    name: 'Running pace',
    category: 'convert',
    description: 'Pace and speed from a distance and a time.',
    keywords: ['running', 'pace', 'minutes per km', 'marathon', 'race', 'speed'],
  },
  modes: [
    { id: 'km', label: 'Kilometres' },
    { id: 'mi', label: 'Miles' },
  ],
  placeholder: 'distance and time: 5 25:00',
  example: '5 25:00',
  fields: [{ label: 'Distance' }, { label: 'Time', kind: 'text' }],
  run,
})
