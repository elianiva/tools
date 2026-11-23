import { secureInt } from './password.logic.ts'
import { defineTransform } from '../transform.ts'

export const run = (text: string): string => {
  const count = Math.min(1000, Math.max(1, Number.parseInt(text, 10) || 1))
  const flips = Array.from({ length: count }, () => (secureInt(2) === 0 ? 'H' : 'T'))
  const heads = flips.filter((flip) => flip === 'H').length
  const totals = `Heads: ${heads}\nTails: ${count - heads}`
  return count <= 20 ? `${flips.join(' ')}\n${totals}` : totals
}

export const coinFlip = defineTransform({
  meta: {
    id: 'coin-flip',
    name: 'Coin flip',
    category: 'generate',
    description: 'Flip a coin once or up to a thousand times.',
    keywords: ['coin', 'flip', 'heads', 'tails', 'random', 'toss'],
  },
  modes: [{ id: 'run', label: 'Run' }],
  placeholder: '1',
  example: '1',
  fields: [{ label: 'Flips' }],
  run,
})
