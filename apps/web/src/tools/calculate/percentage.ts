import { defineTransform } from '../transform.ts'
import { percentage } from './percentage.logic.ts'

export const percentageCalculator = defineTransform({
  meta: {
    id: 'percentage',
    name: 'Percentage calculator',
    category: 'calculate',
    description: 'Share, ratio, change and markup. Type 20% of 150.',
    keywords: ['percent', 'discount', 'increase', 'decrease', 'change', 'tip'],
  },
  modes: [{ id: 'calc', label: 'Calculate' }],
  placeholder: '20% of 150',
  example: '20% of 150',
  present: 'display',
  run: (text) => percentage(text),
})
