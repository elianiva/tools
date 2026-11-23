import { defineTransform } from '../transform.ts'

export const run = (text: string, mode: string): string => {
  const clean = text.trim().replaceAll(/[.,_\s]/gu, '')
  if (!/^\d+$/u.test(clean)) throw new Error('Enter a whole number, such as 1.234.567.')
  const value = Number(clean)
  if (value >= 1e15) throw new Error('This tool goes up to 999 triliun.')
  const small = [
    'nol',
    'satu',
    'dua',
    'tiga',
    'empat',
    'lima',
    'enam',
    'tujuh',
    'delapan',
    'sembilan',
    'sepuluh',
    'sebelas',
  ]
  const word = (n: number): string => small[n] ?? ''
  const below1000 = (n: number): string => {
    if (n < 12) return word(n)
    if (n < 20) return `${word(n - 10)} belas`
    if (n < 100) return `${word(Math.floor(n / 10))} puluh${n % 10 === 0 ? '' : ` ${word(n % 10)}`}`
    const hundreds = Math.floor(n / 100)
    const rest = n % 100
    return `${hundreds === 1 ? 'seratus' : `${word(hundreds)} ratus`}${rest === 0 ? '' : ` ${below1000(rest)}`}`
  }
  const scales: ReadonlyArray<readonly [number, string]> = [
    [1e12, 'triliun'],
    [1e9, 'miliar'],
    [1e6, 'juta'],
    [1e3, 'ribu'],
  ]
  let rest = value
  const parts: Array<string> = []
  for (const [size, name] of scales) {
    const group = Math.floor(rest / size)
    rest -= group * size
    if (group > 0)
      parts.push(name === 'ribu' && group === 1 ? 'seribu' : `${below1000(group)} ${name}`)
  }
  if (rest > 0) parts.push(below1000(rest))
  const words = value === 0 ? 'nol' : parts.join(' ')
  return mode === 'rupiah' ? `${words} rupiah` : words
}

export const terbilang = defineTransform({
  meta: {
    id: 'terbilang',
    name: 'Terbilang',
    category: 'convert',
    description: 'Write a number out in Indonesian words.',
    keywords: ['terbilang', 'indonesian', 'rupiah', 'number words', 'kuitansi', 'bahasa'],
  },
  modes: [
    { id: 'plain', label: 'Words only' },
    { id: 'rupiah', label: 'With rupiah' },
  ],
  placeholder: '1.234.567',
  example: '1.234.567',
  fields: [{ label: 'Number', kind: 'text' }],
  run,
})
