import { columns } from '../kit.ts'
import { defineLab, inputPanel, layout, resultPanel } from './ui-b.ts'

export const run = (text: string): string => {
  const flipped: Readonly<Record<string, string>> = {
    a: 'ɐ',
    b: 'q',
    c: 'ɔ',
    d: 'p',
    e: 'ǝ',
    f: 'ɟ',
    g: 'ƃ',
    h: 'ɥ',
    i: 'ᴉ',
    j: 'ɾ',
    k: 'ʞ',
    l: 'l',
    m: 'ɯ',
    n: 'u',
    o: 'o',
    p: 'd',
    q: 'b',
    r: 'ɹ',
    s: 's',
    t: 'ʇ',
    u: 'n',
    v: 'ʌ',
    w: 'ʍ',
    x: 'x',
    y: 'ʎ',
    z: 'z',
    '1': 'Ɩ',
    '2': 'ᄅ',
    '3': 'Ɛ',
    '4': 'ㄣ',
    '5': 'ϛ',
    '6': '9',
    '7': 'ㄥ',
    '8': '8',
    '9': '6',
    '0': '0',
    '.': '˙',
    ',': "'",
    "'": ',',
    '?': '¿',
    '!': '¡',
    '(': ')',
    ')': '(',
    '[': ']',
    ']': '[',
    '{': '}',
    '}': '{',
    '<': '>',
    '>': '<',
    _: '‾',
  }
  return Array.from(text.toLowerCase())
    .toReversed()
    .map((char) => flipped[char] ?? char)
    .join('')
}
export const upsideDown = defineLab({
  meta: {
    id: 'upside-down',
    name: 'Upside-down text',
    category: 'text',
    description: 'Flip text upside down.',
    keywords: ['flip', 'rotate', 'inverted', 'upside'],
  },
  example: 'hello',
  view: (ctx) =>
    layout(
      ctx.h,
      [],
      [
        columns(ctx.h, [
          inputPanel(ctx, { label: 'Text', placeholder: 'Type or paste text', rows: 6 }),
          resultPanel(ctx.h, run(ctx.model.input), '', 'Flipped'),
        ]),
      ],
    ),
})
