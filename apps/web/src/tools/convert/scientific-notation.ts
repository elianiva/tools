import { card, defineForm, errorText, linked, page, rows } from './ui.ts'

export const run = (text: string, mode: string): string => {
  if (mode === 'to-decimal') {
    const match = /^\s*(-?\d+(?:\.\d+)?)\s*(?:[x×*]\s*10\s*\^\s*(-?\d+)|e\s*(-?\d+))\s*$/iu.exec(
      text,
    )
    if (match === null) throw new Error('Use a form such as 1.5 × 10^3 or 1.5e3.')
    const exponent = Number(match[2] ?? match[3])
    if (Math.abs(exponent) > 20) throw new Error('Use an exponent between -20 and 20.')
    return Number(`${match[1]}e${exponent}`).toLocaleString('en-US', {
      useGrouping: false,
      maximumFractionDigits: 20,
    })
  }
  const value = Number(text.trim().replaceAll(/[,_\s]/gu, ''))
  if (text.trim() === '' || !Number.isFinite(value)) throw new Error('Enter a number.')
  const [mantissa = '0', exponent = '0'] = value.toExponential().split('e')
  return `${mantissa} × 10^${Number(exponent)}`
}

export const scientificNotation = defineForm({
  meta: {
    id: 'scientific-notation',
    name: 'Scientific notation',
    category: 'convert',
    description: 'Write numbers as a × 10^n and read them back.',
    keywords: ['scientific notation', 'exponent', 'standard form', 'e notation'],
  },
  init: { src: 'dec', text: '12345' },
  view: (form, h) => {
    const pair = linked(
      h,
      form,
      [
        { key: 'dec', label: 'Decimal' },
        { key: 'sci', label: 'Scientific' },
      ],
      (src, text) =>
        src === 'dec' ? { sci: run(text, 'to-scientific') } : { dec: run(text, 'to-decimal') },
    )
    const decimal = Number((pair.values['dec'] ?? form.get('text')).replaceAll(/[,_\s]/gu, ''))
    return page(h, [
      card(h, null, [pair.fields, errorText(h, pair.error)]),
      pair.error !== '' || !Number.isFinite(decimal) || form.get('text').trim() === ''
        ? null
        : card(h, null, [
            rows(h, [
              ['E notation', decimal.toExponential().replace('e+', 'e')],
              ['Engineering', engineering(decimal)],
            ]),
          ]),
    ])
  },
})

const engineering = (value: number): string => {
  if (value === 0) return '0 × 10^0'
  const exponent = Math.floor(Math.log10(Math.abs(value)) / 3) * 3
  return `${Number((value / 10 ** exponent).toPrecision(10))} × 10^${exponent}`
}
