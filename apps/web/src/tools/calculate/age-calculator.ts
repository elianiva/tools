import { defineTransform } from '../transform.ts'

export const run = (text: string): string => {
  const found = [...text.matchAll(/(\d{4})-(\d{2})-(\d{2})/gu)].map(
    (match) => [Number(match[1]), Number(match[2]), Number(match[3])] as const,
  )
  const [birth, end] = found
  if (birth === undefined || end === undefined)
    throw new Error('Enter a birth date and an as-of date, such as 1990-08-15 2024-08-14.')
  if (end[0] * 10_000 + end[1] * 100 + end[2] < birth[0] * 10_000 + birth[1] * 100 + birth[2])
    throw new Error('The second date is before the birth date.')
  let years = end[0] - birth[0]
  let months = end[1] - birth[1]
  let days = end[2] - birth[2]
  let year = end[0]
  let month = end[1]
  while (days < 0) {
    month -= 1
    if (month === 0) {
      month = 12
      year -= 1
    }
    days += new Date(Date.UTC(year, month, 0)).getUTCDate()
    months -= 1
  }
  if (months < 0) {
    years -= 1
    months += 12
  }
  return `Age: ${years} years, ${months} months, ${days} days`
}

export const ageCalculator = defineTransform({
  meta: {
    id: 'age-calculator',
    name: 'Age calculator',
    category: 'calculate',
    description: 'Exact age in years, months, and days between a birth date and another date.',
    keywords: ['age', 'birthday', 'years', 'months', 'days', 'birth date'],
  },
  modes: [{ id: 'run', label: 'Run' }],
  placeholder: 'birth date and today: 1990-08-15 2024-08-14',
  example: '1990-08-15 2024-08-14',
  fields: [
    { label: 'Born', kind: 'date' },
    { label: 'On this day', kind: 'date' },
  ],
  run,
})
