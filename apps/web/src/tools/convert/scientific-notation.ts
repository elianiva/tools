import { defineTransform } from '../transform.ts'

export const run = (text: string, mode: string): string => {
  if (mode === 'to-decimal') {
    const match = /^\s*(-?\d+(?:\.\d+)?)\s*(?:[x×*]\s*10\s*\^\s*(-?\d+)|e\s*(-?\d+))\s*$/iu.exec(
      text,
    )
    if (match === null) throw new Error('Use a form such as 1.5 × 10^3 or 1.5e3.')
    const exponent = Number(match[2] ?? match[3])
    if (Math.abs(exponent) > 20) throw new Error('Use an exponent between -20 and 20.')
    return Number(`${match[1]}e${exponent}`).toLocaleString('en-US', {
      useGrouping: false,
      maximumFractionDigits: 20,
    })
  }
  const value = Number(text.trim().replaceAll(/[,_\s]/gu, ''))
  if (text.trim() === '' || !Number.isFinite(value)) throw new Error('Enter a number.')
  const [mantissa = '0', exponent = '0'] = value.toExponential().split('e')
  return `${mantissa} × 10^${Number(exponent)}`
}

export const scientificNotation = defineTransform({
  meta: {
    id: 'scientific-notation',
    name: 'Scientific notation',
    category: 'convert',
    description: 'Write numbers as a × 10^n and read them back.',
    keywords: ['scientific notation', 'exponent', 'standard form', 'e notation'],
  },
  modes: [
    { id: 'to-scientific', label: 'To scientific' },
    { id: 'to-decimal', label: 'To decimal' },
  ],
  placeholder: '12345',
  example: '12345',
  fields: [{ label: 'Number', kind: 'text' }],
  run,
})
