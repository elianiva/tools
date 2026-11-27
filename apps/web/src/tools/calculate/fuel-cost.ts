import { hero } from '../generate/ui.ts'
import { defineCalc, money, receipt, tiles } from './money-ui.ts'

export const run = (text: string, mode: string): string => {
  const [distance, efficiency, price] = (text.match(/\d+(?:\.\d+)?/gu) ?? []).map(Number)
  if (distance === undefined || efficiency === undefined || price === undefined || efficiency <= 0)
    throw new Error('Enter distance, fuel efficiency, and price per litre, such as 300 8 15000.')
  const litres = mode === 'kmpl' ? distance / efficiency : (distance * efficiency) / 100
  return [`Fuel: ${litres.toFixed(2)} L`, `Cost: ${(litres * price).toFixed(2)}`].join('\n')
}

export const fuelCost = defineCalc({
  meta: {
    id: 'fuel-cost',
    name: 'Fuel cost',
    category: 'calculate',
    description: 'Fuel used and the cost of a trip.',
    keywords: ['fuel', 'trip', 'cost', 'consumption', 'gas', 'petrol', 'mileage'],
  },
  fields: [
    { label: 'Distance', initial: '300', suffix: 'km' },
    {
      label: 'Efficiency',
      initial: '8',
      suffixByMode: { l100: 'L/100km', kmpl: 'km/L' },
      min: 0.01,
    },
    { label: 'Price per litre', initial: '15000' },
  ],
  modes: [
    { id: 'l100', label: 'L per 100 km' },
    { id: 'kmpl', label: 'km per litre' },
  ],
  modeLabel: 'Efficiency unit',
  run,
  render: (h, { nums, num }) => {
    const [distance = 0] = nums
    const cost = num('Cost')
    const litres = num('Fuel')
    return [
      hero(h, 'Cost', money(cost)),
      receipt(h, [
        { label: 'Fuel', value: `${litres.toFixed(2)} L` },
        { label: 'Price per litre', value: money(nums[2] ?? 0) },
        { label: 'Cost', value: money(cost), strong: true },
      ]),
      tiles(h, [
        ['Cost per km', money(distance === 0 ? 0 : cost / distance)],
        ['Cost per 100 km', money(distance === 0 ? 0 : (cost / distance) * 100)],
      ]),
    ]
  },
})
