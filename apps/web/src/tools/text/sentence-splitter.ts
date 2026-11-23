import { defineTransform } from '../transform.ts'

export const run = (text: string): string => {
  return [...new Intl.Segmenter('en', { granularity: 'sentence' }).segment(text)]
    .map((part) => part.segment.trim())
    .filter((sentence) => sentence !== '')
    .join('\n')
}

export const sentenceSplitter = defineTransform({
  meta: {
    id: 'sentence-splitter',
    name: 'Sentence splitter',
    category: 'text',
    description: 'Put every sentence on its own line.',
    keywords: ['sentences', 'split', 'lines', 'break'],
  },
  modes: [{ id: 'run', label: 'Run' }],
  placeholder: 'Type or paste text',
  acceptsFiles: true,
  example: 'Hi there. How are you? Fine!',
  present: 'list',
  run,
})
