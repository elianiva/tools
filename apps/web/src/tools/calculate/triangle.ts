import { defineTransform } from '../transform.ts'

export const run = (text: string): string => {
  const sides = (text.match(/\d+(?:\.\d+)?/gu) ?? []).map(Number).toSorted((x, y) => x - y)
  const [a, b, c] = sides
  if (sides.length !== 3 || a === undefined || b === undefined || c === undefined)
    throw new Error('Enter three side lengths, such as 3 4 5.')
  if (a <= 0 || a + b <= c) throw new Error('These sides do not form a triangle.')
  const s = (a + b + c) / 2
  const clean = (n: number): number => Number(n.toFixed(6))
  const kind = a === c ? 'equilateral' : a === b || b === c ? 'isosceles' : 'scalene'
  const gap = c * c - (a * a + b * b)
  const angle = Math.abs(gap) < 1e-9 ? 'right' : gap > 0 ? 'obtuse' : 'acute'
  return [
    `Perimeter: ${clean(a + b + c)}`,
    `Area: ${clean(Math.sqrt(s * (s - a) * (s - b) * (s - c)))}`,
    `Type: ${kind}, ${angle}`,
  ].join('\n')
}

export const triangle = defineTransform({
  meta: {
    id: 'triangle',
    name: 'Triangle calculator',
    category: 'calculate',
    description: 'Perimeter, area, and type of a triangle from its three sides.',
    keywords: ['triangle', 'heron', 'area', 'perimeter', 'sides', 'geometry'],
  },
  modes: [{ id: 'run', label: 'Run' }],
  placeholder: 'three sides: 3 4 5',
  example: '3 4 5',
  run,
})
