import { defineTransform } from '../transform.ts'

export const run = (text: string, mode: string): string => {
  const [distance, efficiency, price] = (text.match(/\d+(?:\.\d+)?/gu) ?? []).map(Number)
  if (distance === undefined || efficiency === undefined || price === undefined || efficiency <= 0)
    throw new Error('Enter distance, fuel efficiency, and price per litre, such as 300 8 15000.')
  const litres = mode === 'kmpl' ? distance / efficiency : (distance * efficiency) / 100
  return [`Fuel: ${litres.toFixed(2)} L`, `Cost: ${(litres * price).toFixed(2)}`].join('\n')
}

export const fuelCost = defineTransform({
  meta: {
    id: 'fuel-cost',
    name: 'Fuel cost',
    category: 'calculate',
    description: 'Fuel used and the cost of a trip.',
    keywords: ['fuel', 'trip', 'cost', 'consumption', 'gas', 'petrol', 'mileage'],
  },
  modes: [
    { id: 'l100', label: 'L per 100 km' },
    { id: 'kmpl', label: 'km per litre' },
  ],
  placeholder: 'distance, efficiency, price per litre: 300 8 15000',
  example: '300 8 15000',
  run,
})
