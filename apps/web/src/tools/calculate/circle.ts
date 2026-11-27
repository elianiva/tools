import { column, defineCalc, draw, fact, figure, hero, num, tiles } from './ui.ts'

export const run = (text: string, mode: string): string => {
  const value = Number(text.trim())
  if (text.trim() === '' || !Number.isFinite(value) || value <= 0)
    throw new Error('Enter a positive number.')
  const radius = mode === 'diameter' ? value / 2 : value
  const clean = (n: number): number => Number(n.toFixed(4))
  return [
    `Radius: ${clean(radius)}`,
    `Diameter: ${clean(radius * 2)}`,
    `Circumference: ${clean(2 * Math.PI * radius)}`,
    `Area: ${clean(Math.PI * radius ** 2)}`,
  ].join('\n')
}

export const circle = defineCalc({
  meta: {
    id: 'circle',
    name: 'Circle calculator',
    category: 'calculate',
    description: 'Circumference and area from a radius or a diameter.',
    keywords: ['circle', 'radius', 'diameter', 'area', 'circumference', 'pi'],
  },
  run,
  modes: [
    { id: 'radius', label: 'Radius', fields: [{ label: 'Radius', value: '5' }] },
    { id: 'diameter', label: 'Diameter', fields: [{ label: 'Diameter', value: '10' }] },
  ],
  view: (h, { values, mode, out }) => {
    const d = draw(h)
    const given = num(values[0])
    const spanned = mode === 'diameter'
    return column(h, [
      figure(h, { width: 300, height: 220, label: 'A circle with its radius or diameter marked' }, [
        d.circle({ class: 'shape', cx: 150, cy: 110, r: 90 }),
        d.line({
          class: 'ink',
          x1: spanned ? 60 : 150,
          y1: 110,
          x2: 240,
          y2: 110,
        }),
        d.circle({ class: 'dot', cx: 150, cy: 110, r: 4 }),
        d.text(
          { class: 'val mid', x: spanned ? 150 : 195, y: 102 },
          `${spanned ? 'd' : 'r'} = ${given}`,
        ),
      ]),
      hero(h, { label: 'Area', value: fact(out, 'Area'), copy: out }),
      tiles(h, [
        ['Radius', fact(out, 'Radius')],
        ['Diameter', fact(out, 'Diameter')],
        ['Circumference', fact(out, 'Circumference')],
      ]),
    ])
  },
})
