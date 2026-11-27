import { columns, hint, panel, stack } from '../kit.ts'
import { defineTextTool, display, previewGrid, sourcePanel, useAsInput } from './ui.ts'

export const run = (text: string, mode: string): string => {
  if (mode === 'lines') return text.split('\n').toReversed().join('\n')
  if (mode === 'words') {
    return text
      .split('\n')
      .map((line) => line.trim().split(/\s+/u).toReversed().join(' '))
      .join('\n')
  }
  return [...new Intl.Segmenter().segment(text)]
    .map((part) => part.segment)
    .toReversed()
    .join('')
}

const MODES = [
  { value: 'chars', label: 'Characters' },
  { value: 'words', label: 'Word order' },
  { value: 'lines', label: 'Line order' },
] as const

export const reverseText = defineTextTool({
  meta: {
    id: 'reverse-text',
    name: 'Reverse text',
    category: 'text',
    description: 'Reverse characters, words, or lines.',
    keywords: ['flip', 'backwards', 'mirror'],
  },
  mode: 'chars',
  example: 'one fish\ntwo fish\nred fish',
  render: (c) => {
    const { h } = c
    const value = run(c.input, c.mode)
    return h.div(
      [h.Class(stack)],
      [
        previewGrid(
          c,
          MODES.map((item) => ({
            ...item,
            text: c.input === '' ? '' : run(c.input.split('\n')[0] ?? '', item.value),
          })),
        ),
        columns(h, [
          sourcePanel(c),
          panel(h, 'Reversed', [
            c.input === '' ? hint(h, 'Paste text to reverse.') : display(h, 'Reversed', value),
            useAsInput(c, value),
          ]),
        ]),
      ],
    )
  },
})
