import { secureInt } from './password.logic.ts'
import { defineTransform } from '../transform.ts'

export const run = (text: string): string => {
  const count = Math.min(50, Math.max(1, Number.parseInt(text, 10) || 1))
  return Array.from(
    { length: count },
    () => `#${[0, 0, 0].map(() => secureInt(256).toString(16).padStart(2, '0')).join('')}`,
  ).join('\n')
}

export const randomColor = defineTransform({
  meta: {
    id: 'random-color',
    name: 'Random colors',
    category: 'generate',
    description: 'Random hex colors. Type how many.',
    keywords: ['random color', 'hex', 'palette', 'swatch', 'colour'],
  },
  modes: [{ id: 'run', label: 'Run' }],
  placeholder: '5',
  example: '5',
  present: 'swatch',
  run,
})
