import { defineTransform } from '../transform.ts'

export const run = (text: string): string => {
  const lines = text.split('\n').map((line) => line.replace(/\r$/u, ''))
  const [first, second] = lines
  if (lines.length !== 2 || first === undefined || second === undefined)
    throw new Error('Enter two lines to compare.')
  const x = Array.from(first)
  const y = Array.from(second)
  let previous = Array.from({ length: y.length + 1 }, (_, index) => index)
  for (let i = 1; i <= x.length; i += 1) {
    const row = [i]
    for (let j = 1; j <= y.length; j += 1) {
      row.push(
        Math.min(
          (previous[j] ?? 0) + 1,
          (row[j - 1] ?? 0) + 1,
          (previous[j - 1] ?? 0) + (x[i - 1] === y[j - 1] ? 0 : 1),
        ),
      )
    }
    previous = row
  }
  const distance = previous[y.length] ?? 0
  const longest = Math.max(x.length, y.length)
  return `Distance: ${distance}\nSimilarity: ${longest === 0 ? '100.0' : ((1 - distance / longest) * 100).toFixed(1)}%`
}

export const editDistance = defineTransform({
  meta: {
    id: 'edit-distance',
    name: 'Edit distance',
    category: 'text',
    description: 'How many single-character edits turn one line into another.',
    keywords: ['levenshtein', 'edit distance', 'similarity', 'fuzzy', 'typo', 'compare'],
  },
  modes: [{ id: 'run', label: 'Run' }],
  placeholder: 'Two lines: kitten and sitting',
  example: 'kitten\nsitting',
  run,
})
