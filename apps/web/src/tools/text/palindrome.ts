import { defineTransform } from '../transform.ts'

export const run = (text: string): string => {
  const cleaned = Array.from(text.normalize('NFD').replaceAll(/\p{M}/gu, '').toLowerCase()).filter(
    (char) => /[\p{L}\p{N}]/u.test(char),
  )
  if (cleaned.length === 0) throw new Error('Enter some letters or digits.')
  return cleaned.join('') === cleaned.toReversed().join('')
    ? 'Yes, it is a palindrome.'
    : 'No, it is not a palindrome.'
}

export const palindrome = defineTransform({
  meta: {
    id: 'palindrome',
    name: 'Palindrome checker',
    category: 'text',
    description: 'Check if a text reads the same backwards.',
    keywords: ['palindrome', 'reverse', 'madam', 'racecar'],
  },
  modes: [{ id: 'run', label: 'Run' }],
  placeholder: 'Type or paste text',
  example: 'A man, a plan, a canal: Panama',
  run,
})
