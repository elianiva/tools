import { column, defineCalc, draw, fact, figure, hero, num, tiles } from './ui.ts'

export const run = (text: string): string => {
  const radius = Number(text.trim())
  if (text.trim() === '' || !Number.isFinite(radius) || radius <= 0)
    throw new Error('Enter a radius above zero.')
  const clean = (n: number): number => Number(n.toFixed(4))
  return [
    `Volume: ${clean((4 / 3) * Math.PI * radius ** 3)}`,
    `Surface area: ${clean(4 * Math.PI * radius ** 2)}`,
  ].join('\n')
}

export const sphere = defineCalc({
  meta: {
    id: 'sphere',
    name: 'Sphere calculator',
    category: 'calculate',
    description: 'Volume and surface area of a sphere from its radius.',
    keywords: ['sphere', 'volume', 'surface area', 'radius', 'ball', 'geometry'],
  },
  run,
  fields: [{ label: 'Radius', value: '3' }],
  view: (h, { values, out }) => {
    const d = draw(h)
    return column(h, [
      figure(h, { width: 300, height: 220, label: 'A sphere with its radius marked' }, [
        d.circle({ class: 'shape', cx: 150, cy: 110, r: 90 }),
        d.ellipse({ class: 'dash', cx: 150, cy: 110, rx: 90, ry: 26 }),
        d.line({ class: 'ink', x1: 150, y1: 110, x2: 240, y2: 110 }),
        d.circle({ class: 'dot', cx: 150, cy: 110, r: 4 }),
        d.text({ class: 'val mid', x: 195, y: 102 }, `r = ${num(values[0])}`),
      ]),
      hero(h, { label: 'Volume', value: fact(out, 'Volume'), copy: out }),
      tiles(h, [['Surface area', fact(out, 'Surface area')]]),
    ])
  },
})
