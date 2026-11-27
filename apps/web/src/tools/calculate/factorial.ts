import { column, defineCalc, fmt, hero, num, tiles } from './ui.ts'
import { output } from '../kit.ts'

export const run = (text: string): string => {
  const clean = text.trim().replaceAll(/[,_\s]/gu, '')
  if (!/^\d+$/u.test(clean)) throw new Error('Enter a whole number.')
  const n = Number(clean)
  if (n > 1000) throw new Error('This tool goes up to 1000.')
  let result = 1n
  for (let i = 2n; i <= BigInt(n); i += 1n) result *= i
  return result.toString()
}

export const factorial = defineCalc({
  meta: {
    id: 'factorial',
    name: 'Factorial',
    category: 'calculate',
    description: 'n! for any whole number up to 1000, exactly.',
    keywords: ['factorial', 'n!', 'product', 'big number'],
  },
  run,
  fields: [{ label: 'Number', value: '20' }],
  acceptsFiles: true,
  view: (h, { values, out }) => {
    const n = num((values[0] ?? '').replaceAll(/[,_\s]/gu, ''))
    const digits = out.length
    const zeros = out.length - out.replace(/0+$/u, '').length
    const short = digits <= 16 ? out : `${out[0]}.${out.slice(1, 6)} × 10^${digits - 1}`
    const product =
      n <= 1
        ? '1'
        : n <= 6
          ? Array.from({ length: n }, (_, i) => n - i).join(' × ')
          : `${n} × ${n - 1} × ${n - 2} × … × 1`
    return column(h, [
      hero(h, { label: `${fmt(n, 0)}!`, value: short, sub: product, copy: out }),
      tiles(h, [
        ['Digits', String(digits)],
        ['Trailing zeros', String(zeros)],
      ]),
      digits > 16 ? output(h, { label: 'Exact value', value: out }) : null,
    ])
  },
})
