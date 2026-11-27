import { column, defineCalc, draw, figure, fmt, hero, num, tiles } from './ui.ts'

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

export const pythagorean = defineCalc({
  meta: {
    id: 'pythagorean',
    name: 'Pythagorean theorem',
    category: 'calculate',
    description: 'Find the hypotenuse or a missing leg of a right triangle.',
    keywords: ['pythagoras', 'triangle', 'hypotenuse', 'leg', 'right angle'],
  },
  run,
  modes: [
    {
      id: 'hypotenuse',
      label: 'Find hypotenuse',
      fields: [
        { label: 'Leg a', value: '3' },
        { label: 'Leg b', value: '4' },
      ],
    },
    {
      id: 'leg',
      label: 'Find a leg',
      fields: [
        { label: 'Hypotenuse c', value: '5' },
        { label: 'Leg a', value: '3' },
      ],
    },
  ],
  view: (h, { values, mode, out }) => {
    const d = draw(h)
    const solved = Number(out.split(': ')[1])
    const finding = mode === 'leg'
    const [a, b, c] = finding
      ? [num(values[1]), solved, num(values[0])]
      : [num(values[0]), num(values[1]), solved]
    const scale = Math.min(230 / a, 150 / b)
    const [w, t] = [a * scale, b * scale]
    const [x0, y0] = [40, 190]
    const tag = (name: string, value: number): string => `${name} = ${fmt(value, 3)}`
    return column(h, [
      figure(
        h,
        { width: 300, height: 220, label: 'A right triangle with legs a and b and hypotenuse c' },
        [
          d.polygon({
            class: 'shape',
            points: `${x0},${y0} ${fmt(x0 + w, 1)},${y0} ${x0},${fmt(y0 - t, 1)}`,
          }),
          d.path({ class: 'ink', d: `M${x0 + 14} ${y0} v-14 h-14` }),
          d.text({ class: 'val mid', x: x0 + w / 2, y: y0 + 18 }, tag('a', a)),
          d.text({ class: 'val', x: x0 + 8, y: y0 - t / 2 }, tag('b', b)),
          d.text({ class: 'val end', x: x0 + w - 6, y: y0 - t / 2 - 4 }, tag('c', c)),
        ],
      ),
      hero(h, { label: finding ? 'Missing leg' : 'Hypotenuse', value: fmt(solved, 6), copy: out }),
      tiles(h, [
        ['Area', fmt((a * b) / 2, 4)],
        ['Angle at a', `${fmt((Math.atan2(b, a) * 180) / Math.PI, 2)}°`],
      ]),
    ])
  },
})
