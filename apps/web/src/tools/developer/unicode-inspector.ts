import { defineTransform } from '../transform.ts'

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

export const unicodeInspector = defineTransform({
  meta: {
    id: 'unicode-inspector',
    name: 'Unicode inspector',
    category: 'developer',
    description: 'Show the code point and UTF-8 bytes of every character.',
    keywords: ['unicode', 'code point', 'utf-8', 'codepoint', 'character', 'emoji'],
  },
  modes: [{ id: 'run', label: 'Run' }],
  placeholder: 'Type or paste text',
  acceptsFiles: true,
  run,
})
