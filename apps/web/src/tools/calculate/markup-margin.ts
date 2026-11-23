import { defineTransform } from '../transform.ts'

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

export const markupMargin = defineTransform({
  meta: {
    id: 'markup-margin',
    name: 'Markup and margin',
    category: 'calculate',
    description: 'Profit, margin, and markup from a cost and a price.',
    keywords: ['margin', 'markup', 'profit', 'cost', 'price', 'pricing'],
  },
  modes: [{ id: 'run', label: 'Run' }],
  placeholder: 'cost and price: 60 100',
  example: '60 100',
  run,
})
