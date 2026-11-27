import { formatHex, hsl, parse } from 'culori'
import { range } from '../kit.ts'
import { describeColor } from './color.logic.ts'
import {
  card,
  defineForm,
  errorText,
  field,
  page,
  parseColumns,
  rows,
  split,
  swatch,
} from './ui.ts'

type Channel = 'h' | 's' | 'l'

export const color = defineForm({
  meta: {
    id: 'color',
    name: 'Color converter',
    category: 'convert',
    description: 'HEX, RGB, HSL and OKLCH from any CSS color.',
    keywords: ['hex', 'rgb', 'hsl', 'oklch', 'css', 'colour', 'palette'],
  },
  init: { text: '#3b82f6' },
  view: (form, h) => {
    const text = form.get('text')
    let lines: ReadonlyArray<readonly [string, string]> = []
    let error = ''
    if (text.trim() !== '') {
      try {
        lines = parseColumns(describeColor(text))
      } catch (caught) {
        error = caught instanceof Error ? caught.message : ''
      }
    }
    const parsed = error === '' ? parse(text.trim()) : undefined
    const current = hsl(parsed ?? { mode: 'rgb', r: 0, g: 0, b: 0 })
    const slider = (key: Channel, label: string, max: number, scale: number) =>
      h.div(
        [],
        [
          h.label([h.For(`slider-${key}`)], [label]),
          range(h, {
            id: `slider-${key}`,
            min: 0,
            max,
            value: Math.round((current[key] ?? 0) * scale),
            onInput: (value) =>
              form.patch({
                text: formatHex({ ...current, h: current.h ?? 0, [key]: value / scale }),
              }),
          }),
        ],
      )
    return page(h, [
      split(h, [
        card(h, null, [
          swatch(h, error === '' ? text : ''),
          field(h, {
            id: 'color',
            label: 'Color',
            value: text,
            invalid: error !== '',
            onInput: form.set('text'),
          }),
          h.input([
            h.Type('color'),
            h.AriaLabel('Pick a color'),
            h.Value(parsed === undefined ? '#000000' : formatHex(parsed)),
            h.OnInput(form.set('text')),
          ]),
          errorText(h, error),
        ]),
        card(h, 'Adjust', [
          slider('h', 'Hue', 360, 1),
          slider('s', 'Saturation', 100, 100),
          slider('l', 'Lightness', 100, 100),
        ]),
      ]),
      lines.length === 0 ? null : card(h, 'Formats', [rows(h, lines)]),
    ])
  },
})
