import { column, defineCalc, draw, figure, hero, tiles } from './ui.ts'

export const run = (text: string): string => {
  const numbers = (text.match(/\d+/gu) ?? []).map(Number)
  if (numbers.length < 2 || numbers.every((value) => value === 0))
    throw new Error('Enter two or more whole numbers, such as 8:12.')
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b))
  const divisor = numbers.reduce(gcd)
  return numbers.map((value) => value / divisor).join(':')
}

export const ratioSimplifier = defineCalc({
  meta: {
    id: 'ratio-simplifier',
    name: 'Ratio simplifier',
    category: 'calculate',
    description: 'Reduce a ratio of two or more numbers to its simplest form.',
    keywords: ['ratio', 'simplify', 'reduce', 'proportion', 'gcd'],
  },
  run,
  fields: [{ label: 'Ratio', value: '8:12', kind: 'text', placeholder: '8:12' }],
  view: (h, { values, out }) => {
    const d = draw(h)
    const given = (values[0] ?? '').match(/\d+/gu)?.map(Number) ?? []
    const parts = out.split(':').map(Number)
    const total = parts.reduce((sum, part) => sum + part, 0)
    let at = 10
    const segments = parts.flatMap((part, i) => {
      const width = total === 0 ? 0 : (part / total) * 280
      const x = at
      at += width
      return [
        d.rect({
          class: i % 2 === 0 ? 'shape' : 'soft',
          x,
          y: 20,
          width,
          height: 36,
          stroke: 'var(--tone)',
        }),
        d.text({ class: 'val mid', x: x + width / 2, y: 43 }, String(part)),
      ]
    })
    const divisor = given[0] !== undefined && parts[0] ? given[0] / parts[0] : 1
    return column(h, [
      figure(h, { width: 300, height: 76, label: 'The ratio as proportional blocks' }, segments),
      hero(h, { label: 'Simplest form', value: out, copy: out }),
      tiles(h, [['Divided by', String(divisor)]]),
    ])
  },
})
