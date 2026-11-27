import { cleaner, defineTextTool } from './ui.ts'

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

export const whitespaceCleaner = defineTextTool({
  meta: {
    id: 'whitespace-cleaner',
    name: 'Whitespace cleaner',
    category: 'text',
    description: 'Collapse spaces, trim lines, or strip invisible characters.',
    keywords: ['spaces', 'trim', 'tabs', 'zero-width', 'clean'],
  },
  mode: 'collapse',
  example: 'a   b \t c\u200b d  \n   indented line  ',
  files: true,
  render: (c) =>
    cleaner(c, {
      run,
      options: [
        { value: 'collapse', label: 'Collapse spaces' },
        { value: 'trim', label: 'Trim lines' },
        { value: 'strip', label: 'Remove all' },
        { value: 'tabs', label: 'Tabs to spaces' },
        { value: 'invisible', label: 'Zero-width' },
      ],
    }),
})
