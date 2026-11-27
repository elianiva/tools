import { cleaner, defineTextTool } from './ui.ts'

export const run = (text: string, mode: string): string => {
  if (mode === 'none') return text.replaceAll(/\r?\n+/gu, '')
  if (mode === 'paragraphs') {
    return text
      .split(/\n\s*\n/u)
      .map((paragraph) => paragraph.replaceAll(/\s*\n\s*/gu, ' '))
      .join('\n\n')
  }
  return text.replaceAll(/\s*\n\s*/gu, ' ')
}

export const removeLineBreaks = defineTextTool({
  meta: {
    id: 'remove-line-breaks',
    name: 'Line break remover',
    category: 'text',
    description: 'Join lines into one, or keep paragraphs apart.',
    keywords: ['newline', 'join lines', 'unwrap', 'paragraph'],
  },
  mode: 'space',
  example:
    'This sentence was wrapped\nby an old email client\nat a fixed width.\n\nA second paragraph\nstarts here.',
  files: true,
  render: (c) =>
    cleaner(c, {
      run,
      options: [
        { value: 'space', label: 'Join with spaces' },
        { value: 'none', label: 'Remove entirely' },
        { value: 'paragraphs', label: 'Keep paragraphs' },
      ],
      extra: (before) => [['Line breaks', String(before.split('\n').length - 1)]],
    }),
})
