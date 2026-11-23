import { defineTransform } from '../transform.ts'

export const run = (text: string, mode: string): string => {
  if (mode === 'to-binary') {
    return [...new TextEncoder().encode(text)]
      .map((byte) => byte.toString(2).padStart(8, '0'))
      .join(' ')
  }
  const clean = text.replaceAll(/\s+/gu, '')
  if (!/^[01]+$/u.test(clean) || clean.length % 8 !== 0) {
    throw new Error('Use groups of eight 0s and 1s.')
  }
  const bytes = Uint8Array.from(clean.match(/.{8}/gu) ?? [], (bits) => Number.parseInt(bits, 2))
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes)
  } catch {
    throw new Error('These bytes are not valid UTF-8 text.')
  }
}

export const binaryText = defineTransform({
  meta: {
    id: 'binary-text',
    name: 'Text to binary',
    category: 'text',
    description: 'Convert text to binary and back.',
    keywords: ['binary', 'bits', '0 and 1', 'utf-8'],
  },
  modes: [
    { id: 'to-binary', label: 'Text to binary' },
    { id: 'from-binary', label: 'Binary to text' },
  ],
  placeholder: 'Type or paste text',
  example: 'Hi',
  present: 'tokens',
  run,
})
