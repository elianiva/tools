import { defineTransform } from '../transform.ts'

export const run = (text: string, mode: string): string => {
  const table: ReadonlyArray<readonly [number, string]> = [
    [1000, 'M'],
    [900, 'CM'],
    [500, 'D'],
    [400, 'CD'],
    [100, 'C'],
    [90, 'XC'],
    [50, 'L'],
    [40, 'XL'],
    [10, 'X'],
    [9, 'IX'],
    [5, 'V'],
    [4, 'IV'],
    [1, 'I'],
  ]
  const input = text.trim()
  if (mode === 'to-roman') {
    if (!/^\d+$/u.test(input)) throw new Error('Enter a whole number from 1 to 3999.')
    let value = Number(input)
    if (value < 1 || value > 3999) throw new Error('Roman numerals here run from 1 to 3999.')
    let out = ''
    for (const [size, symbol] of table) {
      while (value >= size) {
        out += symbol
        value -= size
      }
    }
    return out
  }
  const upper = input.toUpperCase()
  if (!/^M{0,3}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/u.test(upper) || upper === '') {
    throw new Error('This is not a valid Roman numeral.')
  }
  let rest = upper
  let total = 0
  for (const [size, symbol] of table) {
    while (rest.startsWith(symbol)) {
      total += size
      rest = rest.slice(symbol.length)
    }
  }
  return String(total)
}

export const romanNumerals = defineTransform({
  meta: {
    id: 'roman-numerals',
    name: 'Roman numerals',
    category: 'convert',
    description: 'Convert numbers to Roman numerals and back.',
    keywords: ['roman', 'numeral', 'mcm', 'latin'],
  },
  modes: [
    { id: 'to-roman', label: 'Number to Roman' },
    { id: 'from-roman', label: 'Roman to number' },
  ],
  placeholder: 'Type or paste text',
  example: '1994',
  run,
})
