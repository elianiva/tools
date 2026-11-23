import { defineTransform } from '../transform.ts'
import { describeColor } from './color.logic.ts'

export const color = defineTransform({
  meta: {
    id: 'color',
    name: 'Color converter',
    category: 'convert',
    description: 'HEX, RGB, HSL and OKLCH from any CSS color.',
    keywords: ['hex', 'rgb', 'hsl', 'oklch', 'css', 'colour', 'palette'],
  },
  modes: [{ id: 'all', label: 'All' }],
  placeholder: '#3b82f6',
  example: '#3b82f6',
  present: 'swatch',
  run: (text) => describeColor(text),
})
