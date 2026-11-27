import { card, cells, defineForm, errorText, field, linked, page, split } from './ui.ts'

export const run = (text: string, mode: string): string => {
  const [value, base = 16] = (text.match(/-?\d+(?:\.\d+)?/gu) ?? []).map(Number)
  if (value === undefined || base <= 0)
    throw new Error('Enter a number, and optionally a base size.')
  const clean = (n: number): number => Number(n.toFixed(4))
  return mode === 'rem-to-px' ? `${clean(value * base)}px` : `${clean(value / base)}rem`
}

const COMMON = [10, 12, 14, 16, 18, 20, 24, 32, 48, 64]

export const pxRem = defineForm({
  meta: {
    id: 'px-rem',
    name: 'Pixels and rem',
    category: 'convert',
    description: 'Convert px to rem and back for a base font size.',
    keywords: ['px', 'rem', 'css', 'font size', 'em'],
  },
  init: { src: 'px', text: '24', base: '16' },
  view: (form, h) => {
    const base = form.get('base')
    const pair = linked(
      h,
      form,
      [
        { key: 'px', label: 'Pixels', suffix: 'px' },
        { key: 'rem', label: 'Rem', suffix: 'rem' },
      ],
      (src, text) => {
        const out = run(`${text} ${base}`, src === 'px' ? 'px-to-rem' : 'rem-to-px')
        return src === 'px' ? { rem: out.replace('rem', '') } : { px: out.replace('px', '') }
      },
    )
    const size = Number(base)
    return page(h, [
      card(h, null, [
        pair.fields,
        field(h, {
          id: 'base',
          label: 'Base size',
          value: base,
          suffix: 'px',
          inputMode: 'decimal',
          onInput: form.set('base'),
        }),
        errorText(h, pair.error),
      ]),
      split(h, [
        card(h, 'Common sizes', [
          cells(
            h,
            size > 0 ? COMMON.map((px) => [`${px}px`, `${Number((px / size).toFixed(4))}rem`]) : [],
          ),
        ]),
      ]),
    ])
  },
})
