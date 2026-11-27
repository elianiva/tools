import { column, defineCalc, draw, fact, figure, fmt, hero, num, tiles } from './ui.ts'

export const run = (text: string): string => {
  const value = Number(text.trim())
  if (text.trim() === '' || !Number.isFinite(value)) throw new Error('Enter a number.')
  const clean = (n: number): number => Number(n.toFixed(6))
  return [
    `Square root: ${value < 0 ? 'not a real number' : clean(Math.sqrt(value))}`,
    `Cube root: ${clean(Math.cbrt(value))}`,
    `Square: ${clean(value ** 2)}`,
    `Cube: ${clean(value ** 3)}`,
  ].join('\n')
}

export const squareRoot = defineCalc({
  meta: {
    id: 'square-root',
    name: 'Roots and powers',
    category: 'calculate',
    description: 'Square root, cube root, square, and cube of a number.',
    keywords: ['sqrt', 'cube root', 'square', 'cube', 'power', 'root'],
  },
  run,
  fields: [{ label: 'Number', value: '16' }],
  view: (h, { values, out }) => {
    const d = draw(h)
    const value = num(values[0])
    const root = Math.sqrt(value)
    const real = value >= 0
    const side = real ? Math.max(20, Math.min(150, (root / Math.max(root, 1)) * 150)) : 0
    return column(h, [
      real
        ? figure(h, { width: 300, height: 200, label: 'A square whose area is the number' }, [
            d.rect({
              class: 'shape',
              x: 150 - side / 2,
              y: 100 - side / 2,
              width: side,
              height: side,
            }),
            d.text({ class: 'val mid', x: 150, y: 104 }, `area ${fmt(value, 4)}`),
            d.text({ class: 'lbl mid', x: 150, y: 100 + side / 2 + 18 }, `side ${fmt(root, 4)}`),
          ])
        : null,
      hero(h, { label: 'Square root', value: fact(out, 'Square root'), copy: out }),
      tiles(h, [
        ['Cube root', fact(out, 'Cube root')],
        ['Square', fact(out, 'Square')],
        ['Cube', fact(out, 'Cube')],
      ]),
    ])
  },
})
