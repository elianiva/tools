import { defineTransform } from '../transform.ts'

export const run = (text: string): string => {
  const lines = text.split('\n').map((line) => line.replace(/\r$/u, ''))
  const [first, second] = lines
  if (lines.length !== 2 || first === undefined || second === undefined)
    throw new Error('Enter two lines to compare.')
  const letters = (value: string): string =>
    Array.from(value.normalize('NFD').replaceAll(/\p{M}/gu, '').toLowerCase())
      .filter((char) => /[\p{L}\p{N}]/u.test(char))
      .toSorted()
      .join('')
  return letters(first) === letters(second)
    ? 'Yes, they are anagrams.'
    : 'No, they are not anagrams.'
}

export const anagramChecker = defineTransform({
  meta: {
    id: 'anagram-checker',
    name: 'Anagram checker',
    category: 'text',
    description: 'Check if two lines use exactly the same letters.',
    keywords: ['anagram', 'letters', 'word game', 'scrabble', 'compare'],
  },
  modes: [{ id: 'run', label: 'Run' }],
  placeholder: 'Type or paste text',
  example: 'listen\nsilent',
  run,
})
