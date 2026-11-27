import { columns, panel, stack } from '../kit.ts'
import { defineWorkbench, digestList, inputBox, sectionLabel } from './ui.ts'

export const run = (text: string, mode: string): string => {
  const bytes = new TextEncoder().encode(text)
  if (mode === 'adler32') {
    let a = 1
    let b = 0
    for (const byte of bytes) {
      a = (a + byte) % 65_521
      b = (b + a) % 65_521
    }
    return (((b << 16) | a) >>> 0).toString(16).padStart(8, '0')
  }
  let crc = 0xffffffff
  for (const byte of bytes) {
    crc ^= byte
    for (let step = 0; step < 8; step += 1) crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1
  }
  return ((crc ^ 0xffffffff) >>> 0).toString(16).padStart(8, '0')
}

export const checksums = defineWorkbench({
  meta: {
    id: 'checksums',
    name: 'CRC32 and Adler-32',
    category: 'developer',
    description: 'Fast checksums of text.',
    keywords: ['crc32', 'adler32', 'checksum', 'crc', 'hash'],
  },
  example: 'hello',
  view: (h, ctx) =>
    h.div(
      [h.Class(stack)],
      [
        columns(h, [
          panel(h, null, [
            inputBox(h, ctx, {
              id: 'checksums-input',
              label: 'Text',
              placeholder: 'Type or paste text',
              rows: 6,
            }),
          ]),
          panel(h, null, [
            sectionLabel(h, 'Checksums'),
            digestList(
              h,
              [
                ['CRC-32', run(ctx.input, 'crc32')],
                ['Adler-32', run(ctx.input, 'adler32')],
              ],
              '',
            ),
            digestList(
              h,
              [
                ['CRC-32 (dec)', String(Number.parseInt(run(ctx.input, 'crc32'), 16))],
                ['Adler-32 (dec)', String(Number.parseInt(run(ctx.input, 'adler32'), 16))],
              ],
              '',
            ),
          ]),
        ]),
      ],
    ),
})
