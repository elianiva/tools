import { column, defineCalc, fact, fmt, hero, num, plot, tiles } from './ui.ts'

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

export const slope = defineCalc({
  meta: {
    id: 'slope',
    name: 'Slope and distance',
    category: 'calculate',
    description: 'Slope, line, distance, and midpoint of two points.',
    keywords: ['slope', 'line', 'distance', 'midpoint', 'coordinates', 'geometry'],
  },
  run,
  fields: [
    { label: 'x1', value: '1' },
    { label: 'y1', value: '2' },
    { label: 'x2', value: '3' },
    { label: 'y2', value: '6' },
  ],
  view: (h, { values, out }) => {
    const [x1, y1, x2, y2] = values.map(num) as [number, number, number, number]
    const range = (lo: number, hi: number): readonly [number, number] => {
      const low = Math.min(lo, 0)
      const high = Math.max(hi, 0)
      const pad = Math.max((high - low) * 0.18, 1)
      return [low - pad, high + pad]
    }
    const m = Number(fact(out, 'Slope'))
    const b = Number(fact(out, 'Intercept'))
    const vertical = Number.isNaN(m)
    return column(h, [
      plot(h, {
        label: 'The two points and the line through them',
        x: range(Math.min(x1, x2), Math.max(x1, x2)),
        y: range(Math.min(y1, y2), Math.max(y1, y2)),
        ...(vertical ? {} : { fns: [(x: number) => m * x + b] }),
        segments: [
          { from: [x1, y1], to: [x2, y1] },
          { from: [x2, y1], to: [x2, y2] },
        ],
        points: [
          { x: x1, y: y1, label: `(${fmt(x1)}, ${fmt(y1)})` },
          { x: x2, y: y2, label: `(${fmt(x2)}, ${fmt(y2)})` },
        ],
      }),
      hero(h, {
        label: 'Slope',
        value: vertical ? 'Undefined' : fmt(m, 6),
        sub: vertical
          ? `x = ${fmt(x1)}`
          : `y = ${fmt(m, 4)}x ${b < 0 ? '−' : '+'} ${fmt(Math.abs(b), 4)}`,
        copy: out,
      }),
      tiles(h, [
        ['Distance', fact(out, 'Distance')],
        ['Midpoint', fact(out, 'Midpoint')],
      ]),
    ])
  },
})
