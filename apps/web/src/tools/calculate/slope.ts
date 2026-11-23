import { defineTransform } from '../transform.ts'

export const run = (text: string): string => {
  const [x1, y1, x2, y2] = (text.match(/-?\d+(?:\.\d+)?/gu) ?? []).map(Number)
  if (x1 === undefined || y1 === undefined || x2 === undefined || y2 === undefined)
    throw new Error('Enter four numbers: x1 y1 x2 y2.')
  if (x1 === x2 && y1 === y2) throw new Error('Enter two different points.')
  const clean = (n: number): number => Number(n.toFixed(6)) + 0
  const distance = `Distance: ${clean(Math.hypot(x2 - x1, y2 - y1))}`
  const midpoint = `Midpoint: (${clean((x1 + x2) / 2)}, ${clean((y1 + y2) / 2)})`
  if (x1 === x2) return ['Slope: undefined (vertical line)', distance, midpoint].join('\n')
  const slope = (y2 - y1) / (x2 - x1)
  return [
    `Slope: ${clean(slope)}`,
    `Intercept: ${clean(y1 - slope * x1)}`,
    distance,
    midpoint,
  ].join('\n')
}

export const slope = defineTransform({
  meta: {
    id: 'slope',
    name: 'Slope and distance',
    category: 'calculate',
    description: 'Slope, line, distance, and midpoint of two points.',
    keywords: ['slope', 'line', 'distance', 'midpoint', 'coordinates', 'geometry'],
  },
  modes: [{ id: 'run', label: 'Run' }],
  placeholder: 'x1 y1 x2 y2: 1 2 3 6',
  example: '1 2 3 6',
  run,
})
