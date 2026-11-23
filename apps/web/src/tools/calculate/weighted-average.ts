import { defineTransform } from '../transform.ts'

export const run = (text: string): string => {
  const pairs = [...text.matchAll(/(-?\d+(?:\.\d+)?)\s*[*x×]\s*(\d+(?:\.\d+)?)/giu)].map(
    (match) => [Number(match[1]), Number(match[2])] as const,
  )
  if (pairs.length === 0) throw new Error('Enter pairs such as 90*40 80*60.')
  const weight = pairs.reduce((sum, [, w]) => sum + w, 0)
  if (weight === 0) throw new Error('The weights add up to zero.')
  const clean = (n: number): number => Number(n.toFixed(4))
  return `Weighted average: ${clean(pairs.reduce((sum, [value, w]) => sum + value * w, 0) / weight)}\nTotal weight: ${clean(weight)}`
}

export const weightedAverage = defineTransform({
  meta: {
    id: 'weighted-average',
    name: 'Weighted average',
    category: 'calculate',
    description: 'Average of values that count for different amounts, such as grades.',
    keywords: ['weighted average', 'grades', 'gpa', 'weights', 'mean'],
  },
  modes: [{ id: 'run', label: 'Run' }],
  placeholder: 'value*weight, such as 90*40 and 80*60',
  example: '90*40 80*60',
  acceptsFiles: true,
  run,
})
