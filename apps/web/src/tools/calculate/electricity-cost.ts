import { defineTransform } from '../transform.ts'

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

export const electricityCost = defineTransform({
  meta: {
    id: 'electricity-cost',
    name: 'Electricity cost',
    category: 'calculate',
    description: 'What an appliance costs to run.',
    keywords: ['electricity', 'kwh', 'watts', 'appliance', 'power', 'bill', 'energy'],
  },
  modes: [{ id: 'run', label: 'Run' }],
  placeholder: 'watts, hours per day, price per kWh: 1000 5 1500',
  example: '1000 5 1500',
  fields: [
    { label: 'Power', suffix: 'W' },
    { label: 'Hours per day', suffix: 'h' },
    { label: 'Price per kWh' },
  ],
  run,
})
