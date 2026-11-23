import { defineTransform } from '../transform.ts'

export const run = (text: string, mode: string): string => {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
  if (mode === 'decode') {
    const clean = text.replaceAll(/[\s=]/gu, '').toUpperCase()
    if (clean === '' || [...clean].some((char) => !alphabet.includes(char)))
      throw new Error('This is not valid Base32.')
    const bits = Array.from(clean, (char) =>
      alphabet.indexOf(char).toString(2).padStart(5, '0'),
    ).join('')
    const bytes = Uint8Array.from(
      bits.slice(0, Math.floor(bits.length / 8) * 8).match(/.{8}/gu) ?? [],
      (byte) => Number.parseInt(byte, 2),
    )
    try {
      return new TextDecoder('utf-8', { fatal: true }).decode(bytes)
    } catch {
      throw new Error('The bytes are not UTF-8 text.')
    }
  }
  const bits = Array.from(new TextEncoder().encode(text), (byte) =>
    byte.toString(2).padStart(8, '0'),
  ).join('')
  const letters = (bits.match(/.{1,5}/gu) ?? [])
    .map((chunk) => alphabet.charAt(Number.parseInt(chunk.padEnd(5, '0'), 2)))
    .join('')
  return letters.padEnd(Math.ceil(letters.length / 8) * 8, '=')
}

export const base32 = defineTransform({
  meta: {
    id: 'base32',
    name: 'Base32',
    category: 'developer',
    description: 'Encode and decode text as Base32 (RFC 4648).',
    keywords: ['base32', 'encode', 'decode', 'rfc 4648', 'totp'],
  },
  modes: [
    { id: 'encode', label: 'Encode' },
    { id: 'decode', label: 'Decode' },
  ],
  placeholder: 'Type or paste text',
  example: 'foobar',
  run,
})
