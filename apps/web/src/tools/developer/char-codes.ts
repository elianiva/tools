import { defineTransform } from '../transform.ts'

export const run = (text: string, mode: string): string => {
  if (mode === 'to-codes') return Array.from(text, (char) => char.codePointAt(0) ?? 0).join(' ')
  return text
    .split(/[\s,]+/u)
    .filter((token) => token !== '')
    .map((token) => {
      const hex = /^(?:U\+|0x)([0-9a-f]+)$/iu.exec(token)
      const code =
        hex === null
          ? /^\d+$/u.test(token)
            ? Number(token)
            : Number.NaN
          : Number.parseInt(hex[1] ?? '', 16)
      try {
        return String.fromCodePoint(code)
      } catch {
        throw new Error(`"${token}" is not a code point.`)
      }
    })
    .join('')
}

export const charCodes = defineTransform({
  meta: {
    id: 'char-codes',
    name: 'Character codes',
    category: 'developer',
    description: 'Characters to code points and back.',
    keywords: ['ascii', 'code point', 'charcode', 'unicode', 'decimal', 'hex'],
  },
  modes: [
    { id: 'to-codes', label: 'Text to codes' },
    { id: 'from-codes', label: 'Codes to text' },
  ],
  placeholder: 'Type or paste text',
  run,
})
