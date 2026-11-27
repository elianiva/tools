import { attempt, defineLab, directionBar, ioPanels, layout, tile, wordGroups } from './ui-b.ts'
import { panel } from '../kit.ts'

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
const safe = (compute: () => string): string => {
  try {
    return compute()
  } catch {
    return '?'
  }
}

export const morseCode = defineLab({
  meta: {
    id: 'morse-code',
    name: 'Morse code',
    category: 'text',
    description: 'Translate text to Morse code and back.',
    keywords: ['morse', 'sos', 'dots', 'dashes', 'telegraph'],
  },
  mode: 'encode',
  example: 'SOS',
  view: (ctx) => {
    const { h, model } = ctx
    const encoding = model.mode === 'encode'
    const result =
      model.input.trim() === ''
        ? { value: '', error: '' }
        : attempt(() => run(model.input, model.mode))
    const words = encoding
      ? model.input.trim().toUpperCase().split(/\s+/u)
      : model.input.trim().split(/\s*\/\s*|\s{3,}/u)
    const groups = words
      .filter((word) => word !== '')
      .map((word) =>
        (encoding ? Array.from(word) : word.split(/\s+/u).filter((code) => code !== '')).map(
          (part) => {
            const other = safe(() => run(part, model.mode))
            return tile(h, {
              top: part,
              bottom: other,
              state: other === '?' ? 'diff' : 'plain',
            })
          },
        ),
      )
    return layout(
      h,
      [
        directionBar(ctx, {
          options: [
            { value: 'encode', label: 'Text to Morse' },
            { value: 'decode', label: 'Morse to text' },
          ],
          swapTo:
            result.value === ''
              ? null
              : { input: result.value, mode: encoding ? 'decode' : 'encode' },
        }),
      ],
      [
        ioPanels(ctx, {
          inputLabel: encoding ? 'Text' : 'Morse',
          outputLabel: encoding ? 'Morse' : 'Text',
          placeholder: encoding ? 'Type or paste text' : '... --- ...',
          result,
        }),
        groups.length === 0 ? null : panel(h, 'Letters', [wordGroups(h, groups)]),
      ],
    )
  },
})
