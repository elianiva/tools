import { codecView, defineWorkbench, dataTable, hex } from './ui.ts'

export const run = (text: string, mode: string): string => {
  if (mode === 'to-codes') return Array.from(text, (char) => char.codePointAt(0) ?? 0).join(' ')
  return text
    .split(/[\s,]+/u)
    .filter((token) => token !== '')
    .map((token) => {
      const hex = /^(?:U\+|0x)([0-9a-f]+)$/iu.exec(token)
      const code =
        hex === null
          ? /^\d+$/u.test(token)
            ? Number(token)
            : Number.NaN
          : Number.parseInt(hex[1] ?? '', 16)
      try {
        return String.fromCodePoint(code)
      } catch {
        throw new Error(`"${token}" is not a code point.`)
      }
    })
    .join('')
}

const rows = (text: string, h: Parameters<typeof dataTable>[0]) =>
  dataTable(h, {
    headers: ['Char', 'Decimal', 'Hex'],
    kinds: ['mono', 'num', 'num'],
    rows: Array.from(text.slice(0, 2000), (char) => {
      const code = char.codePointAt(0) ?? 0
      return [code < 32 || code === 127 ? '·' : char, String(code), `U+${hex(code, 4)}`]
    }),
  })

export const charCodes = defineWorkbench({
  meta: {
    id: 'char-codes',
    name: 'Character codes',
    category: 'developer',
    description: 'Characters to code points and back.',
    keywords: ['ascii', 'code point', 'charcode', 'unicode', 'decimal', 'hex'],
  },
  mode: 'to-codes',
  example: 'Hi€',
  view: (h, ctx) =>
    codecView(h, ctx, {
      id: 'char-codes',
      modes: [
        { value: 'to-codes', label: 'Text to codes' },
        { value: 'from-codes', label: 'Codes to text' },
      ],
      inverse: { 'to-codes': 'from-codes', 'from-codes': 'to-codes' },
      run,
      locate: (input, mode) => {
        if (mode !== 'from-codes') return undefined
        const bad = /(?:^|[\s,])((?!(?:U\+|0x)[0-9a-f]+(?:[\s,]|$)|\d+(?:[\s,]|$))[^\s,]+)/iu.exec(
          input,
        )
        return bad === null ? undefined : bad.index + bad[0].length - (bad[1]?.length ?? 0)
      },
      labels: (mode) => (mode === 'to-codes' ? ['Text', 'Code points'] : ['Code points', 'Text']),
      placeholder: ctx.mode === 'to-codes' ? 'Type or paste text' : '72 105 U+20AC 0x41',
      details: (input, output, mode) => rows(mode === 'to-codes' ? input : output, h),
    }),
})
