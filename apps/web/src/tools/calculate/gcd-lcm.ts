import { defineTransform } from '../transform.ts'

export const run = (text: string): string => {
  const numbers = (text.match(/\d+/gu) ?? []).map(Number)
  if (numbers.length < 2 || numbers.some((value) => value < 1 || !Number.isSafeInteger(value))) {
    throw new Error('Enter two or more positive whole numbers.')
  }
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b))
  const divisor = numbers.reduce((a, b) => gcd(a, b))
  const multiple = numbers.reduce((a, b) => (a / gcd(a, b)) * b)
  return [`GCD: ${divisor}`, `LCM: ${multiple}`].join('\n')
}

export const gcdLcm = defineTransform({
  meta: {
    id: 'gcd-lcm',
    name: 'GCD and LCM',
    category: 'calculate',
    description: 'Greatest common divisor and least common multiple.',
    keywords: ['gcd', 'lcm', 'divisor', 'multiple', 'hcf'],
  },
  modes: [{ id: 'run', label: 'Run' }],
  placeholder: '12 18',
  example: '12 18',
  fields: [{ label: 'First number' }, { label: 'Second number' }],
  run,
})
