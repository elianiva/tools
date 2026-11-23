import { defineTransform } from '../transform.ts'

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

export const combinatorics = defineTransform({
  meta: {
    id: 'combinatorics',
    name: 'Combinations and permutations',
    category: 'calculate',
    description: 'nCr and nPr, exactly.',
    keywords: ['combinations', 'permutations', 'ncr', 'npr', 'choose', 'probability'],
  },
  modes: [{ id: 'run', label: 'Run' }],
  placeholder: 'n and r: 52 5',
  example: '52 5',
  fields: [{ label: 'Items (n)' }, { label: 'Chosen (r)' }],
  run,
})
