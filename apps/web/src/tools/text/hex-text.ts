import { attempt, byteBreakdown, defineLab, directionBar, ioPanels, layout } from './ui-b.ts'
import { panel } from '../kit.ts'

export const run = (text: string, mode: string): string => {
  if (mode === 'to-hex') {
    return [...new TextEncoder().encode(text)]
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join(' ')
  }
  const clean = text.replaceAll(/0x|[\s,]/giu, '')
  if (!/^[0-9a-f]*$/iu.test(clean) || clean.length % 2 !== 0) {
    throw new Error('Use pairs of hexadecimal digits.')
  }
  const bytes = Uint8Array.from(clean.match(/../gu) ?? [], (pair) => Number.parseInt(pair, 16))
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes)
  } catch {
    throw new Error('These bytes are not valid UTF-8 text.')
  }
}

export const hexText = defineLab({
  meta: {
    id: 'hex-text',
    name: 'Text to hex',
    category: 'text',
    description: 'Convert text to hexadecimal bytes and back.',
    keywords: ['hex', 'hexadecimal', 'bytes', 'utf-8'],
  },
  mode: 'to-hex',
  example: 'Hi',
  view: (ctx) => {
    const { h, model } = ctx
    const encoding = model.mode === 'to-hex'
    const result =
      model.input.trim() === ''
        ? { value: '', error: '' }
        : attempt(() => run(model.input, model.mode))
    const text = encoding ? model.input : result.value
    return layout(
      h,
      [
        directionBar(ctx, {
          options: [
            { value: 'to-hex', label: 'Text to hex' },
            { value: 'from-hex', label: 'Hex to text' },
          ],
          swapTo:
            result.value === ''
              ? null
              : { input: result.value, mode: encoding ? 'from-hex' : 'to-hex' },
        }),
      ],
      [
        ioPanels(ctx, {
          inputLabel: encoding ? 'Text' : 'Hex',
          outputLabel: encoding ? 'Hex' : 'Text',
          placeholder: encoding ? 'Type or paste text' : '48 69',
          result,
        }),
        text === '' || result.error !== '' ? null : panel(h, 'Bytes', [byteBreakdown(h, text, 16)]),
      ],
    )
  },
})
