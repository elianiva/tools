import { defineTransform } from '../transform.ts'

export const run = (text: string): string => {
  const value = Number(text.trim())
  if (text.trim() === '' || !Number.isFinite(value)) throw new Error('Enter a number.')
  const clean = (n: number): number => Number(n.toFixed(6))
  return [
    `Square root: ${value < 0 ? 'not a real number' : clean(Math.sqrt(value))}`,
    `Cube root: ${clean(Math.cbrt(value))}`,
    `Square: ${clean(value ** 2)}`,
    `Cube: ${clean(value ** 3)}`,
  ].join('\n')
}

export const squareRoot = defineTransform({
  meta: {
    id: 'square-root',
    name: 'Roots and powers',
    category: 'calculate',
    description: 'Square root, cube root, square, and cube of a number.',
    keywords: ['sqrt', 'cube root', 'square', 'cube', 'power', 'root'],
  },
  modes: [{ id: 'run', label: 'Run' }],
  placeholder: '16',
  example: '16',
  run,
})
