import { hero } from '../generate/ui.ts'
import { defineCalc, growthSection, money } from './money-ui.ts'

export const run = (text: string, mode: string): string => {
  const [principal, rate, years] = (text.match(/\d+(?:\.\d+)?/gu) ?? []).map(Number)
  if (principal === undefined || rate === undefined || years === undefined) {
    throw new Error('Enter principal, yearly rate in percent, and years, such as 1000 5 10.')
  }
  const periods = mode === 'daily' ? 365 : mode === 'monthly' ? 12 : 1
  const final = principal * (1 + rate / 100 / periods) ** (periods * years)
  return [
    `Final amount: ${final.toFixed(2)}`,
    `Interest earned: ${(final - principal).toFixed(2)}`,
  ].join('\n')
}

export const compoundInterest = defineCalc({
  meta: {
    id: 'compound-interest',
    name: 'Compound interest',
    category: 'calculate',
    description: 'Growth of savings with yearly, monthly, or daily compounding.',
    keywords: ['savings', 'investment', 'interest', 'growth', 'apy'],
  },
  fields: [
    { label: 'Principal', initial: '1000' },
    { label: 'Yearly rate', initial: '5', suffix: '%' },
    { label: 'Years', initial: '10', suffix: 'yrs', min: 0.01, max: 200 },
  ],
  modes: [
    { id: 'yearly', label: 'Yearly' },
    { id: 'monthly', label: 'Monthly' },
    { id: 'daily', label: 'Daily' },
  ],
  modeLabel: 'Compounding',
  run,
  render: (h, { nums, mode, num }) => {
    const [principal = 0, rate = 0, years = 0] = nums
    const periods = mode === 'daily' ? 365 : mode === 'monthly' ? 12 : 1
    return [
      hero(h, 'Final amount', money(num('Final amount')), [
        h.span([], [`${money(num('Interest earned'))} interest over ${years} years`]),
      ]),
      ...growthSection(
        h,
        principal,
        years,
        (t) => principal * (1 + rate / 100 / periods) ** (periods * t),
      ),
    ]
  },
})
