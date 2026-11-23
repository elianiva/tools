import { defineTransform } from '../transform.ts'

export const run = (text: string, mode: string): string => {
  const [amount, rate] = (text.match(/\d+(?:\.\d+)?/gu) ?? []).map(Number)
  if (amount === undefined || rate === undefined)
    throw new Error('Enter an amount and a tax rate in percent, such as 100 11.')
  const net = mode === 'remove' ? amount / (1 + rate / 100) : amount
  const gross = mode === 'remove' ? amount : amount * (1 + rate / 100)
  return [
    `Net: ${net.toFixed(2)}`,
    `VAT: ${(gross - net).toFixed(2)}`,
    `Gross: ${gross.toFixed(2)}`,
  ].join('\n')
}

export const vatCalculator = defineTransform({
  meta: {
    id: 'vat-calculator',
    name: 'VAT calculator',
    category: 'calculate',
    description: 'Add VAT to a net price or take it out of a gross price.',
    keywords: ['vat', 'gst', 'sales tax', 'tax', 'net', 'gross'],
  },
  modes: [
    { id: 'add', label: 'Add VAT' },
    { id: 'remove', label: 'Remove VAT' },
  ],
  placeholder: 'amount and rate %: 100 11',
  example: '100 11',
  fields: [{ label: 'Amount' }, { label: 'Rate', suffix: '%' }],
  run,
})
