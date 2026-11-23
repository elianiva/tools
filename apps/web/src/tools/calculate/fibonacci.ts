import { defineTransform } from '../transform.ts'

export const run = (text: string): string => {
  if (!/^\d+$/u.test(text.trim())) throw new Error('Enter how many terms, such as 10.')
  const count = Number(text.trim())
  if (count < 1 || count > 200) throw new Error('Choose from 1 up to 200 terms.')
  const terms: Array<bigint> = []
  let a = 0n
  let b = 1n
  for (let i = 0; i < count; i += 1) {
    terms.push(a)
    ;[a, b] = [b, a + b]
  }
  return terms.join(', ')
}

export const fibonacci = defineTransform({
  meta: {
    id: 'fibonacci',
    name: 'Fibonacci',
    category: 'calculate',
    description: 'The first n Fibonacci numbers, exactly.',
    keywords: ['fibonacci', 'sequence', 'golden ratio', 'series'],
  },
  modes: [{ id: 'run', label: 'Run' }],
  placeholder: '10',
  example: '10',
  fields: [{ label: 'Position' }],
  run,
})
