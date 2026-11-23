import { formatCss, formatHex, formatHex8, formatHsl, formatRgb, oklch, parse, rgb } from 'culori'

const round = (value: number | undefined, digits: number): number =>
  Number((value ?? 0).toFixed(digits))

/** Any CSS color in, every common notation out. */
export const describeColor = (text: string): string => {
  const color = parse(text.trim())
  if (color === undefined)
    throw new Error('This is not a CSS color. Try #3b82f6, rgb(59 130 246) or hsl(217 91% 60%).')
  const lch = oklch(color)
  const alpha = rgb(color).alpha ?? 1
  return [
    `HEX    ${alpha < 1 ? formatHex8(color) : formatHex(color)}`,
    `RGB    ${formatRgb(color)}`,
    `HSL    ${formatHsl(color)}`,
    `OKLCH  oklch(${round(lch.l, 3)} ${round(lch.c, 3)} ${round(lch.h, 1)}${alpha < 1 ? ` / ${round(alpha, 2)}` : ''})`,
    `CSS    ${formatCss(color).replace(/\d+\.\d{4,}/gu, (n) => String(Number(Number(n).toFixed(3))))}`,
  ].join('\n')
}
