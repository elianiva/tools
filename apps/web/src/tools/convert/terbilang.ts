import { segmented } from '../kit.ts'
import { card, defineForm, errorText, field, hero, page } from './ui.ts'

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

export const terbilang = defineForm({
  meta: {
    id: 'terbilang',
    name: 'Terbilang',
    category: 'convert',
    description: 'Write a number out in Indonesian words.',
    keywords: ['terbilang', 'indonesian', 'rupiah', 'number words', 'kuitansi', 'bahasa'],
  },
  init: { n: '1.234.567', mode: 'rupiah' },
  view: (form, h) => {
    const text = form.get('n')
    const mode = form.get('mode')
    let words = ''
    let error = ''
    if (text.trim() !== '') {
      try {
        words = run(text, mode)
      } catch (caught) {
        error = caught instanceof Error ? caught.message : ''
      }
    }
    return page(h, [
      card(h, null, [
        field(h, {
          id: 'n',
          label: 'Angka',
          value: text,
          inputMode: 'numeric',
          invalid: error !== '',
          onInput: form.set('n'),
        }),
        segmented(h, {
          label: 'Format',
          value: mode,
          options: [
            { value: 'plain', label: 'Words only' },
            { value: 'rupiah', label: 'With rupiah' },
          ],
          onSelect: (value) => form.patch({ mode: value }),
        }),
        errorText(h, error),
      ]),
      hero(h, 'Terbilang', words),
    ])
  },
})
