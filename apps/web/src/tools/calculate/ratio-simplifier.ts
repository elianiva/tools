import { defineTransform } from '../transform.ts'

export const run = (text: string): string => {
  const numbers = (text.match(/\d+/gu) ?? []).map(Number)
  if (numbers.length < 2 || numbers.every((value) => value === 0))
    throw new Error('Enter two or more whole numbers, such as 8:12.')
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b))
  const divisor = numbers.reduce(gcd)
  return numbers.map((value) => value / divisor).join(':')
}

export const ratioSimplifier = defineTransform({
  meta: {
    id: 'ratio-simplifier',
    name: 'Ratio simplifier',
    category: 'calculate',
    description: 'Reduce a ratio of two or more numbers to its simplest form.',
    keywords: ['ratio', 'simplify', 'reduce', 'proportion', 'gcd'],
  },
  modes: [{ id: 'run', label: 'Run' }],
  placeholder: '8:12',
  example: '8:12',
  run,
})
