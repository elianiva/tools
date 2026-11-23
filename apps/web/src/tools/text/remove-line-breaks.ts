import { defineTransform } from '../transform.ts'

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

export const removeLineBreaks = defineTransform({
  meta: {
    id: 'remove-line-breaks',
    name: 'Line break remover',
    category: 'text',
    description: 'Join lines into one, or keep paragraphs apart.',
    keywords: ['newline', 'join lines', 'unwrap', 'paragraph'],
  },
  modes: [
    { id: 'space', label: 'Join with spaces' },
    { id: 'none', label: 'Remove entirely' },
    { id: 'paragraphs', label: 'Keep paragraphs' },
  ],
  placeholder: 'Type or paste text',
  acceptsFiles: true,
  example: 'a\n b',
  present: 'display',
  run,
})
