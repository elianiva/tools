import { secureInt } from './password.logic.ts'
import { defineTransform } from '../transform.ts'

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

export const randomString = defineTransform({
  meta: {
    id: 'random-string',
    name: 'Random string',
    category: 'generate',
    description: 'Random letters, digits, hex, or URL-safe text of a length you choose.',
    keywords: ['random string', 'token', 'api key', 'secret', 'hex', 'identifier'],
  },
  modes: [
    { id: 'alnum', label: 'Letters and digits' },
    { id: 'letters', label: 'Letters' },
    { id: 'digits', label: 'Digits' },
    { id: 'hex', label: 'Hex' },
    { id: 'url', label: 'URL-safe' },
  ],
  placeholder: '16',
  example: '16',
  fields: [{ label: 'Length' }],
  run,
})
