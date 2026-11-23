import { defineTransform } from '../transform.ts'

export const run = (text: string): string => {
  const words = (text.match(/[A-Za-z']+/gu) ?? []).map((word) => word.toLowerCase())
  if (words.length === 0) throw new Error('Write some English text first.')
  const sentences = Math.max(1, (text.match(/[.!?]+(\s|$)/gu) ?? []).length)
  const syllables = (word: string): number => {
    const clean = word.replaceAll("'", '')
    let count = (clean.match(/[aeiouy]+/gu) ?? []).length
    if (clean.length > 2 && clean.endsWith('e') && !clean.endsWith('le') && count > 1) count -= 1
    return Math.max(1, count)
  }
  const total = words.reduce((sum, word) => sum + syllables(word), 0)
  const ease = 206.835 - 1.015 * (words.length / sentences) - 84.6 * (total / words.length)
  const grade = 0.39 * (words.length / sentences) + 11.8 * (total / words.length) - 15.59
  const label =
    ease >= 90
      ? 'Very easy'
      : ease >= 80
        ? 'Easy'
        : ease >= 70
          ? 'Fairly easy'
          : ease >= 60
            ? 'Plain English'
            : ease >= 50
              ? 'Fairly difficult'
              : ease >= 30
                ? 'Difficult'
                : 'Very difficult'
  return [
    `Words: ${words.length}`,
    `Sentences: ${sentences}`,
    `Syllables: ${total}`,
    `Flesch reading ease: ${ease.toFixed(1)} (${label})`,
    `Grade level: ${grade.toFixed(1)}`,
  ].join('\n')
}

export const readability = defineTransform({
  meta: {
    id: 'readability',
    name: 'Readability score',
    category: 'text',
    description: 'Flesch reading ease and grade level of English text.',
    keywords: ['flesch', 'grade', 'reading level', 'syllables', 'plain language'],
  },
  modes: [{ id: 'run', label: 'Run' }],
  placeholder: 'Type or paste text',
  acceptsFiles: true,
  run,
})
