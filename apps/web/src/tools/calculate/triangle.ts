import { column, defineCalc, draw, fact, figure, fmt, hero, num, tiles } from './ui.ts'

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

export const triangle = defineCalc({
  meta: {
    id: 'triangle',
    name: 'Triangle calculator',
    category: 'calculate',
    description: 'Perimeter, area, and type of a triangle from its three sides.',
    keywords: ['triangle', 'heron', 'area', 'perimeter', 'sides', 'geometry'],
  },
  run,
  fields: [
    { label: 'Side a', value: '3' },
    { label: 'Side b', value: '4' },
    { label: 'Side c', value: '5' },
  ],
  view: (h, { values, out }) => {
    const d = draw(h)
    const [a, b, c] = [num(values[0]), num(values[1]), num(values[2])]
    // Side c lies along the base; the apex follows from the law of cosines.
    const apexX = (b * b + c * c - a * a) / (2 * c)
    const apexY = Math.sqrt(Math.max(0, b * b - apexX * apexX))
    const left = Math.min(0, apexX)
    const scale = Math.min(260 / (Math.max(c, apexX) - left), 150 / apexY)
    const at = (x: number, y: number): readonly [number, number] => [
      20 + (x - left) * scale,
      190 - y * scale,
    ]
    const pa = at(0, 0)
    const pb = at(c, 0)
    const pc = at(apexX, apexY)
    const center = [(pa[0] + pb[0] + pc[0]) / 3, (pa[1] + pb[1] + pc[1]) / 3] as const
    const side = (
      from: readonly [number, number],
      to: readonly [number, number],
      name: string,
      size: number,
    ) => {
      const mid = [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2] as const
      const away = [mid[0] - center[0], mid[1] - center[1]] as const
      const length = Math.hypot(away[0], away[1]) || 1
      return d.text(
        {
          class: 'val mid',
          x: mid[0] + (away[0] / length) * 22,
          y: mid[1] + (away[1] / length) * 16 + 4,
        },
        `${name} = ${fmt(size, 3)}`,
      )
    }
    return column(h, [
      figure(h, { width: 300, height: 220, label: 'The triangle drawn to scale with its sides' }, [
        d.polygon({
          class: 'shape',
          points: [pa, pb, pc].map((p) => `${fmt(p[0], 1)},${fmt(p[1], 1)}`).join(' '),
        }),
        side(pb, pc, 'a', a),
        side(pc, pa, 'b', b),
        side(pa, pb, 'c', c),
      ]),
      hero(h, { label: 'Area', value: fact(out, 'Area'), copy: out }),
      tiles(h, [
        ['Perimeter', fact(out, 'Perimeter')],
        ['Type', fact(out, 'Type')],
      ]),
    ])
  },
})
