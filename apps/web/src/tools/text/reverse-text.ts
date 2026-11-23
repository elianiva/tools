import { defineTransform } from '../transform.ts'

export const run = (text: string, mode: string): string => {
  if (mode === 'lines') return text.split('\n').toReversed().join('\n')
  if (mode === 'words') {
    return text
      .split('\n')
      .map((line) => line.trim().split(/\s+/u).toReversed().join(' '))
      .join('\n')
  }
  return [...new Intl.Segmenter().segment(text)]
    .map((part) => part.segment)
    .toReversed()
    .join('')
}

export const reverseText = defineTransform({
  meta: {
    id: 'reverse-text',
    name: 'Reverse text',
    category: 'text',
    description: 'Reverse characters, words, or lines.',
    keywords: ['flip', 'backwards', 'mirror'],
  },
  modes: [
    { id: 'chars', label: 'Characters' },
    { id: 'words', label: 'Word order' },
    { id: 'lines', label: 'Line order' },
  ],
  placeholder: 'Type or paste text',
  run,
})
