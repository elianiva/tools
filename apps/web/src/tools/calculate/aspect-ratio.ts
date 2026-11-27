import { column, defineCalc, draw, fact, figure, hero, num, tiles } from './ui.ts'

export const run = (text: string): string => {
  const [width, height] = (text.match(/\d+(?:\.\d+)?/gu) ?? []).map(Number)
  if (width === undefined || height === undefined || width <= 0 || height <= 0)
    throw new Error('Enter a width and a height, such as 1920 1080.')
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b))
  const divisor = Number.isInteger(width) && Number.isInteger(height) ? gcd(width, height) : 1
  return [
    `Ratio: ${width / divisor}:${height / divisor}`,
    `Decimal: ${(width / height).toFixed(2)}`,
  ].join('\n')
}

export const aspectRatio = defineCalc({
  meta: {
    id: 'aspect-ratio',
    name: 'Aspect ratio',
    category: 'calculate',
    description: 'The simplest ratio of a width and a height.',
    keywords: ['aspect ratio', '16:9', 'resolution', 'screen', 'ratio'],
  },
  run,
  fields: [
    { label: 'Width', value: '1920', suffix: 'px' },
    { label: 'Height', value: '1080', suffix: 'px' },
  ],
  view: (h, { values, out }) => {
    const d = draw(h)
    const [width, height] = [num(values[0]), num(values[1])]
    const scale = Math.min(240 / width, 150 / height)
    const [w, t] = [width * scale, height * scale]
    const [x, y] = [150 - w / 2, 105 - t / 2]
    return column(h, [
      figure(h, { width: 300, height: 220, label: 'A rectangle in the same proportion' }, [
        d.rect({ class: 'shape', x, y, width: w, height: t, rx: 4 }),
        d.text({ class: 'val mid', x: 150, y: 110 }, fact(out, 'Ratio')),
        d.text({ class: 'lbl mid', x: 150, y: y + t + 18 }, `${width}`),
        d.text({ class: 'lbl', x: x + w + 8, y: 109 }, `${height}`),
      ]),
      hero(h, { label: 'Ratio', value: fact(out, 'Ratio'), copy: out }),
      tiles(h, [['Decimal', fact(out, 'Decimal')]]),
    ])
  },
})
