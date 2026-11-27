import { card, defineForm, errorText, field, page, split, swatch } from './ui.ts'

export const run = (text: string, mode: string): string => {
  if (mode === 'to-hex') {
    const values = (text.match(/\d+(?:\.\d+)?/gu) ?? []).map(Number)
    if (values.length !== 4 || values.some((value) => value > 100))
      throw new Error('Enter four percentages, C M Y K, such as 76 47 0 4.')
    const [c = 0, m = 0, y = 0, k = 0] = values
    const channel = (ink: number): string =>
      Math.round(255 * (1 - ink / 100) * (1 - k / 100))
        .toString(16)
        .padStart(2, '0')
    return `#${channel(c)}${channel(m)}${channel(y)}`
  }
  const hex = text.trim().replace('#', '')
  const full =
    hex.length === 3
      ? hex
          .split('')
          .map((char) => char + char)
          .join('')
      : hex
  if (!/^[0-9a-f]{6}$/iu.test(full)) throw new Error('Enter a hex color such as #3b82f6.')
  const [r = 0, g = 0, b = 0] = [0, 2, 4].map(
    (start) => Number.parseInt(full.slice(start, start + 2), 16) / 255,
  )
  const k = 1 - Math.max(r, g, b)
  const part = (value: number): number =>
    k === 1 ? 0 : Math.round(((1 - value - k) / (1 - k)) * 100)
  return `CMYK: ${part(r)}% ${part(g)}% ${part(b)}% ${Math.round(k * 100)}%`
}

const INKS: ReadonlyArray<readonly [string, string]> = [
  ['c', 'Cyan'],
  ['m', 'Magenta'],
  ['y', 'Yellow'],
  ['k', 'Black'],
]

export const cmyk = defineForm({
  meta: {
    id: 'cmyk',
    name: 'CMYK converter',
    category: 'convert',
    description: 'Convert a hex color to CMYK percentages and back.',
    keywords: ['cmyk', 'print', 'hex', 'color', 'percent', 'ink'],
  },
  init: { src: 'hex', hex: '#3b82f6', c: '76', m: '47', y: '0', k: '4' },
  view: (form, h) => {
    const fromHex = form.get('src') === 'hex'
    let hex = form.get('hex')
    let inks: Readonly<Record<string, string>> = {
      c: form.get('c'),
      m: form.get('m'),
      y: form.get('y'),
      k: form.get('k'),
    }
    let error = ''
    try {
      if (fromHex) {
        const [c = '', m = '', y = '', k = ''] = run(hex, 'to-cmyk').match(/\d+/gu) ?? []
        inks = { c, m, y, k }
      } else {
        hex = run(INKS.map(([key]) => inks[key] ?? '').join(' '), 'to-hex')
      }
    } catch (caught) {
      error = caught instanceof Error ? caught.message : ''
    }
    return page(h, [
      split(h, [
        card(h, null, [
          swatch(h, error === '' ? hex : ''),
          field(h, {
            id: 'hex',
            label: 'Hex',
            value: hex,
            copy: true,
            invalid: error !== '' && fromHex,
            onInput: (value) => form.patch({ src: 'hex', hex: value }),
          }),
          errorText(h, error),
        ]),
        card(
          h,
          'CMYK',
          INKS.map(([key, label]) =>
            field(h, {
              id: key,
              label,
              value: inks[key] ?? '',
              suffix: '%',
              inputMode: 'numeric',
              onInput: (value) =>
                form.patch({
                  src: 'cmyk',
                  c: inks['c'] ?? '',
                  m: inks['m'] ?? '',
                  y: inks['y'] ?? '',
                  k: inks['k'] ?? '',
                  [key]: value,
                }),
            }),
          ),
        ),
      ]),
    ])
  },
})
