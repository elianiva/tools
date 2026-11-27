import { defineTextTool, frequency } from './ui.ts'

export const run = (text: string, mode: string): string => {
  const parts = [...new Intl.Segmenter().segment(text)]
    .map((part) => part.segment)
    .filter((char) => (mode === 'all' ? char.trim() !== '' : /\p{L}/u.test(char)))
  const counts = new Map<string, number>()
  for (const char of parts)
    counts.set(
      mode === 'letters' ? char.toLowerCase() : char,
      (counts.get(mode === 'letters' ? char.toLowerCase() : char) ?? 0) + 1,
    )
  if (parts.length === 0) throw new Error('Nothing to count.')
  return [...counts]
    .toSorted(([a, x], [b, y]) => y - x || a.localeCompare(b))
    .map(([char, count]) => `${char}  ${count}  ${((count / parts.length) * 100).toFixed(1)}%`)
    .join('\n')
}

export const characterFrequency = defineTextTool({
  meta: {
    id: 'character-frequency',
    name: 'Character frequency',
    category: 'text',
    description: 'Count how often each letter or character appears.',
    keywords: ['letters', 'histogram', 'count characters', 'frequency'],
  },
  mode: 'letters',
  example: 'Frequency counts every letter of this sentence.',
  files: true,
  render: (c) =>
    frequency(c, {
      run,
      noun: 'characters',
      options: [
        { value: 'letters', label: 'Letters only' },
        { value: 'all', label: 'Every character' },
      ],
    }),
})
