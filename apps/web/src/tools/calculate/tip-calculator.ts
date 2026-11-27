import { hero } from '../generate/ui.ts'
import { defineCalc, money, receipt } from './money-ui.ts'

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

export const tipCalculator = defineCalc({
  meta: {
    id: 'tip-calculator',
    name: 'Tip calculator',
    category: 'calculate',
    description: 'Tip, total, and the share per person.',
    keywords: ['tip', 'bill', 'split', 'restaurant', 'gratuity'],
  },
  fields: [
    { label: 'Bill', initial: '100' },
    { label: 'Tip', initial: '20', suffix: '%', presets: ['10', '15', '18', '20', '25'] },
    { label: 'People', initial: '4', integer: true, min: 1, max: 1000 },
  ],
  run,
  render: (h, { nums, num }) => {
    const [bill = 0, tip = 0, people = 1] = nums
    const total = num('Total')
    return [
      hero(h, people > 1 ? 'Per person' : 'Total', money(num('Per person'))),
      receipt(h, [
        { label: 'Bill', value: money(bill) },
        { label: `Tip (${tip}%)`, value: money(num('Tip')), sign: '+' },
        { label: 'Total', value: money(total), strong: true },
        ...(people > 1
          ? [{ label: `Split ${people} ways`, value: money(num('Per person')), strong: true }]
          : []),
      ]),
    ]
  },
})
