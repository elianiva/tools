import { hero } from '../generate/ui.ts'
import { compareBars, defineCalc, money } from './money-ui.ts'

export const run = (text: string): string => {
  const [watts, hours, price] = (text.match(/\d+(?:\.\d+)?/gu) ?? []).map(Number)
  if (watts === undefined || hours === undefined || price === undefined)
    throw new Error('Enter watts, hours per day, and price per kWh, such as 1000 5 1500.')
  const kwh = (watts * hours) / 1000
  return [
    `Energy per day: ${kwh.toFixed(2)} kWh`,
    `Cost per day: ${(kwh * price).toFixed(2)}`,
    `Cost per 30 days: ${(kwh * price * 30).toFixed(2)}`,
  ].join('\n')
}

export const electricityCost = defineCalc({
  meta: {
    id: 'electricity-cost',
    name: 'Electricity cost',
    category: 'calculate',
    description: 'What an appliance costs to run.',
    keywords: ['electricity', 'kwh', 'watts', 'appliance', 'power', 'bill', 'energy'],
  },
  fields: [
    { label: 'Power', initial: '1000', suffix: 'W' },
    { label: 'Hours per day', initial: '5', suffix: 'h', max: 24 },
    { label: 'Price per kWh', initial: '1500' },
  ],
  run,
  render: (h, { num }) => {
    const day = num('Cost per day')
    const month = num('Cost per 30 days')
    return [
      hero(h, 'Cost per 30 days', money(month), [
        h.span([], [`${num('Energy per day').toFixed(2)} kWh per day`]),
      ]),
      compareBars(h, 'Cost over time', [
        { label: 'Per day', value: day, text: money(day), tone: 'info' },
        { label: '30 days', value: month, text: money(month), tone: 'ok' },
        { label: '365 days', value: day * 365, text: money(day * 365), tone: 'warn' },
      ]),
    ]
  },
})
