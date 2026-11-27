import { card, defineForm, errorText, field, page, rows } from './ui.ts'

export const run = (text: string, mode: string): string => {
  const clean = text.trim().replaceAll(/[,_\s]/gu, '')
  const value = Number(clean)
  if (clean === '' || !Number.isFinite(value))
    throw new Error('Enter a number such as 1234567.891.')
  const locales: Readonly<Record<string, string>> = {
    en: 'en-US',
    de: 'de-DE',
    in: 'en-IN',
    id: 'id-ID',
  }
  return new Intl.NumberFormat(locales[mode] ?? 'en-US', { maximumFractionDigits: 20 }).format(
    value,
  )
}

const LOCALES: ReadonlyArray<readonly [string, string]> = [
  ['en', 'English'],
  ['de', 'German'],
  ['in', 'Indian'],
  ['id', 'Indonesian'],
]

export const numberFormat = defineForm({
  meta: {
    id: 'number-format',
    name: 'Number formatter',
    category: 'convert',
    description: 'Group digits the way English, German, Indian, or Indonesian readers expect.',
    keywords: ['thousands separator', 'locale', 'format number', 'comma', 'lakh'],
  },
  init: { n: '1234567.891' },
  view: (form, h) => {
    const text = form.get('n')
    let error = ''
    let out: ReadonlyArray<readonly [string, string]> = []
    if (text.trim() !== '') {
      try {
        out = LOCALES.map(([id, label]) => [label, run(text, id)] as const)
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
          inputMode: 'decimal',
          invalid: error !== '',
          onInput: form.set('n'),
        }),
        errorText(h, error),
      ]),
      out.length === 0 ? null : card(h, null, [rows(h, out)]),
    ])
  },
})
