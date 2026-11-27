import { columns, field, hint, panel, range, stack, stats } from '../kit.ts'
import { codeBlock, defineTextTool, sourcePanel, useAsInput } from './ui.ts'

export const run = (text: string, mode: string): string => {
  const width = Number(mode)
  return text
    .split('\n')
    .map((line) => {
      const out: Array<string> = []
      let current = ''
      for (const word of line.split(/\s+/u).filter((part) => part !== '')) {
        if (current === '') current = word
        else if (current.length + 1 + word.length <= width) current += ` ${word}`
        else {
          out.push(current)
          current = word
        }
      }
      out.push(current)
      return out.join('\n')
    })
    .join('\n')
}

export const textWrap = defineTextTool({
  meta: {
    id: 'text-wrap',
    name: 'Text wrapper',
    category: 'text',
    description: 'Hard-wrap text at a fixed number of columns.',
    keywords: ['wrap', 'columns', 'line length', '80', 'reflow', 'fold'],
  },
  example:
    'The quick brown fox jumps over the lazy dog, then trots back to the den before it gets dark.',
  opts: { width: '40' },
  files: true,
  render: (c) => {
    const { h } = c
    const width = Number(c.opt('width', '40'))
    const value = c.input === '' ? '' : run(c.input, String(width))
    const lines = value === '' ? [] : value.split('\n')
    return h.div(
      [h.Class(stack)],
      [
        panel(h, `Wrap at ${width} columns`, [
          field(
            h,
            { label: 'Columns', for: 'text-wrap-width' },
            range(h, {
              id: 'text-wrap-width',
              min: 10,
              max: 120,
              value: width,
              onInput: (next) => c.setOpt('width')(String(next)),
            }),
          ),
        ]),
        columns(h, [
          sourcePanel(c),
          panel(h, 'Wrapped', [
            value === '' ? hint(h, 'Paste text to wrap.') : codeBlock(h, 'Wrapped text', value),
            value === ''
              ? null
              : stats(h, [
                  ['Lines', String(lines.length)],
                  ['Longest line', String(Math.max(...lines.map((line) => [...line].length)))],
                ]),
            useAsInput(c, value),
          ]),
        ]),
      ],
    )
  },
})
