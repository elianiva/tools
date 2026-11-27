import { panel } from '../kit.ts'
import {
  attempt,
  banner,
  defineLab,
  errorLine,
  inputPanel,
  layout,
  tile,
  tileStrip,
} from './ui-b.ts'

export const run = (text: string): string => {
  const cleaned = Array.from(text.normalize('NFD').replaceAll(/\p{M}/gu, '').toLowerCase()).filter(
    (char) => /[\p{L}\p{N}]/u.test(char),
  )
  if (cleaned.length === 0) throw new Error('Enter some letters or digits.')
  return cleaned.join('') === cleaned.toReversed().join('')
    ? 'Yes, it is a palindrome.'
    : 'No, it is not a palindrome.'
}
export const palindrome = defineLab({
  meta: {
    id: 'palindrome',
    name: 'Palindrome checker',
    category: 'text',
    description: 'Check if a text reads the same backwards.',
    keywords: ['palindrome', 'reverse', 'madam', 'racecar'],
  },
  example: 'A man, a plan, a canal: Panama',
  view: (ctx) => {
    const { h, model } = ctx
    const result =
      model.input.trim() === '' ? { value: '', error: '' } : attempt(() => run(model.input))
    const cleaned = Array.from(
      model.input.normalize('NFD').replaceAll(/\p{M}/gu, '').toLowerCase(),
    ).filter((char) => /[\p{L}\p{N}]/u.test(char))
    const yes = result.value.startsWith('Yes')
    return layout(
      h,
      [],
      [
        inputPanel(ctx, { label: 'Text', placeholder: 'Type or paste text', rows: 4 }),
        result.value === ''
          ? errorLine(h, result.error)
          : banner(h, {
              yes,
              title: yes ? 'Palindrome' : 'Not a palindrome',
              detail: `Checked ${cleaned.length} letters and digits.`,
            }),
        result.value === ''
          ? null
          : panel(h, 'Forward over backward', [
              tileStrip(
                h,
                cleaned.slice(0, 120).map((char, index) => {
                  const back = cleaned[cleaned.length - 1 - index] ?? ''
                  return tile(h, {
                    top: char,
                    bottom: back,
                    state: char === back ? 'same' : 'diff',
                  })
                }),
              ),
            ]),
      ],
    )
  },
})
