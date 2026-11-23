import { defineTransform } from '../transform.ts'

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

export const breakEven = defineTransform({
  meta: {
    id: 'break-even',
    name: 'Break-even point',
    category: 'calculate',
    description: 'Units you must sell to cover fixed costs.',
    keywords: ['break even', 'fixed cost', 'variable cost', 'business', 'profit'],
  },
  modes: [{ id: 'run', label: 'Run' }],
  placeholder: 'fixed costs, price per unit, variable cost per unit: 1000 25 15',
  example: '1000 25 15',
  run,
})
