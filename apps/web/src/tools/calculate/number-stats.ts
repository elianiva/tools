import { column, defineCalc, draw, fact, figure, fmt, hero, tiles } from './ui.ts'

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

export const numberStats = defineCalc({
  meta: {
    id: 'number-stats',
    name: 'Number statistics',
    category: 'calculate',
    description: 'Count, sum, mean, median, range, and spread of a list of numbers.',
    keywords: ['average', 'mean', 'median', 'sum', 'standard deviation', 'statistics'],
  },
  run,
  acceptsFiles: true,
  fields: [
    {
      label: 'Numbers',
      value: '4 8 15 16 23 42',
      kind: 'area',
      placeholder: 'Separate with spaces, commas, or lines',
    },
  ],
  view: (h, { values, out }) => {
    const d = draw(h)
    const sorted =
      (values[0] ?? '')
        .match(/-?\d+(?:\.\d+)?/gu)
        ?.map(Number)
        .toSorted((a, b) => a - b) ?? []
    const [lo, hi] = [sorted[0] ?? 0, sorted[sorted.length - 1] ?? 0]
    const at = (p: number): number => {
      const pos = (sorted.length - 1) * p
      const base = Math.floor(pos)
      return (
        (sorted[base] ?? 0) +
        ((sorted[base + 1] ?? sorted[base] ?? 0) - (sorted[base] ?? 0)) * (pos - base)
      )
    }
    const span = hi - lo || 1
    const x = (v: number): number => 20 + ((v - lo) / span) * 260
    const [q1, q2, q3] = [at(0.25), at(0.5), at(0.75)]
    const mean = Number(fact(out, 'Mean'))
    return column(h, [
      figure(
        h,
        { width: 300, height: 120, label: 'Box plot of the numbers with each value as a dot' },
        [
          ...sorted.map((v) =>
            d.circle({ class: 'fill', cx: x(v), cy: 18, r: 3.5, opacity: 0.55 }),
          ),
          d.line({ class: 'ink', x1: x(lo), x2: x(hi), y1: 62, y2: 62 }),
          d.line({ class: 'ink', x1: x(lo), x2: x(lo), y1: 52, y2: 72 }),
          d.line({ class: 'ink', x1: x(hi), x2: x(hi), y1: 52, y2: 72 }),
          d.rect({
            class: 'shape',
            x: x(q1),
            y: 44,
            width: Math.max(1, x(q3) - x(q1)),
            height: 36,
            rx: 3,
          }),
          d.line({ class: 'accent', x1: x(q2), x2: x(q2), y1: 44, y2: 80 }),
          d.line({ class: 'dash', x1: x(mean), x2: x(mean), y1: 34, y2: 92 }),
          d.text({ class: 'lbl', x: x(lo), y: 108 }, fmt(lo, 3)),
          d.text({ class: 'lbl end', x: x(hi), y: 108 }, fmt(hi, 3)),
          d.text({ class: 'lbl mid', x: x(mean), y: 104 }, `mean ${fmt(mean, 2)}`),
        ],
      ),
      hero(h, { label: 'Mean', value: fact(out, 'Mean'), copy: out }),
      tiles(h, [
        ['Median', fact(out, 'Median')],
        ['Count', fact(out, 'Count')],
        ['Sum', fact(out, 'Sum')],
        ['Min', fact(out, 'Min')],
        ['Max', fact(out, 'Max')],
        ['Std dev', fact(out, 'Std dev')],
      ]),
    ])
  },
})
