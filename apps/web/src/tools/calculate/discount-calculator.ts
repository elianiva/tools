import { hero } from '../generate/ui.ts'
import { defineCalc, money, receipt, splitBar } from './money-ui.ts'

export const run = (text: string): string => {
  const [price, off] = (text.match(/\d+(?:\.\d+)?/gu) ?? []).map(Number)
  if (price === undefined || off === undefined)
    throw new Error('Enter a price and a percentage off, such as 100 25.')
  const saved = (price * off) / 100
  return [`Sale price: ${(price - saved).toFixed(2)}`, `You save: ${saved.toFixed(2)}`].join('\n')
}

export const discountCalculator = defineCalc({
  meta: {
    id: 'discount-calculator',
    name: 'Discount calculator',
    category: 'calculate',
    description: 'Sale price and savings from a price and a percentage off.',
    keywords: ['sale', 'discount', 'price', 'percent off', 'savings'],
  },
  fields: [
    { label: 'Price', initial: '100' },
    {
      label: 'Percent off',
      initial: '25',
      suffix: '%',
      max: 100,
      presets: ['10', '20', '25', '30', '50'],
    },
  ],
  run,
  render: (h, { nums, num }) => {
    const [price = 0, off = 0] = nums
    const sale = num('Sale price')
    const saved = num('You save')
    return [
      hero(h, 'Sale price', money(sale)),
      receipt(h, [
        { label: 'Price', value: money(price) },
        { label: `Discount (${off}%)`, value: money(saved), sign: '−' },
        { label: 'Sale price', value: money(sale), strong: true },
      ]),
      splitBar(h, 'Where the price goes', [
        { label: 'You pay', value: sale, text: money(sale), tone: 'ok' },
        { label: 'You save', value: saved, text: money(saved), tone: 'warn' },
      ]),
    ]
  },
})
