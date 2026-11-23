import { defineTransform } from '../transform.ts'

export const run = (text: string, mode: string): string => {
  return text
    .split('\n')
    .map((line) => {
      const value = line.trim()
      if (mode === 'to-letters') {
        if (!/^\d+$/u.test(value) || Number(value) < 1 || Number(value) > 16_384)
          throw new Error('Use a number from 1 to 16384.')
        let n = Number(value)
        let letters = ''
        while (n > 0) {
          n -= 1
          letters = String.fromCharCode(65 + (n % 26)) + letters
          n = Math.floor(n / 26)
        }
        return letters
      }
      const number = /^[A-Za-z]{1,3}$/u.test(value)
        ? Array.from(value.toUpperCase()).reduce(
            (sum, char) => sum * 26 + char.charCodeAt(0) - 64,
            0,
          )
        : 0
      if (number < 1 || number > 16_384) throw new Error('Use a column such as A, AZ, or XFD.')
      return String(number)
    })
    .join('\n')
}

export const excelColumn = defineTransform({
  meta: {
    id: 'excel-column',
    name: 'Spreadsheet columns',
    category: 'convert',
    description: 'Turn column letters into numbers and back.',
    keywords: ['excel', 'google sheets', 'column', 'letters', 'A1', 'spreadsheet'],
  },
  modes: [
    { id: 'to-number', label: 'Letters to number' },
    { id: 'to-letters', label: 'Number to letters' },
  ],
  placeholder: 'Type or paste text',
  acceptsFiles: true,
  example: 'A',
  run,
})
