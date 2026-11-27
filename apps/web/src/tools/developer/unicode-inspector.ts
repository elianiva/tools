import { panel, stack } from '../kit.ts'
import { dataTable, defineWorkbench, hex, inputBox, sectionLabel } from './ui.ts'

export const run = (text: string): string => {
  return Array.from(text, (char) => {
    const code = char.codePointAt(0) ?? 0
    const label = code < 32 || code === 127 ? '(control)' : char
    const bytes = [...new TextEncoder().encode(char)]
      .map((byte) => byte.toString(16).toUpperCase().padStart(2, '0'))
      .join(' ')
    return `U+${code.toString(16).toUpperCase().padStart(4, '0')}  ${label}  ${bytes}`
  }).join('\n')
}

export const unicodeInspector = defineWorkbench({
  meta: {
    id: 'unicode-inspector',
    name: 'Unicode inspector',
    category: 'developer',
    description: 'Show the code point and UTF-8 bytes of every character.',
    keywords: ['unicode', 'code point', 'utf-8', 'codepoint', 'character', 'emoji'],
  },
  example: 'A€😀',
  acceptsFiles: true,
  view: (h, ctx) => {
    const chars = Array.from(ctx.input.slice(0, 2000))
    const encoder = new TextEncoder()
    return h.div(
      [h.Class(stack)],
      [
        panel(h, null, [
          inputBox(h, ctx, {
            id: 'unicode-input',
            label: 'Text',
            placeholder: 'Type or paste text',
            rows: 5,
          }),
        ]),
        panel(h, null, [
          sectionLabel(h, `${chars.length} characters`),
          dataTable(h, {
            headers: ['Char', 'Code point', 'UTF-8', 'UTF-16', 'Decimal'],
            kinds: ['mono', 'num', 'mono', 'mono', 'num'],
            empty: 'Type some text to inspect it.',
            rows: chars.map((char) => {
              const code = char.codePointAt(0) ?? 0
              const utf16 = Array.from({ length: char.length }, (_, i) =>
                hex(char.charCodeAt(i), 4),
              )
              return [
                code < 32 || code === 127 ? '(control)' : char,
                `U+${hex(code, 4)}`,
                [...encoder.encode(char)].map((byte) => hex(byte)).join(' '),
                utf16.join(' '),
                String(code),
              ]
            }),
          }),
        ]),
      ],
    )
  },
})
