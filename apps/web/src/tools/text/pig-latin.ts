import { defineTransform } from '../transform.ts'

export const run = (text: string): string => {
  return text.replaceAll(/[A-Za-z]+/gu, (word) => {
    const lower = word.toLowerCase()
    const vowel = lower.search(/[aeiou]/u)
    const out =
      vowel === 0
        ? `${lower}way`
        : vowel === -1
          ? `${lower}ay`
          : `${lower.slice(vowel)}${lower.slice(0, vowel)}ay`
    return word.charAt(0) === word.charAt(0).toLowerCase()
      ? out
      : out.charAt(0).toUpperCase() + out.slice(1)
  })
}

export const pigLatin = defineTransform({
  meta: {
    id: 'pig-latin',
    name: 'Pig Latin',
    category: 'text',
    description: 'Translate English into Pig Latin.',
    keywords: ['pig latin', 'game', 'translate', 'fun'],
  },
  modes: [{ id: 'run', label: 'Run' }],
  placeholder: 'Type or paste text',
  example: 'hello world',
  present: 'display',
  run,
})
