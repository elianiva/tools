import type { Html } from 'foldkit/html'
import { chipCls, chipRowCls, column, defineCalc, draw, figure, fmt, hero, tiles } from './ui.ts'

export const run = (text: string): string => {
  const clean = text.trim().replaceAll(/[,_\s]/gu, '')
  if (!/^\d+$/u.test(clean)) throw new Error('Enter a whole number.')
  const value = Number(clean)
  if (value > 1_000_000_000_000) throw new Error('This tool goes up to 1,000,000,000,000.')
  if (value < 2) return `${value} is neither prime nor composite`
  let rest = value
  const factors = new Map<number, number>()
  for (let divisor = 2; divisor * divisor <= rest; divisor += divisor === 2 ? 1 : 2) {
    while (rest % divisor === 0) {
      factors.set(divisor, (factors.get(divisor) ?? 0) + 1)
      rest /= divisor
    }
  }
  if (rest > 1) factors.set(rest, (factors.get(rest) ?? 0) + 1)
  if (factors.size === 1 && factors.get(value) === 1) return `${value} is prime`
  return `${value} = ${[...factors].map(([prime, power]) => (power === 1 ? String(prime) : `${prime}^${power}`)).join(' × ')}`
}

export const primeFactors = defineCalc({
  meta: {
    id: 'prime-factors',
    name: 'Prime factors',
    category: 'calculate',
    description: 'Check if a number is prime and factor it.',
    keywords: ['prime', 'factor', 'divisors', 'composite'],
  },
  run,
  fields: [{ label: 'Number', value: '84' }],
  view: (h, { out }) => {
    const d = draw(h)
    const split = out.split(' = ')
    const parts = split[1]?.split(' × ') ?? []
    if (parts.length === 0) return column(h, [hero(h, { label: 'Result', value: out, copy: out })])
    const powers = parts.map((part) => {
      const [prime = '', power = '1'] = part.split('^')
      return [Number(prime), Number(power)] as const
    })
    const primes = powers.flatMap(([prime, power]) => Array.from({ length: power }, () => prime))
    const divisors = powers.reduce((total, [, power]) => total * (power + 1), 1)
    const value = Number(split[0])
    const chips = powers.map(([prime, power]) =>
      h.span([h.Class(chipCls)], [String(prime), power > 1 ? h.sup([], [String(power)]) : '']),
    )
    // A factor tree: each composite node splits into one prime and what is left.
    const tree: Array<Html> = []
    if (primes.length <= 8) {
      let rest = value
      primes.forEach((prime, i) => {
        const y = 28 + i * 34
        const last = i === primes.length - 1
        if (last) {
          tree.push(
            d.circle({ class: 'dot', cx: 150, cy: y, r: 12 }),
            d.text({ class: 'lbl mid', x: 150, y: y + 4, fill: 'white' }, String(prime)),
          )
          return
        }
        tree.push(
          d.text({ class: 'val mid', x: 150, y: y + 4 }, fmt(rest, 0)),
          d.line({ class: 'axis', x1: 140, y1: y + 10, x2: 110, y2: y + 24 }),
          d.circle({ class: 'dot', cx: 102, cy: y + 28, r: 11 }),
          d.text({ class: 'lbl mid', x: 102, y: y + 32, fill: 'white' }, String(prime)),
          d.line({ class: 'axis', x1: 150, y1: y + 10, x2: 150, y2: y + 20 }),
        )
        rest /= prime
      })
    }
    return column(h, [
      hero(h, { label: 'Prime factors', value: primes.join(' × '), sub: out, copy: out }),
      h.div([h.Class(chipRowCls)], chips),
      tree.length === 0
        ? null
        : figure(
            h,
            { width: 300, height: primes.length * 34 + 16, label: 'The factor tree' },
            tree,
          ),
      tiles(h, [
        ['Distinct primes', String(powers.length)],
        ['Total factors', String(primes.length)],
        ['Divisors', String(divisors)],
      ]),
    ])
  },
})
