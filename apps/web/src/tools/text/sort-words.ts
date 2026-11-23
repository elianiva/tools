import { defineTransform } from '../transform.ts'

export const run = (text: string, mode: string): string => {
  const words = text.split(/\s+/u).filter((word) => word !== '')
  if (mode === 'unique') return [...new Set(words)].join(' ')
  if (mode === 'length') {
    return words.toSorted((a, b) => a.length - b.length || a.localeCompare(b)).join(' ')
  }
  const sorted = words.toSorted((a, b) => a.localeCompare(b))
  return (mode === 'desc' ? sorted.toReversed() : sorted).join(' ')
}

export const sortWords = defineTransform({
  meta: {
    id: 'sort-words',
    name: 'Word sorter',
    category: 'text',
    description: 'Sort the words of a text, drop repeats, or order by length.',
    keywords: ['alphabetical', 'unique', 'words', 'order'],
  },
  modes: [
    { id: 'asc', label: 'A–Z' },
    { id: 'desc', label: 'Z–A' },
    { id: 'length', label: 'By length' },
    { id: 'unique', label: 'Unique' },
  ],
  placeholder: 'Type or paste text',
  run,
})
