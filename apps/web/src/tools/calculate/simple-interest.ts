import { hero } from '../generate/ui.ts'
import { defineCalc, growthSection, money } from './money-ui.ts'

export const run = (text: string): string => {
  const [principal, rate, years] = (text.match(/\d+(?:\.\d+)?/gu) ?? []).map(Number)
  if (principal === undefined || rate === undefined || years === undefined)
    throw new Error('Enter principal, yearly rate in percent, and years, such as 1000 5 3.')
  const interest = (principal * rate * years) / 100
  return [`Interest: ${interest.toFixed(2)}`, `Total: ${(principal + interest).toFixed(2)}`].join(
    '\n',
  )
}

export const simpleInterest = defineCalc({
  meta: {
    id: 'simple-interest',
    name: 'Simple interest',
    category: 'calculate',
    description: 'Interest and total from a principal, a yearly rate, and years.',
    keywords: ['simple interest', 'loan', 'principal', 'rate'],
  },
  fields: [
    { label: 'Principal', initial: '1000' },
    { label: 'Yearly rate', initial: '5', suffix: '%' },
    { label: 'Years', initial: '3', suffix: 'yrs', min: 0.01, max: 200 },
  ],
  run,
  render: (h, { nums, num }) => {
    const [principal = 0, rate = 0, years = 0] = nums
    return [
      hero(h, 'Total', money(num('Total')), [
        h.span([], [`${money(num('Interest'))} interest over ${years} years`]),
      ]),
      ...growthSection(h, principal, years, (t) => principal + (principal * rate * t) / 100),
    ]
  },
})
