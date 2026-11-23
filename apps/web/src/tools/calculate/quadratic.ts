import { defineTransform } from '../transform.ts'

export const run = (text: string): string => {
  const [a, b, c] = (text.match(/-?\d+(?:\.\d+)?/gu) ?? []).map(Number)
  if (a === undefined || b === undefined || c === undefined)
    throw new Error('Enter a, b, and c, such as 1 -3 2.')
  if (a === 0) throw new Error('a cannot be zero.')
  const clean = (n: number): string => String(Number(n.toFixed(6)) + 0)
  const discriminant = b * b - 4 * a * c
  const head = `Discriminant: ${clean(discriminant)}`
  if (discriminant === 0) return `${head}\nx = ${clean(-b / (2 * a))}`
  if (discriminant > 0) {
    const root = Math.sqrt(discriminant)
    return `${head}\nx1 = ${clean((-b + root) / (2 * a))}\nx2 = ${clean((-b - root) / (2 * a))}`
  }
  const real = clean(-b / (2 * a))
  const imaginary = clean(Math.sqrt(-discriminant) / (2 * Math.abs(a)))
  return `${head}\nx1 = ${real} + ${imaginary}i\nx2 = ${real} - ${imaginary}i`
}

export const quadratic = defineTransform({
  meta: {
    id: 'quadratic',
    name: 'Quadratic solver',
    category: 'calculate',
    description: 'Solve ax² + bx + c = 0, with complex roots.',
    keywords: ['quadratic', 'equation', 'roots', 'discriminant', 'algebra', 'parabola'],
  },
  modes: [{ id: 'run', label: 'Run' }],
  placeholder: 'a b c: 1 -3 2',
  example: '1 -3 2',
  fields: [{ label: 'a' }, { label: 'b' }, { label: 'c' }],
  run,
})
