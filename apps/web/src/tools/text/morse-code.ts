import { defineTransform } from '../transform.ts'

export const run = (text: string, mode: string): string => {
  const letters: Readonly<Record<string, string>> = {
    A: '.-',
    B: '-...',
    C: '-.-.',
    D: '-..',
    E: '.',
    F: '..-.',
    G: '--.',
    H: '....',
    I: '..',
    J: '.---',
    K: '-.-',
    L: '.-..',
    M: '--',
    N: '-.',
    O: '---',
    P: '.--.',
    Q: '--.-',
    R: '.-.',
    S: '...',
    T: '-',
    U: '..-',
    V: '...-',
    W: '.--',
    X: '-..-',
    Y: '-.--',
    Z: '--..',
    '0': '-----',
    '1': '.----',
    '2': '..---',
    '3': '...--',
    '4': '....-',
    '5': '.....',
    '6': '-....',
    '7': '--...',
    '8': '---..',
    '9': '----.',
  }
  if (mode === 'decode') {
    const reverse = new Map(Object.entries(letters).map(([char, code]) => [code, char]))
    return text
      .trim()
      .split(/\s*\/\s*|\s{3,}/u)
      .map((word) =>
        word
          .split(/\s+/u)
          .map((code) => {
            const char = reverse.get(code)
            if (char === undefined) throw new Error(`"${code}" is not a Morse letter.`)
            return char
          })
          .join(''),
      )
      .join(' ')
  }
  return text
    .trim()
    .toUpperCase()
    .split(/\s+/u)
    .map((word) =>
      Array.from(word)
        .map((char) => {
          const code = letters[char]
          if (code === undefined) throw new Error(`No Morse code for "${char}".`)
          return code
        })
        .join(' '),
    )
    .join(' / ')
}

export const morseCode = defineTransform({
  meta: {
    id: 'morse-code',
    name: 'Morse code',
    category: 'text',
    description: 'Translate text to Morse code and back.',
    keywords: ['morse', 'sos', 'dots', 'dashes', 'telegraph'],
  },
  modes: [
    { id: 'encode', label: 'Text to Morse' },
    { id: 'decode', label: 'Morse to text' },
  ],
  placeholder: 'Type or paste text',
  run,
})
