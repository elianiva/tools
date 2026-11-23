import { defineTransform } from '../transform.ts'

export const run = (text: string): string => {
  const words = [...new Intl.Segmenter(undefined, { granularity: 'word' }).segment(text)]
    .filter((part) => part.isWordLike === true)
    .map((part) => part.segment.toLowerCase())
  if (words.length === 0) throw new Error('No words found.')
  const counts = new Map<string, number>()
  for (const word of words) counts.set(word, (counts.get(word) ?? 0) + 1)
  return [...counts]
    .toSorted(([a, x], [b, y]) => y - x || a.localeCompare(b))
    .map(([word, count]) => `${word}  ${count}`)
    .join('\n')
}

export const wordFrequency = defineTransform({
  meta: {
    id: 'word-frequency',
    name: 'Word frequency',
    category: 'text',
    description: 'List your most used words.',
    keywords: ['words', 'count', 'repeated', 'keywords', 'histogram'],
  },
  modes: [{ id: 'run', label: 'Run' }],
  placeholder: 'Type or paste text',
  acceptsFiles: true,
  example: 'the cat the dog',
  present: 'bars',
  run,
})
