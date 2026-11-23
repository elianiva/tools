import { defineTransform } from '../transform.ts'

export const run = (text: string): string => {
  let vowels = 0
  let consonants = 0
  let other = 0
  for (const char of Array.from(text.normalize('NFD').replaceAll(/\p{M}/gu, ''))) {
    if (/[aeiou]/iu.test(char)) vowels += 1
    else if (/\p{L}/u.test(char)) consonants += 1
    else other += 1
  }
  return `Vowels: ${vowels}\nConsonants: ${consonants}\nOther: ${other}`
}

export const vowelCounter = defineTransform({
  meta: {
    id: 'vowel-counter',
    name: 'Vowel counter',
    category: 'text',
    description: 'Count vowels, consonants, and other characters.',
    keywords: ['vowels', 'consonants', 'letters', 'count', 'aeiou'],
  },
  modes: [{ id: 'run', label: 'Run' }],
  placeholder: 'Type or paste text',
  acceptsFiles: true,
  example: 'Hello World',
  present: 'facts',
  run,
})
