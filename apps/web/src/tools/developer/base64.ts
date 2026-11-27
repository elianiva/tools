import { checkbox } from '../kit.ts'
import { runBase64 } from './base64.logic.ts'
import { byteLength, codecView, defineWorkbench, facts, formatSize } from './ui.ts'

const MODES = [
  { value: 'encode', label: 'Encode' },
  { value: 'decode', label: 'Decode' },
]

const BASE64 = /[A-Za-z0-9+/_-]/u

/** The first character that is not Base64, or a `=` that is not trailing padding. */
const badCharacter = (input: string): number | undefined => {
  const trimmed = input.trimEnd()
  for (let index = 0; index < trimmed.length; index += 1) {
    const char = trimmed.charAt(index)
    if (/\s/u.test(char)) continue
    if (char === '=' && /^=*$/u.test(trimmed.slice(index).replaceAll(/\s/gu, ''))) continue
    if (!BASE64.test(char)) return index
  }
  return undefined
}

export const base64 = defineWorkbench({
  meta: {
    id: 'base64',
    name: 'Base64',
    category: 'developer',
    description: 'Encode and decode text as Base64, standard or URL-safe.',
    keywords: ['encode', 'decode', 'base64url', 'utf-8'],
  },
  mode: 'encode',
  example: 'Hello, world',
  view: (h, ctx) =>
    codecView(h, ctx, {
      id: 'base64',
      modes: MODES,
      inverse: { encode: 'decode', decode: 'encode' },
      run: (input, mode) =>
        runBase64(input, mode === 'encode' && ctx.opt('url') === '1' ? 'encode-url' : mode),
      locate: (input, mode) => (mode === 'decode' ? badCharacter(input) : undefined),
      labels: (mode) => (mode === 'encode' ? ['Text', 'Base64'] : ['Base64', 'Text']),
      placeholder: ctx.mode === 'encode' ? 'Text to encode' : 'Base64 to decode',
      toolbar: [
        ctx.mode === 'encode'
          ? checkbox(h, {
              id: 'base64-url',
              label: 'URL-safe',
              checked: ctx.opt('url') === '1',
              onToggle: ctx.on.toggle('url'),
            })
          : null,
      ],
      details: (input, output, mode) => {
        const [from, to] = mode === 'encode' ? [input, output] : [output, input]
        const plain = byteLength(from)
        const encoded = byteLength(to)
        return facts(h, [
          ['Text', formatSize(plain)],
          ['Base64', formatSize(encoded)],
          ['Growth', plain === 0 ? '—' : `${(((encoded - plain) / plain) * 100).toFixed(0)}%`],
        ])
      },
    }),
})
