import { defineTransform } from '../transform.ts'

export const run = (text: string): string => {
  const words = [
    'Alfa',
    'Bravo',
    'Charlie',
    'Delta',
    'Echo',
    'Foxtrot',
    'Golf',
    'Hotel',
    'India',
    'Juliett',
    'Kilo',
    'Lima',
    'Mike',
    'November',
    'Oscar',
    'Papa',
    'Quebec',
    'Romeo',
    'Sierra',
    'Tango',
    'Uniform',
    'Victor',
    'Whiskey',
    'Xray',
    'Yankee',
    'Zulu',
  ]
  const digits = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine']
  return text
    .trim()
    .split(/\s+/u)
    .map((word) =>
      Array.from(word)
        .map((char) => {
          const code = char.toUpperCase().charCodeAt(0)
          if (code >= 65 && code <= 90) return words[code - 65] ?? char
          if (code >= 48 && code <= 57) return digits[code - 48] ?? char
          return char
        })
        .join(' '),
    )
    .join(' / ')
}

export const natoAlphabet = defineTransform({
  meta: {
    id: 'nato-alphabet',
    name: 'NATO alphabet',
    category: 'text',
    description: 'Spell text with Alfa, Bravo, Charlie.',
    keywords: ['phonetic', 'spelling', 'radio', 'alfa bravo'],
  },
  modes: [{ id: 'run', label: 'Run' }],
  placeholder: 'Type or paste text',
  example: 'Hi 5',
  present: 'tokens',
  run,
})
