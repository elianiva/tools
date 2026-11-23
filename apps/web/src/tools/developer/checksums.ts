import { defineTransform } from '../transform.ts'

export const run = (text: string, mode: string): string => {
  const bytes = new TextEncoder().encode(text)
  if (mode === 'adler32') {
    let a = 1
    let b = 0
    for (const byte of bytes) {
      a = (a + byte) % 65_521
      b = (b + a) % 65_521
    }
    return (((b << 16) | a) >>> 0).toString(16).padStart(8, '0')
  }
  let crc = 0xffffffff
  for (const byte of bytes) {
    crc ^= byte
    for (let step = 0; step < 8; step += 1) crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1
  }
  return ((crc ^ 0xffffffff) >>> 0).toString(16).padStart(8, '0')
}

export const checksums = defineTransform({
  meta: {
    id: 'checksums',
    name: 'CRC32 and Adler-32',
    category: 'developer',
    description: 'Fast checksums of text.',
    keywords: ['crc32', 'adler32', 'checksum', 'crc', 'hash'],
  },
  modes: [
    { id: 'crc32', label: 'CRC-32' },
    { id: 'adler32', label: 'Adler-32' },
  ],
  placeholder: 'Type or paste text',
  example: 'hello',
  run,
})
