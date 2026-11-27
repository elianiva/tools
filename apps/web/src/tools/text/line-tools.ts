import { columns, hint, panel, segmented, stack, stats } from '../kit.ts'
import { runLines } from './line-tools.logic.ts'
import { codeBlock, defineTextTool, sourcePanel, useAsInput } from './ui.ts'

const OPS = [
  { value: 'sort', label: 'Sort A–Z' },
  { value: 'sort-desc', label: 'Sort Z–A' },
  { value: 'reverse', label: 'Reverse' },
  { value: 'dedupe', label: 'Remove duplicates' },
  { value: 'remove-empty', label: 'Remove empty' },
  { value: 'trim', label: 'Trim' },
  { value: 'number', label: 'Number' },
]

export const lineTools = defineTextTool({
  meta: {
    id: 'line-tools',
    name: 'Line tools',
    category: 'text',
    description: 'Sort, reverse, deduplicate, trim, and number lines.',
    keywords: ['sort', 'unique', 'dedupe', 'duplicate', 'reverse', 'trim', 'empty lines', 'number'],
  },
  mode: 'sort',
  example: 'pear\napple\n\nfig\napple\n  banana',
  files: true,
  render: (c) => {
    const { h } = c
    const value = runLines(c.input, c.mode)
    const before = c.input === '' ? 0 : c.input.split('\n').length
    const after = value === '' ? 0 : value.split('\n').length
    return h.div(
      [h.Class(stack)],
      [
        segmented(h, { label: 'Operation', value: c.mode, options: OPS, onSelect: c.setMode }),
        columns(h, [
          sourcePanel(c, { label: 'Lines', placeholder: 'One item per line' }),
          panel(h, 'Result', [
            c.input === '' ? hint(h, 'Paste lines to start.') : codeBlock(h, 'Result', value),
            c.input === ''
              ? null
              : stats(h, [
                  ['Lines', `${before} → ${after}`],
                  ['Unique', String(new Set(value.split('\n')).size)],
                ]),
            useAsInput(c, value),
          ]),
        ]),
      ],
    )
  },
})
