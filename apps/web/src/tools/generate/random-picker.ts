import { secureInt } from './password.logic.ts'
import { defineTransform } from '../transform.ts'

export const run = (text: string, mode: string): string => {
  const items = text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line !== '')
  if (items.length === 0) throw new Error('Enter at least one item.')
  if (mode === 'shuffle') {
    const out = [...items]
    for (let i = out.length - 1; i > 0; i -= 1) {
      const j = secureInt(i + 1)
      const held = out[i] ?? ''
      out[i] = out[j] ?? ''
      out[j] = held
    }
    return out.join('\n')
  }
  return items[secureInt(items.length)] ?? ''
}

export const randomPicker = defineTransform({
  meta: {
    id: 'random-picker',
    name: 'Random picker',
    category: 'generate',
    description: 'Pick a winner or shuffle a list, one item per line.',
    keywords: ['random', 'raffle', 'shuffle', 'draw', 'choose', 'giveaway'],
  },
  modes: [
    { id: 'pick', label: 'Pick one' },
    { id: 'shuffle', label: 'Shuffle' },
  ],
  placeholder: 'One item per line',
  run,
})
