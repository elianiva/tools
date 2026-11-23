import { defineTransform } from '../transform.ts'

export const run = (text: string): string => {
  if (!/^\d{1,4}$/u.test(text.trim())) throw new Error('Enter a year such as 2024.')
  const year = Number(text.trim())
  const leap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
  return `${year} is ${leap ? 'a leap year (366 days)' : 'not a leap year (365 days)'}`
}

export const leapYear = defineTransform({
  meta: {
    id: 'leap-year',
    name: 'Leap year',
    category: 'calculate',
    description: 'Check if a year is a leap year.',
    keywords: ['leap year', 'calendar', 'february 29', 'gregorian'],
  },
  modes: [{ id: 'run', label: 'Run' }],
  placeholder: '2024',
  example: '2024',
  fields: [{ label: 'Year' }],
  run,
})
