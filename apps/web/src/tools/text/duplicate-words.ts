import { defineTransform } from '../transform.ts'

export const run = (text: string): string => {
  const words = [...new Intl.Segmenter(undefined, { granularity: 'word' }).segment(text)]
    .filter((part) => part.isWordLike === true)
    .map((part) => part.segment.toLowerCase())
  const found: Array<string> = []
  let start = 0
  for (let i = 1; i <= words.length; i += 1) {
    if (words[i] === words[start]) continue
    if (i - start > 1) found.push(`${words[start]}: words ${start + 1}-${i}`)
    start = i
  }
  return found.length === 0 ? 'No repeated words.' : found.join('\n')
}

export const duplicateWords = defineTransform({
  meta: {
    id: 'duplicate-words',
    name: 'Repeated words',
    category: 'text',
    description: 'Find words typed twice in a row, such as the the.',
    keywords: ['duplicate words', 'repeated', 'typo', 'proofread', 'double'],
  },
  modes: [{ id: 'run', label: 'Run' }],
  placeholder: 'Type or paste text',
  acceptsFiles: true,
  example: 'the the cat sat sat down',
  present: 'list',
  run,
})
