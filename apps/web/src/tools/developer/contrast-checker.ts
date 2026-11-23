import { defineTransform } from '../transform.ts'

export const run = (text: string): string => {
  const luminance = (color: string): number => {
    const hex = color.replace('#', '')
    const full =
      hex.length === 3
        ? hex
            .split('')
            .map((char) => char + char)
            .join('')
        : hex
    if (!/^[0-9a-f]{6}$/iu.test(full)) throw new Error(`"${color}" is not a hex color.`)
    const [r = 0, g = 0, b = 0] = [0, 2, 4].map((start) => {
      const value = Number.parseInt(full.slice(start, start + 2), 16) / 255
      return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
    })
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
  }
  const colors = text.trim().split(/[\s,]+/u)
  const [first, second] = colors
  if (colors.length !== 2 || first === undefined || second === undefined)
    throw new Error('Enter two hex colors, such as #777 #fff.')
  const a = luminance(first)
  const b = luminance(second)
  const ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
  const verdict = (needed: number): string => (ratio >= needed ? 'pass' : 'fail')
  return [
    `Contrast: ${ratio.toFixed(2)}:1`,
    `AA normal text: ${verdict(4.5)}`,
    `AA large text: ${verdict(3)}`,
    `AAA normal text: ${verdict(7)}`,
    `AAA large text: ${verdict(4.5)}`,
  ].join('\n')
}

export const contrastChecker = defineTransform({
  meta: {
    id: 'contrast-checker',
    name: 'Contrast checker',
    category: 'developer',
    description: 'WCAG contrast ratio of two hex colors.',
    keywords: ['wcag', 'contrast', 'accessibility', 'a11y', 'aa', 'aaa', 'color'],
  },
  modes: [{ id: 'run', label: 'Run' }],
  placeholder: '#777777 #ffffff',
  example: '#777777 #ffffff',
  present: 'swatch',
  run,
})
