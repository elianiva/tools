import { css } from '../../../styled-system/css'
import { button, panel, range, segmented } from '../kit.ts'
import { defineLab, ioPanels, layout, tile, tileStrip } from './ui-b.ts'

export const run = (text: string, mode: string): string => {
  const shift = Number(mode)
  return Array.from(text, (char) => {
    const code = char.charCodeAt(0)
    const base = code >= 97 && code <= 122 ? 97 : code >= 65 && code <= 90 ? 65 : 0
    return base === 0 ? char : String.fromCharCode(base + ((code - base + shift) % 26))
  }).join('')
}
const listCls = css({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 18rem), 1fr))',
  gap: '0.3rem',
  '& button': {
    display: 'flex',
    gap: '0.7rem',
    justifyContent: 'flex-start',
    textAlign: 'left',
    fontFamily: 'var(--mono)',
    fontSize: '0.8rem',
    minWidth: 0,
    '& span:last-child': { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
    '& span:first-child': { color: 'var(--muted-foreground)', minWidth: '1.6rem' },
  },
  '& button[aria-pressed="true"]': { outline: '2px solid var(--primary)' },
})
const sliderCls = css({
  display: 'flex',
  alignItems: 'center',
  gap: '0.6rem',
  minWidth: '15rem',
  '& label': { fontSize: '0.85rem', fontWeight: 550, whiteSpace: 'nowrap' },
})
const ALPHABET = Array.from({ length: 26 }, (_, index) => String.fromCharCode(65 + index))

export const caesarCipher = defineLab({
  meta: {
    id: 'caesar-cipher',
    name: 'Caesar cipher',
    category: 'text',
    description: 'Shift letters by a fixed number of places.',
    keywords: ['caesar', 'shift', 'cipher', 'encrypt', 'rot'],
  },
  mode: '3',
  example: 'Attack at dawn',
  view: (ctx) => {
    const { h, model } = ctx
    const shift = Number(model.mode)
    const decrypt = model.flag
    const apply = (amount: number): string =>
      run(model.input, String(decrypt ? (26 - amount) % 26 : amount))
    const used = new Set(Array.from(model.input.toUpperCase()))
    return layout(
      h,
      [
        segmented(h, {
          label: 'Direction',
          value: decrypt ? 'decrypt' : 'encrypt',
          options: [
            { value: 'encrypt', label: 'Encrypt' },
            { value: 'decrypt', label: 'Decrypt' },
          ],
          onSelect: (value) => ctx.onFlag(value === 'decrypt'),
        }),
        h.div(
          [h.Class(sliderCls)],
          [
            h.label([h.For('caesar-shift')], [`Shift ${shift}`]),
            range(h, {
              id: 'caesar-shift',
              min: 1,
              max: 25,
              value: shift,
              onInput: (value) => ctx.onMode(String(value)),
            }),
          ],
        ),
      ],
      [
        ioPanels(ctx, {
          inputLabel: decrypt ? 'Ciphertext' : 'Plaintext',
          outputLabel: decrypt ? 'Plaintext' : 'Ciphertext',
          placeholder: 'Type or paste text',
          result: { value: apply(shift), error: '' },
        }),
        panel(h, 'Alphabet', [
          tileStrip(
            h,
            ALPHABET.map((letter) =>
              tile(h, {
                top: letter,
                join: '↓',
                bottom: run(letter, String(decrypt ? (26 - shift) % 26 : shift)),
                state: used.has(letter) ? 'on' : 'plain',
              }),
            ),
          ),
        ]),
        model.input === ''
          ? null
          : panel(h, 'All shifts', [
              h.div(
                [h.Class(listCls)],
                Array.from({ length: 25 }, (_, index) => index + 1).map((amount) =>
                  button(
                    h,
                    { variant: 'ghost', size: 'sm' },
                    [
                      h.AriaPressed(String(amount === shift)),
                      h.OnClick(ctx.onMode(String(amount))),
                    ],
                    [h.span([], [String(amount)]), h.span([], [apply(amount)])],
                  ),
                ),
              ),
            ]),
      ],
    )
  },
})
