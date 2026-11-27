import { card, cells, defineForm, errorText, linked, page } from './ui.ts'

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

export const excelColumn = defineForm({
  meta: {
    id: 'excel-column',
    name: 'Spreadsheet columns',
    category: 'convert',
    description: 'Turn column letters into numbers and back.',
    keywords: ['excel', 'google sheets', 'column', 'letters', 'A1', 'spreadsheet'],
  },
  init: { src: 'letters', text: 'AZ' },
  view: (form, h) => {
    const pair = linked(
      h,
      form,
      [
        { key: 'letters', label: 'Letters' },
        { key: 'number', label: 'Number' },
      ],
      (src, text) =>
        src === 'letters'
          ? { number: run(text, 'to-number') }
          : { letters: run(text, 'to-letters') },
    )
    const n = Number(pair.values['number'] ?? form.get('text'))
    const near =
      pair.error === '' && Number.isInteger(n)
        ? [n - 2, n - 1, n, n + 1, n + 2]
            .filter((value) => value >= 1 && value <= 16_384)
            .map((value) => [String(value), run(String(value), 'to-letters')] as const)
        : []
    return page(h, [
      card(h, null, [pair.fields, errorText(h, pair.error)]),
      near.length === 0 ? null : card(h, 'Nearby', [cells(h, near)]),
    ])
  },
})
