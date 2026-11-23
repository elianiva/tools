import { defineTransform } from '../transform.ts'

export const run = (text: string, mode: string): string => {
  const [value, base = 16] = (text.match(/-?\d+(?:\.\d+)?/gu) ?? []).map(Number)
  if (value === undefined || base <= 0)
    throw new Error('Enter a number, and optionally a base size.')
  const clean = (n: number): number => Number(n.toFixed(4))
  return mode === 'rem-to-px' ? `${clean(value * base)}px` : `${clean(value / base)}rem`
}

export const pxRem = defineTransform({
  meta: {
    id: 'px-rem',
    name: 'Pixels and rem',
    category: 'convert',
    description: 'Convert px to rem and back for a base font size.',
    keywords: ['px', 'rem', 'css', 'font size', 'em'],
  },
  modes: [
    { id: 'px-to-rem', label: 'px to rem' },
    { id: 'rem-to-px', label: 'rem to px' },
  ],
  placeholder: '24 (add a base size: 24 12)',
  example: '24',
  fields: [{ label: 'Value' }],
  run,
})
