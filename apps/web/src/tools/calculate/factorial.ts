import { defineTransform } from '../transform.ts'

export const run = (text: string): string => {
  const clean = text.trim().replaceAll(/[,_\s]/gu, '')
  if (!/^\d+$/u.test(clean)) throw new Error('Enter a whole number.')
  const n = Number(clean)
  if (n > 1000) throw new Error('This tool goes up to 1000.')
  let result = 1n
  for (let i = 2n; i <= BigInt(n); i += 1n) result *= i
  return result.toString()
}

export const factorial = defineTransform({
  meta: {
    id: 'factorial',
    name: 'Factorial',
    category: 'calculate',
    description: 'n! for any whole number up to 1000, exactly.',
    keywords: ['factorial', 'n!', 'product', 'big number'],
  },
  modes: [{ id: 'run', label: 'Run' }],
  placeholder: '20',
  example: '20',
  fields: [{ label: 'Number' }],
  run,
})
