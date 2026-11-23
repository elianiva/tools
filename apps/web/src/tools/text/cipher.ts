import { defineTransform } from '../transform.ts'

export const run = (text: string, mode: string): string => {
  return Array.from(text, (char) => {
    const code = char.charCodeAt(0)
    if (mode === 'rot47')
      return code >= 33 && code <= 126 ? String.fromCharCode(33 + ((code - 33 + 47) % 94)) : char
    const lower = code >= 97 && code <= 122
    const upper = code >= 65 && code <= 90
    if (!lower && !upper) return char
    const base = lower ? 97 : 65
    const index = code - base
    return String.fromCharCode(base + (mode === 'atbash' ? 25 - index : (index + 13) % 26))
  }).join('')
}

export const cipher = defineTransform({
  meta: {
    id: 'cipher',
    name: 'Simple ciphers',
    category: 'text',
    description: 'ROT13, ROT47, and Atbash.',
    keywords: ['rot13', 'rot47', 'atbash', 'caesar', 'encode', 'obfuscate'],
  },
  modes: [
    { id: 'rot13', label: 'ROT13' },
    { id: 'rot47', label: 'ROT47' },
    { id: 'atbash', label: 'Atbash' },
  ],
  placeholder: 'Type or paste text',
  example: 'Hello',
  run,
})
