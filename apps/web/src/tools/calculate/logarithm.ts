import { defineTransform } from '../transform.ts'

export const run = (text: string): string => {
  const value = Number(text.trim())
  if (text.trim() === '' || !Number.isFinite(value) || value <= 0)
    throw new Error('Enter a number above zero.')
  const clean = (n: number): number => Number(n.toFixed(6))
  return [
    `log10: ${clean(Math.log10(value))}`,
    `ln: ${clean(Math.log(value))}`,
    `log2: ${clean(Math.log2(value))}`,
  ].join('\n')
}

export const logarithm = defineTransform({
  meta: {
    id: 'logarithm',
    name: 'Logarithm calculator',
    category: 'calculate',
    description: 'Base 10, natural, and base 2 logarithms.',
    keywords: ['log', 'ln', 'log2', 'log10', 'logarithm', 'natural log'],
  },
  modes: [{ id: 'run', label: 'Run' }],
  placeholder: '1000',
  example: '1000',
  run,
})
