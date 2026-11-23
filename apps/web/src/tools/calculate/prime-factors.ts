import { defineTransform } from '../transform.ts'

export const run = (text: string): string => {
  const clean = text.trim().replaceAll(/[,_\s]/gu, '')
  if (!/^\d+$/u.test(clean)) throw new Error('Enter a whole number.')
  const value = Number(clean)
  if (value > 1_000_000_000_000) throw new Error('This tool goes up to 1,000,000,000,000.')
  if (value < 2) return `${value} is neither prime nor composite`
  let rest = value
  const factors = new Map<number, number>()
  for (let divisor = 2; divisor * divisor <= rest; divisor += divisor === 2 ? 1 : 2) {
    while (rest % divisor === 0) {
      factors.set(divisor, (factors.get(divisor) ?? 0) + 1)
      rest /= divisor
    }
  }
  if (rest > 1) factors.set(rest, (factors.get(rest) ?? 0) + 1)
  if (factors.size === 1 && factors.get(value) === 1) return `${value} is prime`
  return `${value} = ${[...factors].map(([prime, power]) => (power === 1 ? String(prime) : `${prime}^${power}`)).join(' × ')}`
}

export const primeFactors = defineTransform({
  meta: {
    id: 'prime-factors',
    name: 'Prime factors',
    category: 'calculate',
    description: 'Check if a number is prime and factor it.',
    keywords: ['prime', 'factor', 'divisors', 'composite'],
  },
  modes: [{ id: 'run', label: 'Run' }],
  placeholder: '84',
  example: '84',
  run,
})
