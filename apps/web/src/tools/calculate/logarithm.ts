import { column, defineCalc, fact, fmt, hero, num, plot, tiles } from './ui.ts'

export const run = (text: string): string => {
  const value = Number(text.trim())
  if (text.trim() === '' || !Number.isFinite(value) || value <= 0)
    throw new Error('Enter a number above zero.')
  const clean = (n: number): number => Number(n.toFixed(6))
  return [
    `log10: ${clean(Math.log10(value))}`,
    `ln: ${clean(Math.log(value))}`,
    `log2: ${clean(Math.log2(value))}`,
  ].join('\n')
}

export const logarithm = defineCalc({
  meta: {
    id: 'logarithm',
    name: 'Logarithm calculator',
    category: 'calculate',
    description: 'Base 10, natural, and base 2 logarithms.',
    keywords: ['log', 'ln', 'log2', 'log10', 'logarithm', 'natural log'],
  },
  run,
  fields: [{ label: 'Number', value: '1000' }],
  view: (h, { values, out }) => {
    const value = num(values[0])
    const l = Math.log10(value)
    return column(h, [
      plot(h, {
        label: 'The base 10 logarithm curve with the number marked',
        x: [0, value * 1.4],
        y: [Math.min(l, 0) - 1, Math.max(l, 1) + 1],
        fns: [Math.log10],
        segments: [
          { from: [value, 0], to: [value, l] },
          { from: [0, l], to: [value, l] },
        ],
        points: [{ x: value, y: l, label: `log10 ${fmt(l, 3)}` }],
      }),
      hero(h, { label: 'log10', value: fact(out, 'log10'), copy: out }),
      tiles(h, [
        ['ln', fact(out, 'ln')],
        ['log2', fact(out, 'log2')],
      ]),
    ])
  },
})
