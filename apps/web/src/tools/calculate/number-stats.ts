import { defineTransform } from '../transform.ts'

export const run = (text: string): string => {
  const values = (text.match(/-?\d+(?:\.\d+)?/gu) ?? []).map(Number)
  if (values.length === 0) throw new Error('Enter some numbers.')
  const sorted = values.toSorted((a, b) => a - b)
  const sum = values.reduce((total, value) => total + value, 0)
  const mean = sum / values.length
  const middle = Math.floor(sorted.length / 2)
  const median =
    sorted.length % 2 === 1
      ? (sorted[middle] ?? 0)
      : ((sorted[middle - 1] ?? 0) + (sorted[middle] ?? 0)) / 2
  const spread = Math.sqrt(
    values.reduce((total, value) => total + (value - mean) ** 2, 0) / values.length,
  )
  const clean = (n: number): string => String(Number(n.toFixed(6)))
  return [
    `Count: ${values.length}`,
    `Sum: ${clean(sum)}`,
    `Mean: ${clean(mean)}`,
    `Median: ${clean(median)}`,
    `Min: ${clean(sorted[0] ?? 0)}`,
    `Max: ${clean(sorted[sorted.length - 1] ?? 0)}`,
    `Std dev: ${clean(spread)}`,
  ].join('\n')
}

export const numberStats = defineTransform({
  meta: {
    id: 'number-stats',
    name: 'Number statistics',
    category: 'calculate',
    description: 'Count, sum, mean, median, range, and spread of a list of numbers.',
    keywords: ['average', 'mean', 'median', 'sum', 'standard deviation', 'statistics'],
  },
  modes: [{ id: 'run', label: 'Run' }],
  placeholder: 'Numbers separated by spaces, commas, or lines',
  example: '1 2 3 4',
  acceptsFiles: true,
  present: 'facts',
  run,
})
