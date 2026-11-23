import { defineTransform } from '../transform.ts'

export const run = (text: string, mode: string): string => {
  switch (mode) {
    case 'trim':
      return text
        .split('\n')
        .map((line) => line.trim())
        .join('\n')
    case 'strip':
      return text.replaceAll(/\s+/gu, '')
    case 'tabs':
      return text.replaceAll('\t', '    ')
    case 'invisible':
      return text.replaceAll(/[\u200B-\u200D\u2060\uFEFF]/gu, '')
    default:
      return text.replaceAll(/[^\S\n]+/gu, ' ')
  }
}

export const whitespaceCleaner = defineTransform({
  meta: {
    id: 'whitespace-cleaner',
    name: 'Whitespace cleaner',
    category: 'text',
    description: 'Collapse spaces, trim lines, or strip invisible characters.',
    keywords: ['spaces', 'trim', 'tabs', 'zero-width', 'clean'],
  },
  modes: [
    { id: 'collapse', label: 'Collapse spaces' },
    { id: 'trim', label: 'Trim lines' },
    { id: 'strip', label: 'Remove all' },
    { id: 'tabs', label: 'Tabs to spaces' },
    { id: 'invisible', label: 'Zero-width' },
  ],
  placeholder: 'Type or paste text',
  acceptsFiles: true,
  run,
})
