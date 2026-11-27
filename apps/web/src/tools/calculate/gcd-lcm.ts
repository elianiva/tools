import { column, defineCalc, draw, fact, figure, hero, num, tiles } from './ui.ts'

export const run = (text: string): string => {
  const numbers = (text.match(/\d+/gu) ?? []).map(Number)
  if (numbers.length < 2 || numbers.some((value) => value < 1 || !Number.isSafeInteger(value))) {
    throw new Error('Enter two or more positive whole numbers.')
  }
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b))
  const divisor = numbers.reduce((a, b) => gcd(a, b))
  const multiple = numbers.reduce((a, b) => (a / gcd(a, b)) * b)
  return [`GCD: ${divisor}`, `LCM: ${multiple}`].join('\n')
}

export const gcdLcm = defineCalc({
  meta: {
    id: 'gcd-lcm',
    name: 'GCD and LCM',
    category: 'calculate',
    description: 'Greatest common divisor and least common multiple.',
    keywords: ['gcd', 'lcm', 'divisor', 'multiple', 'hcf'],
  },
  run,
  fields: [
    { label: 'First number', value: '12' },
    { label: 'Second number', value: '18' },
  ],
  view: (h, { values, out }) => {
    const d = draw(h)
    const [a, b] = [num(values[0]), num(values[1])]
    const g = Number(fact(out, 'GCD'))
    const [cols, rows] = [b / g, a / g]
    const cell = Math.min(260 / cols, 150 / rows)
    const grid = cols <= 30 && rows <= 30
    return column(h, [
      grid
        ? figure(
            h,
            {
              width: 300,
              height: 200,
              label: `A ${b} by ${a} rectangle tiled with squares of side ${g}`,
            },
            [
              ...Array.from({ length: rows * cols }, (_, i) =>
                d.rect({
                  class: 'shape',
                  x: 150 - (cols * cell) / 2 + (i % cols) * cell,
                  y: 100 - (rows * cell) / 2 + Math.floor(i / cols) * cell,
                  width: cell,
                  height: cell,
                }),
              ),
            ],
          )
        : null,
      hero(h, { label: 'GCD', value: String(g), copy: out }),
      tiles(h, [['LCM', fact(out, 'LCM')]]),
    ])
  },
})
