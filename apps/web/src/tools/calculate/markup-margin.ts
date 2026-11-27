import { hero } from '../generate/ui.ts'
import { defineCalc, money, percent, splitBar, tiles } from './money-ui.ts'

export const run = (text: string): string => {
  const [cost, price] = (text.match(/\d+(?:\.\d+)?/gu) ?? []).map(Number)
  if (cost === undefined || price === undefined || cost <= 0 || price <= 0)
    throw new Error('Enter a cost and a price above zero, such as 60 100.')
  const profit = price - cost
  return [
    `Profit: ${profit.toFixed(2)}`,
    `Margin: ${((profit / price) * 100).toFixed(2)}%`,
    `Markup: ${((profit / cost) * 100).toFixed(2)}%`,
  ].join('\n')
}

export const markupMargin = defineCalc({
  meta: {
    id: 'markup-margin',
    name: 'Markup and margin',
    category: 'calculate',
    description: 'Profit, margin, and markup from a cost and a price.',
    keywords: ['margin', 'markup', 'profit', 'cost', 'price', 'pricing'],
  },
  fields: [
    { label: 'Cost', initial: '60' },
    { label: 'Price', initial: '100' },
  ],
  run,
  render: (h, { nums, num }) => {
    const [cost = 0, price = 0] = nums
    const profit = num('Profit')
    return [
      hero(h, 'Profit', money(profit)),
      splitBar(h, 'Price', [
        { label: 'Cost', value: cost, text: money(cost), tone: 'info' },
        {
          label: 'Profit',
          value: profit,
          text: money(profit),
          tone: profit >= 0 ? 'ok' : 'danger',
        },
      ]),
      tiles(h, [
        ['Margin', percent(num('Margin'))],
        ['Markup', percent(num('Markup'))],
        ['Price', money(price)],
      ]),
    ]
  },
})
