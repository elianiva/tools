import { column, defineCalc, draw, fact, figure, hero, num, tiles } from './ui.ts'

export const run = (text: string): string => {
  const [n, r] = (text.match(/\d+/gu) ?? []).map(Number)
  if (n === undefined || r === undefined) throw new Error('Enter n and r, such as 52 5.')
  if (n > 1000) throw new Error('n can be up to 1000.')
  if (r > n) throw new Error('r cannot be larger than n.')
  let permutations = 1n
  for (let i = 0; i < r; i += 1) permutations *= BigInt(n - i)
  let factorial = 1n
  for (let i = 2n; i <= BigInt(r); i += 1n) factorial *= i
  return `Combinations: ${permutations / factorial}\nPermutations: ${permutations}`
}

export const combinatorics = defineCalc({
  meta: {
    id: 'combinatorics',
    name: 'Combinations and permutations',
    category: 'calculate',
    description: 'nCr and nPr, exactly.',
    keywords: ['combinations', 'permutations', 'ncr', 'npr', 'choose', 'probability'],
  },
  run,
  fields: [
    { label: 'Items (n)', value: '52' },
    { label: 'Chosen (r)', value: '5' },
  ],
  view: (h, { values, out }) => {
    const d = draw(h)
    const [n, r] = [num(values[0]), num(values[1])]
    const per = 13
    const rows = Math.ceil(n / per)
    const dots = Array.from({ length: n }, (_, i) =>
      d.circle({
        class: i < r ? 'dot' : 'well',
        cx: 20 + (i % per) * 22,
        cy: 16 + Math.floor(i / per) * 22,
        r: 8,
      }),
    )
    return column(h, [
      n <= 104
        ? figure(
            h,
            { width: 300, height: rows * 22 + 10, label: `${r} of ${n} items chosen` },
            dots,
          )
        : null,
      hero(h, { label: `${n}C${r}`, value: fact(out, 'Combinations'), copy: out }),
      tiles(h, [['Permutations', fact(out, 'Permutations')]]),
    ])
  },
})
