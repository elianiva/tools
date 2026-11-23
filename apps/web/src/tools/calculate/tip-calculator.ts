import { defineTransform } from '../transform.ts'

export const run = (text: string): string => {
  const [bill, tip, people = 1] = (text.match(/\d+(?:\.\d+)?/gu) ?? []).map(Number)
  if (bill === undefined || tip === undefined || people < 1)
    throw new Error('Enter bill, tip percent, and optionally the number of people.')
  const tipAmount = (bill * tip) / 100
  const total = bill + tipAmount
  return [
    `Tip: ${tipAmount.toFixed(2)}`,
    `Total: ${total.toFixed(2)}`,
    `Per person: ${(total / people).toFixed(2)}`,
  ].join('\n')
}

export const tipCalculator = defineTransform({
  meta: {
    id: 'tip-calculator',
    name: 'Tip calculator',
    category: 'calculate',
    description: 'Tip, total, and the share per person.',
    keywords: ['tip', 'bill', 'split', 'restaurant', 'gratuity'],
  },
  modes: [{ id: 'run', label: 'Run' }],
  placeholder: 'bill, tip %, people: 100 20 4',
  example: '100 20 4',
  fields: [{ label: 'Bill' }, { label: 'Tip', suffix: '%' }, { label: 'People' }],
  run,
})
