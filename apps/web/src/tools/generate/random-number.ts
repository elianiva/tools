import { secureInt } from './password.logic.ts'
import { defineTransform } from '../transform.ts'

export const run = (text: string): string => {
  const [min, max, count = 1] = (text.match(/-?\d+/gu) ?? []).map(Number)
  if (min === undefined || max === undefined)
    throw new Error('Enter a minimum and a maximum, such as 1 100 5.')
  if (min > max) throw new Error('The minimum cannot be above the maximum.')
  if (max - min + 1 > 4_294_967_296) throw new Error('The range can span up to 4 billion numbers.')
  if (count < 1 || count > 100) throw new Error('Draw 1 to 100 numbers.')
  return Array.from({ length: count }, () => min + secureInt(max - min + 1)).join(', ')
}

export const randomNumber = defineTransform({
  meta: {
    id: 'random-number',
    name: 'Random number',
    category: 'generate',
    description: 'Draw random whole numbers from a range.',
    keywords: ['random', 'number', 'lottery', 'range', 'draw', 'integer'],
  },
  modes: [{ id: 'run', label: 'Run' }],
  placeholder: 'min, max, how many: 1 100 5',
  example: '1 100 5',
  run,
})
