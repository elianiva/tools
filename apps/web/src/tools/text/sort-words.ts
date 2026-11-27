import { columns, hint, panel, stack, stats } from '../kit.ts'
import { chips, copyable, defineTextTool, modePicker, sourcePanel, useAsInput } from './ui.ts'

export const run = (text: string, mode: string): string => {
  const words = text.split(/\s+/u).filter((word) => word !== '')
  if (mode === 'unique') return [...new Set(words)].join(' ')
  if (mode === 'length') {
    return words.toSorted((a, b) => a.length - b.length || a.localeCompare(b)).join(' ')
  }
  const sorted = words.toSorted((a, b) => a.localeCompare(b))
  return (mode === 'desc' ? sorted.toReversed() : sorted).join(' ')
}

export const sortWords = defineTextTool({
  meta: {
    id: 'sort-words',
    name: 'Word sorter',
    category: 'text',
    description: 'Sort the words of a text, drop repeats, or order by length.',
    keywords: ['alphabetical', 'unique', 'words', 'order'],
  },
  mode: 'asc',
  example: 'pear apple fig banana apple kiwi',
  render: (c) => {
    const { h } = c
    const value = run(c.input, c.mode)
    const words = value === '' ? [] : value.split(' ')
    return h.div(
      [h.Class(stack)],
      [
        modePicker(c, [
          { value: 'asc', label: 'A–Z' },
          { value: 'desc', label: 'Z–A' },
          { value: 'length', label: 'By length' },
          { value: 'unique', label: 'Unique' },
        ]),
        columns(h, [
          sourcePanel(c),
          panel(h, 'Sorted', [
            words.length === 0
              ? hint(h, 'Paste text to sort.')
              : h.div(
                  [h.Class(stack)],
                  [
                    copyable(
                      h,
                      value,
                      chips(
                        h,
                        words.map((word) => ({
                          text: word,
                          ...(c.mode === 'length' ? { note: String([...word].length) } : {}),
                        })),
                      ),
                    ),
                    stats(h, [['Words', String(words.length)]]),
                    useAsInput(c, value),
                  ],
                ),
          ]),
        ]),
      ],
    )
  },
})
