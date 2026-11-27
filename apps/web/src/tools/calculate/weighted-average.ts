import { bars, card, column, defineRows, fact, fmt, hero, tiles } from './ui.ts'

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

export const weightedAverage = defineRows({
  meta: {
    id: 'weighted-average',
    name: 'Weighted average',
    category: 'calculate',
    description: 'Average of values that count for different amounts, such as grades.',
    keywords: ['weighted average', 'grades', 'gpa', 'weights', 'mean'],
  },
  run,
  columns: [{ label: 'Value' }, { label: 'Weight' }],
  rows: [
    ['90', '40'],
    ['80', '60'],
  ],
  addLabel: 'Add row',
  compose: (rows) => rows.map(([value, weight]) => `${value}*${weight}`).join(' '),
  view: (h, { rows, out }) => {
    const total = Number(fact(out, 'Total weight'))
    return column(h, [
      hero(h, { label: 'Weighted average', value: fact(out, 'Weighted average'), copy: out }),
      tiles(h, [['Total weight', fact(out, 'Total weight')]]),
      card(h, 'Share of the weight', [
        bars(
          h,
          rows.map(([value = '', weight = '']) => ({
            label: value,
            value: Number(weight),
            limit: total || 1,
            display: `${fmt((Number(weight) / (total || 1)) * 100, 1)}%`,
          })),
        ),
      ]),
    ])
  },
})
