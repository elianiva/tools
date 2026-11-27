import { card, chips, defineForm, errorText, field, hero, page } from './ui.ts'

export const run = (text: string): string => {
  const small = [
    'zero',
    'one',
    'two',
    'three',
    'four',
    'five',
    'six',
    'seven',
    'eight',
    'nine',
    'ten',
    'eleven',
    'twelve',
    'thirteen',
    'fourteen',
    'fifteen',
    'sixteen',
    'seventeen',
    'eighteen',
    'nineteen',
  ]
  const tens = [
    '',
    '',
    'twenty',
    'thirty',
    'forty',
    'fifty',
    'sixty',
    'seventy',
    'eighty',
    'ninety',
  ]
  const scales = ['', 'thousand', 'million', 'billion', 'trillion']
  const at = (list: ReadonlyArray<string>, index: number): string => list[index] ?? ''
  const chunk = (value: number): string => {
    const parts: Array<string> = []
    let rest = value
    if (rest >= 100) {
      parts.push(`${at(small, Math.floor(rest / 100))} hundred`)
      rest %= 100
    }
    if (rest > 0) {
      if (rest < 20) parts.push(at(small, rest))
      else {
        const unit = rest % 10
        parts.push(
          unit === 0
            ? at(tens, Math.floor(rest / 10))
            : `${at(tens, Math.floor(rest / 10))}-${at(small, unit)}`,
        )
      }
    }
    return parts.join(' ')
  }
  const clean = text.trim().replaceAll(/[,_\s]/gu, '')
  if (!/^-?\d+$/u.test(clean)) throw new Error('Enter a whole number, such as 1,234.')
  const negative = clean.startsWith('-')
  const digits = clean.replace(/^-/u, '').replace(/^0+(?=\d)/u, '')
  if (digits.length > 15) throw new Error('This tool goes up to 999 trillion.')
  let value = Number(digits)
  if (value === 0) return 'zero'
  const groups: Array<string> = []
  for (let scale = 0; value > 0; scale += 1) {
    const part = value % 1000
    if (part > 0) groups.unshift(`${chunk(part)}${scale > 0 ? ` ${at(scales, scale)}` : ''}`)
    value = Math.floor(value / 1000)
  }
  return `${negative ? 'minus ' : ''}${groups.join(' ')}`
}

const capital = (text: string): string => text.charAt(0).toUpperCase() + text.slice(1)

export const numberToWords = defineForm({
  meta: {
    id: 'number-to-words',
    name: 'Number to words',
    category: 'convert',
    description: 'Write a number out in English.',
    keywords: ['spell out', 'cheque', 'check', 'words', 'numeral'],
  },
  init: { n: '1234' },
  view: (form, h) => {
    const text = form.get('n')
    let words = ''
    let error = ''
    if (text.trim() !== '') {
      try {
        words = run(text)
      } catch (caught) {
        error = caught instanceof Error ? caught.message : ''
      }
    }
    return page(h, [
      card(h, null, [
        field(h, {
          id: 'n',
          label: 'Number',
          value: text,
          inputMode: 'numeric',
          invalid: error !== '',
          onInput: form.set('n'),
        }),
        chips(
          h,
          ['42', '1,001', '2,500,000', '-17'].map((label) => ({
            label,
            message: form.patch({ n: label }),
          })),
        ),
        errorText(h, error),
      ]),
      hero(h, 'Words', words),
      words === '' ? null : hero(h, 'Cheque', `${capital(words)} only`),
    ])
  },
})
