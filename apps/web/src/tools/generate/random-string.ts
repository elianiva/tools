import { secureInt } from './password.logic.ts'
import { stack } from '../kit.ts'
import { tiles } from '../calculate/money-ui.ts'
import { defineGenerator, secretBox } from './ui.ts'

export const run = (text: string, mode: string): string => {
  const length = Number.parseInt(text, 10) || 16
  if (length < 1 || length > 256) throw new Error('Choose a length from 1 to 256.')
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
  const sets: Readonly<Record<string, string>> = {
    alnum: `${letters}0123456789`,
    letters,
    digits: '0123456789',
    hex: '0123456789abcdef',
    url: `${letters}0123456789-_`,
  }
  const alphabet = sets[mode] ?? sets['alnum'] ?? ''
  return Array.from({ length }, () => alphabet.charAt(secureInt(alphabet.length))).join('')
}

const SIZES: Readonly<Record<string, number>> = {
  alnum: 62,
  letters: 52,
  digits: 10,
  hex: 16,
  url: 64,
}

export const randomString = defineGenerator({
  meta: {
    id: 'random-string',
    name: 'Random string',
    category: 'generate',
    description: 'Random letters, digits, hex, or URL-safe text of a length you choose.',
    keywords: ['random string', 'token', 'api key', 'secret', 'hex', 'identifier'],
  },
  fields: [
    {
      label: 'Length',
      initial: '16',
      integer: true,
      min: 1,
      max: 256,
      presets: ['8', '16', '32', '64'],
    },
  ],
  modes: [
    { id: 'alnum', label: 'Letters and digits' },
    { id: 'letters', label: 'Letters' },
    { id: 'digits', label: 'Digits' },
    { id: 'hex', label: 'Hex' },
    { id: 'url', label: 'URL-safe' },
  ],
  modeLabel: 'Characters',
  action: 'Generate another',
  run,
  view: (h, { out, mode }) => {
    const bits = Math.floor(out.length * Math.log2(SIZES[mode] ?? 62))
    return h.div(
      [h.Class(stack)],
      [
        secretBox(h, 'Random string', out),
        tiles(h, [
          ['Length', String(out.length)],
          ['Entropy', `${bits} bits`],
        ]),
      ],
    )
  },
})
