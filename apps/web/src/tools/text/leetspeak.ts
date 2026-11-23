import { defineTransform } from '../transform.ts'

export const run = (text: string, mode: string): string => {
  const basic: Readonly<Record<string, string>> = { a: '4', e: '3', i: '1', o: '0' }
  const heavy: Readonly<Record<string, string>> = { ...basic, s: '5', t: '7', b: '8', g: '9' }
  const table = mode === 'heavy' ? heavy : basic
  return Array.from(text, (char) => table[char.toLowerCase()] ?? char).join('')
}

export const leetspeak = defineTransform({
  meta: {
    id: 'leetspeak',
    name: 'Leetspeak',
    category: 'text',
    description: 'Write text in 1337 speak.',
    keywords: ['leet', '1337', 'hacker', 'l33t'],
  },
  modes: [
    { id: 'basic', label: 'Basic' },
    { id: 'heavy', label: 'Heavy' },
  ],
  placeholder: 'Type or paste text',
  example: 'leet',
  run,
})
