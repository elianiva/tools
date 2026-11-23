import { defineTransform } from '../transform.ts'

export const run = (text: string, mode: string): string => {
  const vocabulary = [
    'lorem',
    'ipsum',
    'dolor',
    'sit',
    'amet',
    'consectetur',
    'adipiscing',
    'elit',
    'sed',
    'do',
    'eiusmod',
    'tempor',
    'incididunt',
    'ut',
    'labore',
    'et',
    'dolore',
    'magna',
    'aliqua',
    'enim',
    'ad',
    'minim',
    'veniam',
    'quis',
    'nostrud',
    'exercitation',
    'ullamco',
    'laboris',
    'nisi',
    'aliquip',
    'ex',
    'ea',
    'commodo',
    'consequat',
    'duis',
    'aute',
    'irure',
    'in',
    'reprehenderit',
    'voluptate',
  ]
  const count = Math.min(200, Math.max(1, Number.parseInt(text, 10) || 1))
  let cursor = 0
  const word = (): string => {
    const index = (cursor + Math.floor(cursor / vocabulary.length) * 3) % vocabulary.length
    cursor += 1
    return vocabulary[index] ?? 'lorem'
  }
  const sentence = (n: number): string => {
    const words = Array.from({ length: 8 + (n % 7) }, word)
    return `${words.join(' ').replace(/^./u, (first) => first.toUpperCase())}.`
  }
  if (mode === 'words') return Array.from({ length: count }, word).join(' ')
  if (mode === 'sentences') return Array.from({ length: count }, (_, n) => sentence(n)).join(' ')
  return Array.from({ length: count }, (_, p) =>
    Array.from({ length: 4 }, (__, s) => sentence(p * 4 + s)).join(' '),
  ).join('\n\n')
}

export const loremIpsum = defineTransform({
  meta: {
    id: 'lorem-ipsum',
    name: 'Lorem ipsum',
    category: 'generate',
    description: 'Placeholder paragraphs, sentences, or words. Type how many.',
    keywords: ['lorem', 'ipsum', 'placeholder', 'dummy text', 'filler'],
  },
  modes: [
    { id: 'paragraphs', label: 'Paragraphs' },
    { id: 'sentences', label: 'Sentences' },
    { id: 'words', label: 'Words' },
  ],
  placeholder: '3',
  example: '3',
  run,
})
