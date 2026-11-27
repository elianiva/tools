import { codecView, defineWorkbench } from './ui.ts'

export const run = (text: string, mode: string): string => {
  if (mode === 'decode') {
    const named: Readonly<Record<string, string>> = {
      amp: '&',
      lt: '<',
      gt: '>',
      quot: '"',
      apos: "'",
      nbsp: '\u00a0',
      copy: '©',
      reg: '®',
      euro: '€',
      hellip: '…',
      mdash: '—',
      ndash: '–',
    }
    return text.replaceAll(/&(#x[0-9a-f]+|#\d+|[a-z]+);/giu, (whole, body: string) => {
      if (body.startsWith('#')) {
        const code =
          body[1] === 'x' || body[1] === 'X'
            ? Number.parseInt(body.slice(2), 16)
            : Number(body.slice(1))
        try {
          return String.fromCodePoint(code)
        } catch {
          return whole
        }
      }
      return named[body.toLowerCase()] ?? whole
    })
  }
  const escaped = text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
  if (mode === 'encode') return escaped
  return Array.from(escaped, (char) =>
    (char.codePointAt(0) ?? 0) > 127 ? `&#${char.codePointAt(0)};` : char,
  ).join('')
}

export const htmlEntities = defineWorkbench({
  meta: {
    id: 'html-entities',
    name: 'HTML entities',
    category: 'developer',
    description: 'Escape and unescape HTML special characters.',
    keywords: ['html', 'escape', 'unescape', 'entity', '&amp;', 'xss'],
  },
  mode: 'encode',
  example: '<a href="x">&</a>',
  view: (h, ctx) =>
    codecView(h, ctx, {
      id: 'html-entities',
      modes: [
        { value: 'encode', label: 'Escape' },
        { value: 'encode-all', label: 'Escape non-ASCII' },
        { value: 'decode', label: 'Unescape' },
      ],
      inverse: { encode: 'decode', 'encode-all': 'decode', decode: 'encode' },
      run,
      labels: (mode) => (mode === 'decode' ? ['HTML', 'Text'] : ['Text', 'HTML']),
      placeholder: 'Type or paste text',
    }),
})
