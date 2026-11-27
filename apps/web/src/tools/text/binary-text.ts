import { attempt, byteBreakdown, defineLab, directionBar, ioPanels, layout } from './ui-b.ts'
import { panel } from '../kit.ts'

export const run = (text: string, mode: string): string => {
  if (mode === 'to-binary') {
    return [...new TextEncoder().encode(text)]
      .map((byte) => byte.toString(2).padStart(8, '0'))
      .join(' ')
  }
  const clean = text.replaceAll(/\s+/gu, '')
  if (!/^[01]+$/u.test(clean) || clean.length % 8 !== 0) {
    throw new Error('Use groups of eight 0s and 1s.')
  }
  const bytes = Uint8Array.from(clean.match(/.{8}/gu) ?? [], (bits) => Number.parseInt(bits, 2))
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes)
  } catch {
    throw new Error('These bytes are not valid UTF-8 text.')
  }
}

export const binaryText = defineLab({
  meta: {
    id: 'binary-text',
    name: 'Text to binary',
    category: 'text',
    description: 'Convert text to binary and back.',
    keywords: ['binary', 'bits', '0 and 1', 'utf-8'],
  },
  mode: 'to-binary',
  example: 'Hi',
  view: (ctx) => {
    const { h, model } = ctx
    const encoding = model.mode === 'to-binary'
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
            { value: 'to-binary', label: 'Text to binary' },
            { value: 'from-binary', label: 'Binary to text' },
          ],
          swapTo:
            result.value === ''
              ? null
              : { input: result.value, mode: encoding ? 'from-binary' : 'to-binary' },
        }),
      ],
      [
        ioPanels(ctx, {
          inputLabel: encoding ? 'Text' : 'Binary',
          outputLabel: encoding ? 'Binary' : 'Text',
          placeholder: encoding ? 'Type or paste text' : '01001000 01101001',
          result,
        }),
        text === '' || result.error !== '' ? null : panel(h, 'Bytes', [byteBreakdown(h, text, 2)]),
      ],
    )
  },
})
