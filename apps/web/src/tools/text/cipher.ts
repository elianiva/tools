import { panel, segmented } from '../kit.ts'
import { defineLab, ioPanels, layout, tile, tileStrip } from './ui-b.ts'

export const run = (text: string, mode: string): string => {
  return Array.from(text, (char) => {
    const code = char.charCodeAt(0)
    if (mode === 'rot47')
      return code >= 33 && code <= 126 ? String.fromCharCode(33 + ((code - 33 + 47) % 94)) : char
    const lower = code >= 97 && code <= 122
    const upper = code >= 65 && code <= 90
    if (!lower && !upper) return char
    const base = lower ? 97 : 65
    const index = code - base
    return String.fromCharCode(base + (mode === 'atbash' ? 25 - index : (index + 13) % 26))
  }).join('')
}
export const cipher = defineLab({
  meta: {
    id: 'cipher',
    name: 'Simple ciphers',
    category: 'text',
    description: 'ROT13, ROT47, and Atbash.',
    keywords: ['rot13', 'rot47', 'atbash', 'caesar', 'encode', 'obfuscate'],
  },
  mode: 'rot13',
  example: 'Hello',
  view: (ctx) => {
    const { h, model } = ctx
    const chars =
      model.mode === 'rot47'
        ? Array.from({ length: 94 }, (_, index) => String.fromCharCode(33 + index))
        : Array.from({ length: 26 }, (_, index) => String.fromCharCode(65 + index))
    const used = new Set(Array.from(model.input.toUpperCase()).concat(Array.from(model.input)))
    return layout(
      h,
      [
        segmented(h, {
          label: 'Cipher',
          value: model.mode,
          options: [
            { value: 'rot13', label: 'ROT13' },
            { value: 'rot47', label: 'ROT47' },
            { value: 'atbash', label: 'Atbash' },
          ],
          onSelect: ctx.onMode,
        }),
      ],
      [
        ioPanels(ctx, {
          inputLabel: 'Input',
          outputLabel: 'Output',
          placeholder: 'Type or paste text',
          result: { value: run(model.input, model.mode), error: '' },
        }),
        panel(h, 'Mapping', [
          tileStrip(
            h,
            chars.map((char) =>
              tile(h, {
                top: char,
                join: '↓',
                bottom: run(char, model.mode),
                state: used.has(char) ? 'on' : 'plain',
              }),
            ),
          ),
        ]),
      ],
    )
  },
})
