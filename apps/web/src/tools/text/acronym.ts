import { defineTransform } from '../transform.ts'

export const run = (text: string, mode: string): string => {
  const small = new Set(['a', 'an', 'and', 'at', 'by', 'for', 'in', 'of', 'on', 'or', 'the', 'to'])
  return text
    .split(/[\s-]+/u)
    .filter((word) => word !== '' && (mode === 'all' || !small.has(word.toLowerCase())))
    .map((word) => (Array.from(word)[0] ?? '').toUpperCase())
    .join('')
}

export const acronym = defineTransform({
  meta: {
    id: 'acronym',
    name: 'Acronym maker',
    category: 'text',
    description: 'Take the first letter of each word.',
    keywords: ['initials', 'abbreviation', 'acronym', 'shorten'],
  },
  modes: [
    { id: 'all', label: 'All words' },
    { id: 'skip', label: 'Skip small words' },
  ],
  placeholder: 'Type or paste text',
  example: 'portable network graphics',
  run,
})
