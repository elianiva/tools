import { defineTransform } from '../transform.ts'

export const run = (text: string, mode: string): string => {
  const shift = Number(mode)
  return Array.from(text, (char) => {
    const code = char.charCodeAt(0)
    const base = code >= 97 && code <= 122 ? 97 : code >= 65 && code <= 90 ? 65 : 0
    return base === 0 ? char : String.fromCharCode(base + ((code - base + shift) % 26))
  }).join('')
}

export const caesarCipher = defineTransform({
  meta: {
    id: 'caesar-cipher',
    name: 'Caesar cipher',
    category: 'text',
    description: 'Shift letters by a fixed number of places.',
    keywords: ['caesar', 'shift', 'cipher', 'encrypt', 'rot'],
  },
  modes: [
    { id: '1', label: 'Shift 1' },
    { id: '3', label: 'Shift 3' },
    { id: '5', label: 'Shift 5' },
    { id: '7', label: 'Shift 7' },
    { id: '13', label: 'Shift 13' },
    { id: '19', label: 'Shift 19' },
    { id: '25', label: 'Shift 25' },
  ],
  placeholder: 'Type or paste text',
  run,
})
