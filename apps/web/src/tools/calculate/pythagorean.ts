import { defineTransform } from '../transform.ts'

export const run = (text: string, mode: string): string => {
  const [x, y] = (text.match(/\d+(?:\.\d+)?/gu) ?? []).map(Number)
  if (x === undefined || y === undefined) throw new Error('Enter two side lengths, such as 3 4.')
  const clean = (n: number): number => Number(n.toFixed(6))
  if (mode === 'leg') {
    if (x <= y) throw new Error('Enter the hypotenuse first; it must be longer than the leg.')
    return `Missing leg: ${clean(Math.sqrt(x * x - y * y))}`
  }
  return `Hypotenuse: ${clean(Math.hypot(x, y))}`
}

export const pythagorean = defineTransform({
  meta: {
    id: 'pythagorean',
    name: 'Pythagorean theorem',
    category: 'calculate',
    description: 'Find the hypotenuse or a missing leg of a right triangle.',
    keywords: ['pythagoras', 'triangle', 'hypotenuse', 'leg', 'right angle'],
  },
  modes: [
    { id: 'hypotenuse', label: 'Find hypotenuse' },
    { id: 'leg', label: 'Find a leg' },
  ],
  placeholder: 'two sides: 3 4',
  example: '3 4',
  fields: [{ label: 'Side A' }, { label: 'Side B' }],
  run,
})
