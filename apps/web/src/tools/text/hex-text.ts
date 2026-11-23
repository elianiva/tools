import { defineTransform } from '../transform.ts'

export const run = (text: string, mode: string): string => {
  if (mode === 'to-hex') {
    return [...new TextEncoder().encode(text)]
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join(' ')
  }
  const clean = text.replaceAll(/0x|[\s,]/giu, '')
  if (!/^[0-9a-f]*$/iu.test(clean) || clean.length % 2 !== 0) {
    throw new Error('Use pairs of hexadecimal digits.')
  }
  const bytes = Uint8Array.from(clean.match(/../gu) ?? [], (pair) => Number.parseInt(pair, 16))
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes)
  } catch {
    throw new Error('These bytes are not valid UTF-8 text.')
  }
}

export const hexText = defineTransform({
  meta: {
    id: 'hex-text',
    name: 'Text to hex',
    category: 'text',
    description: 'Convert text to hexadecimal bytes and back.',
    keywords: ['hex', 'hexadecimal', 'bytes', 'utf-8'],
  },
  modes: [
    { id: 'to-hex', label: 'Text to hex' },
    { id: 'from-hex', label: 'Hex to text' },
  ],
  placeholder: 'Type or paste text',
  example: 'Hi',
  present: 'tokens',
  run,
})
