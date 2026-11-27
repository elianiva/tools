import { hero } from '../generate/ui.ts'
import { defineCalc, lineChart, money, receipt } from './money-ui.ts'

export const run = (text: string): string => {
  const [fixed, price, variable] = (text.match(/\d+(?:\.\d+)?/gu) ?? []).map(Number)
  if (fixed === undefined || price === undefined || variable === undefined)
    throw new Error('Enter fixed costs, price per unit, and variable cost per unit.')
  if (price <= variable) throw new Error('Price must be higher than the variable cost.')
  const units = Math.ceil(fixed / (price - variable))
  return [
    `Break-even units: ${units}`,
    `Revenue at break-even: ${(units * price).toFixed(2)}`,
  ].join('\n')
}

export const breakEven = defineCalc({
  meta: {
    id: 'break-even',
    name: 'Break-even point',
    category: 'calculate',
    description: 'Units you must sell to cover fixed costs.',
    keywords: ['break even', 'fixed cost', 'variable cost', 'business', 'profit'],
  },
  fields: [
    { label: 'Fixed costs', initial: '1000' },
    { label: 'Price per unit', initial: '25' },
    { label: 'Variable cost per unit', initial: '15' },
  ],
  run,
  render: (h, { nums, num }) => {
    const [fixed = 0, price = 0, variable = 0] = nums
    const units = num('Break-even units')
    const xMax = Math.max(units * 2, 10)
    const revenue = (x: number): number => price * x
    const cost = (x: number): number => fixed + variable * x
    return [
      hero(h, 'Break-even units', String(units), [
        h.span([], [`${money(price - variable)} contribution per unit`]),
      ]),
      lineChart(h, {
        title: 'Revenue and total cost',
        series: [
          {
            label: 'Revenue',
            tone: 'ok',
            points: [
              [0, 0],
              [xMax, revenue(xMax)],
            ],
          },
          {
            label: 'Total cost',
            tone: 'danger',
            points: [
              [0, cost(0)],
              [xMax, cost(xMax)],
            ],
          },
        ],
        xMax,
        ticks: [
          [0, '0'],
          [xMax / 2, String(Math.round(xMax / 2))],
          [xMax, String(Math.round(xMax))],
        ],
        mark: { x: units, y: revenue(units), label: `${units} units` },
      }),
      receipt(h, [
        { label: 'Revenue at break-even', value: money(num('Revenue at break-even')) },
        { label: 'Fixed costs', value: money(fixed) },
        { label: `Variable costs (${units} × ${money(variable)})`, value: money(variable * units) },
      ]),
    ]
  },
})
