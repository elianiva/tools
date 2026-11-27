import { checkbox, columns, panel, stack } from '../kit.ts'
import { hashText } from './hash.logic.ts'
import { counts, defineWorkbench, digestList, inputBox, sectionLabel, textField } from './ui.ts'

const ALGORITHMS = [
  ['SHA-256', 'sha256'],
  ['SHA-512', 'sha512'],
  ['SHA-1', 'sha1'],
  ['MD5', 'md5'],
] as const

export const hash = defineWorkbench({
  meta: {
    id: 'hash',
    name: 'Hash generator',
    category: 'developer',
    description: 'SHA-256, SHA-512, SHA-1 and MD5 hashes of text.',
    keywords: ['sha', 'md5', 'checksum', 'digest', 'sha256', 'sha512'],
  },
  example: 'hello world',
  view: (h, ctx) => {
    const upper = ctx.opt('upper') === '1'
    const rows = ALGORITHMS.map(([name, id]): readonly [string, string] => {
      const value = hashText(ctx.input, id)
      return [name, upper ? value.toUpperCase() : value]
    })
    return h.div(
      [h.Class(stack)],
      [
        columns(h, [
          panel(h, null, [
            inputBox(h, ctx, {
              id: 'hash-input',
              label: 'Text',
              placeholder: 'Text to hash',
              rows: 8,
            }),
          ]),
          panel(h, null, [
            sectionLabel(h, 'Digests'),
            digestList(h, rows, ctx.opt('compare')),
            checkbox(h, {
              id: 'hash-upper',
              label: 'Uppercase',
              checked: upper,
              onToggle: ctx.on.toggle('upper'),
            }),
          ]),
        ]),
        panel(h, null, [
          textField(h, {
            id: 'hash-compare',
            label: 'Compare with',
            value: ctx.opt('compare'),
            placeholder: 'Paste a hash to check it',
            onInput: ctx.on.option('compare'),
          }),
          counts(h, ctx.input),
        ]),
      ],
    )
  },
})
