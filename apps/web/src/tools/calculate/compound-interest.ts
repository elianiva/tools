import { defineTransform } from '../transform.ts'

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

export const compoundInterest = defineTransform({
  meta: {
    id: 'compound-interest',
    name: 'Compound interest',
    category: 'calculate',
    description: 'Growth of savings with yearly, monthly, or daily compounding.',
    keywords: ['savings', 'investment', 'interest', 'growth', 'apy'],
  },
  modes: [
    { id: 'yearly', label: 'Yearly' },
    { id: 'monthly', label: 'Monthly' },
    { id: 'daily', label: 'Daily' },
  ],
  placeholder: 'principal, yearly rate %, years: 1000 5 10',
  example: '1000 5 10',
  fields: [
    { label: 'Principal' },
    { label: 'Yearly rate', suffix: '%' },
    { label: 'Years', suffix: 'yrs' },
  ],
  run,
})
