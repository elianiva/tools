import { defineTransform } from '../transform.ts'

export const run = (text: string, mode: string): string => {
  const clean = text.trim().replaceAll(/[_\s]/gu, '').toLowerCase()
  const negative = clean.startsWith('-')
  const prefixes: Readonly<Record<string, string>> = { dec: '', hex: '0x', bin: '0b', oct: '0o' }
  const digits: Readonly<Record<string, RegExp>> = {
    dec: /^\d+$/u,
    hex: /^[0-9a-f]+$/u,
    bin: /^[01]+$/u,
    oct: /^[0-7]+$/u,
  }
  const prefix = prefixes[mode] ?? ''
  let body = clean.replace(/^-/u, '')
  if (prefix !== '' && body.startsWith(prefix)) body = body.slice(2)
  if (!(digits[mode] ?? digits['dec'])?.test(body))
    throw new Error('This is not a valid number in that base.')
  const raw = BigInt(`${prefix}${body}`)
  const value = negative ? -raw : raw
  return [
    `Decimal: ${value.toString(10)}`,
    `Hex: ${value.toString(16)}`,
    `Binary: ${value.toString(2)}`,
    `Octal: ${value.toString(8)}`,
  ].join('\n')
}

export const baseConverter = defineTransform({
  meta: {
    id: 'base-converter',
    name: 'Number base converter',
    category: 'convert',
    description: 'Binary, octal, decimal, and hexadecimal side by side.',
    keywords: ['binary', 'hex', 'octal', 'decimal', 'radix', 'base'],
  },
  modes: [
    { id: 'dec', label: 'Decimal' },
    { id: 'hex', label: 'Hex' },
    { id: 'bin', label: 'Binary' },
    { id: 'oct', label: 'Octal' },
  ],
  placeholder: '255',
  example: '255',
  run,
})
