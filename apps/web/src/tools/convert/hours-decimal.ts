import { defineTransform } from '../transform.ts'

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

export const hoursDecimal = defineTransform({
  meta: {
    id: 'hours-decimal',
    name: 'Hours and decimals',
    category: 'convert',
    description: 'Turn 1:30 into 1.5 hours and back.',
    keywords: ['decimal hours', 'hh:mm', 'timesheet', 'payroll', 'minutes'],
  },
  modes: [
    { id: 'to-decimal', label: 'h:mm to decimal' },
    { id: 'to-time', label: 'Decimal to h:mm' },
  ],
  placeholder: '1:45',
  example: '1:45',
  run,
})
