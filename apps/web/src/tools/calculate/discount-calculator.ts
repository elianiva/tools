import { defineTransform } from '../transform.ts'

export const run = (text: string): string => {
  const [price, off] = (text.match(/\d+(?:\.\d+)?/gu) ?? []).map(Number)
  if (price === undefined || off === undefined)
    throw new Error('Enter a price and a percentage off, such as 100 25.')
  const saved = (price * off) / 100
  return [`Sale price: ${(price - saved).toFixed(2)}`, `You save: ${saved.toFixed(2)}`].join('\n')
}

export const discountCalculator = defineTransform({
  meta: {
    id: 'discount-calculator',
    name: 'Discount calculator',
    category: 'calculate',
    description: 'Sale price and savings from a price and a percentage off.',
    keywords: ['sale', 'discount', 'price', 'percent off', 'savings'],
  },
  modes: [{ id: 'run', label: 'Run' }],
  placeholder: 'price, percent off: 100 25',
  example: '100 25',
  fields: [{ label: 'Price' }, { label: 'Percent off', suffix: '%' }],
  run,
})
