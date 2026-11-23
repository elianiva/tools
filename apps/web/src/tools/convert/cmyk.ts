import { defineTransform } from '../transform.ts'

export const run = (text: string, mode: string): string => {
  if (mode === 'to-hex') {
    const values = (text.match(/\d+(?:\.\d+)?/gu) ?? []).map(Number)
    if (values.length !== 4 || values.some((value) => value > 100))
      throw new Error('Enter four percentages, C M Y K, such as 76 47 0 4.')
    const [c = 0, m = 0, y = 0, k = 0] = values
    const channel = (ink: number): string =>
      Math.round(255 * (1 - ink / 100) * (1 - k / 100))
        .toString(16)
        .padStart(2, '0')
    return `#${channel(c)}${channel(m)}${channel(y)}`
  }
  const hex = text.trim().replace('#', '')
  const full =
    hex.length === 3
      ? hex
          .split('')
          .map((char) => char + char)
          .join('')
      : hex
  if (!/^[0-9a-f]{6}$/iu.test(full)) throw new Error('Enter a hex color such as #3b82f6.')
  const [r = 0, g = 0, b = 0] = [0, 2, 4].map(
    (start) => Number.parseInt(full.slice(start, start + 2), 16) / 255,
  )
  const k = 1 - Math.max(r, g, b)
  const part = (value: number): number =>
    k === 1 ? 0 : Math.round(((1 - value - k) / (1 - k)) * 100)
  return `CMYK: ${part(r)}% ${part(g)}% ${part(b)}% ${Math.round(k * 100)}%`
}

export const cmyk = defineTransform({
  meta: {
    id: 'cmyk',
    name: 'CMYK converter',
    category: 'convert',
    description: 'Convert a hex color to CMYK percentages and back.',
    keywords: ['cmyk', 'print', 'hex', 'color', 'percent', 'ink'],
  },
  modes: [
    { id: 'to-cmyk', label: 'Hex to CMYK' },
    { id: 'to-hex', label: 'CMYK to hex' },
  ],
  placeholder: '#3b82f6',
  example: '#3b82f6',
  present: 'swatch',
  run,
})
