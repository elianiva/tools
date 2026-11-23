import { defineTransform } from '../transform.ts'

export const run = (text: string, mode: string): string => {
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b))
  const input = text.trim()
  if (mode === 'to-fraction') {
    const match = /^(-?)(\d+)(?:\.(\d{1,9}))?$/u.exec(input)
    if (match === null) throw new Error('Enter a decimal such as 0.75.')
    const decimals = match[3] ?? ''
    const denominator = 10 ** decimals.length
    const numerator = Number(`${match[2]}${decimals}`)
    const divisor = gcd(numerator, denominator)
    const top = numerator / divisor
    const bottom = denominator / divisor
    return `${match[1] ?? ''}${bottom === 1 ? top : `${top}/${bottom}`}`
  }
  const mixed = /^(-?)(\d+)\s+(\d+)\s*\/\s*(\d+)$/u.exec(input)
  const simple = /^(-?)(\d+)\s*\/\s*(\d+)$/u.exec(input)
  const sign = (mixed ?? simple)?.[1] === '-' ? -1 : 1
  const whole = mixed === null ? 0 : Number(mixed[2])
  const top = Number((mixed ?? simple)?.[mixed === null ? 2 : 3])
  const bottom = Number((mixed ?? simple)?.[mixed === null ? 3 : 4])
  if (mixed === null && simple === null) throw new Error('Enter a fraction such as 3/8 or 1 1/2.')
  if (bottom === 0) throw new Error('The bottom of a fraction cannot be zero.')
  return String(Number((sign * (whole + top / bottom)).toFixed(10)))
}

export const fractionDecimal = defineTransform({
  meta: {
    id: 'fraction-decimal',
    name: 'Fraction and decimal',
    category: 'convert',
    description: 'Turn fractions into decimals and decimals into fractions.',
    keywords: ['fraction', 'decimal', 'mixed number', 'reduce'],
  },
  modes: [
    { id: 'to-decimal', label: 'Fraction to decimal' },
    { id: 'to-fraction', label: 'Decimal to fraction' },
  ],
  placeholder: '3/8',
  example: '3/8',
  run,
})
