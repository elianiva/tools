import { card, defineForm, errorText, linked, page, parseLines, rows, spaced } from './ui.ts'

export const run = (text: string, mode: string): string => {
  const clean = text.trim().replaceAll(/[_\s]/gu, '').toLowerCase()
  const negative = clean.startsWith('-')
  const prefixes: Readonly<Record<string, string>> = { dec: '', hex: '0x', bin: '0b', oct: '0o' }
  const digits: Readonly<Record<string, RegExp>> = {
    dec: /^\d+$/u,
    hex: /^[0-9a-f]+$/u,
    bin: /^[01]+$/u,
    oct: /^[0-7]+$/u,
  }
  const prefix = prefixes[mode] ?? ''
  let body = clean.replace(/^-/u, '')
  if (prefix !== '' && body.startsWith(prefix)) body = body.slice(2)
  if (!(digits[mode] ?? digits['dec'])?.test(body))
    throw new Error('This is not a valid number in that base.')
  const raw = BigInt(`${prefix}${body}`)
  const value = negative ? -raw : raw
  return [
    `Decimal: ${value.toString(10)}`,
    `Hex: ${value.toString(16)}`,
    `Binary: ${value.toString(2)}`,
    `Octal: ${value.toString(8)}`,
  ].join('\n')
}

export const baseConverter = defineForm({
  meta: {
    id: 'base-converter',
    name: 'Number base converter',
    category: 'convert',
    description: 'Binary, octal, decimal, and hexadecimal side by side.',
    keywords: ['binary', 'hex', 'octal', 'decimal', 'radix', 'base'],
  },
  init: { src: 'dec', text: '255' },
  view: (form, h) => {
    const pair = linked(
      h,
      form,
      [
        { key: 'dec', label: 'Decimal', suffix: '10' },
        { key: 'hex', label: 'Hexadecimal', suffix: '16' },
        { key: 'bin', label: 'Binary', suffix: '2' },
        { key: 'oct', label: 'Octal', suffix: '8' },
      ],
      (src, text) => {
        const out = parseLines(run(text, src))
        return {
          dec: out['Decimal'] ?? '',
          hex: out['Hex'] ?? '',
          bin: out['Binary'] ?? '',
          oct: out['Octal'] ?? '',
        }
      },
    )
    const v = pair.values
    return page(h, [
      card(h, null, [pair.fields, errorText(h, pair.error)]),
      v['bin'] === undefined
        ? null
        : card(h, 'Grouped', [
            rows(h, [
              ['Binary', spaced(v['bin'] ?? '', 4)],
              ['Hexadecimal', spaced(v['hex'] ?? '', 2).toUpperCase()],
              ['Decimal', Number(v['dec']).toLocaleString('en')],
              ['Octal', spaced(v['oct'] ?? '', 3)],
              ['Bits', String((v['bin'] ?? '').replace('-', '').length)],
            ]),
          ]),
    ])
  },
})
