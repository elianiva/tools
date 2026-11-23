import { defineTransform } from '../transform.ts'

export const run = (text: string): string => {
  const [width, height] = (text.match(/\d+(?:\.\d+)?/gu) ?? []).map(Number)
  if (width === undefined || height === undefined || width <= 0 || height <= 0)
    throw new Error('Enter a width and a height, such as 1920 1080.')
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b))
  const divisor = Number.isInteger(width) && Number.isInteger(height) ? gcd(width, height) : 1
  return [
    `Ratio: ${width / divisor}:${height / divisor}`,
    `Decimal: ${(width / height).toFixed(2)}`,
  ].join('\n')
}

export const aspectRatio = defineTransform({
  meta: {
    id: 'aspect-ratio',
    name: 'Aspect ratio',
    category: 'calculate',
    description: 'The simplest ratio of a width and a height.',
    keywords: ['aspect ratio', '16:9', 'resolution', 'screen', 'ratio'],
  },
  modes: [{ id: 'run', label: 'Run' }],
  placeholder: '1920 1080',
  example: '1920 1080',
  fields: [
    { label: 'Width', suffix: 'px' },
    { label: 'Height', suffix: 'px' },
  ],
  run,
})
