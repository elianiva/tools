import { defineTransform } from '../transform.ts'

export const run = (text: string): string => {
  const [principal, rate, years] = (text.match(/\d+(?:\.\d+)?/gu) ?? []).map(Number)
  if (principal === undefined || rate === undefined || years === undefined)
    throw new Error('Enter principal, yearly rate in percent, and years, such as 1000 5 3.')
  const interest = (principal * rate * years) / 100
  return [`Interest: ${interest.toFixed(2)}`, `Total: ${(principal + interest).toFixed(2)}`].join(
    '\n',
  )
}

export const simpleInterest = defineTransform({
  meta: {
    id: 'simple-interest',
    name: 'Simple interest',
    category: 'calculate',
    description: 'Interest and total from a principal, a yearly rate, and years.',
    keywords: ['simple interest', 'loan', 'principal', 'rate'],
  },
  modes: [{ id: 'run', label: 'Run' }],
  placeholder: 'principal, yearly rate %, years: 1000 5 3',
  example: '1000 5 3',
  run,
})
