import { hero } from '../generate/ui.ts'
import { defineCalc, money, receipt, splitBar } from './money-ui.ts'

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

export const vatCalculator = defineCalc({
  meta: {
    id: 'vat-calculator',
    name: 'VAT calculator',
    category: 'calculate',
    description: 'Add VAT to a net price or take it out of a gross price.',
    keywords: ['vat', 'gst', 'sales tax', 'tax', 'net', 'gross'],
  },
  fields: [
    { label: 'Amount', initial: '100' },
    { label: 'Rate', initial: '11', suffix: '%', presets: ['5', '10', '11', '12', '20'] },
  ],
  modes: [
    { id: 'add', label: 'Add VAT' },
    { id: 'remove', label: 'Remove VAT' },
  ],
  run,
  render: (h, { nums, num }) => {
    const [, rate = 0] = nums
    const net = num('Net')
    const vat = num('VAT')
    const gross = num('Gross')
    return [
      hero(h, 'Gross', money(gross)),
      receipt(h, [
        { label: 'Net', value: money(net) },
        { label: `VAT (${rate}%)`, value: money(vat), sign: '+' },
        { label: 'Gross', value: money(gross), strong: true },
      ]),
      splitBar(h, 'Share of gross', [
        { label: 'Net', value: net, text: money(net), tone: 'info' },
        { label: 'VAT', value: vat, text: money(vat), tone: 'warn' },
      ]),
    ]
  },
})
