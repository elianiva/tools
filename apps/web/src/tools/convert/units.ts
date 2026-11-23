import { defineTransform } from '../transform.ts'
import { convertUnits } from './units.logic.ts'

export const units = defineTransform({
  meta: {
    id: 'units',
    name: 'Unit converter',
    category: 'convert',
    description: 'Length, weight, volume, temperature and data sizes. Type 5 km.',
    keywords: [
      'length',
      'weight',
      'volume',
      'temperature',
      'celsius',
      'fahrenheit',
      'bytes',
      'metric',
      'imperial',
    ],
  },
  modes: [{ id: 'all', label: 'All' }],
  placeholder: '5 km',
  example: '5 km',
  fields: [{ label: 'Value' }, { label: 'Unit', kind: 'text' }],
  run: (text) => convertUnits(text),
})
