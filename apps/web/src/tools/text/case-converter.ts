import { hint, panel, stack } from '../kit.ts'
import { convertCase } from './case-converter.logic.ts'
import { defineTextTool, display, previewGrid, sourcePanel, useAsInput } from './ui.ts'

const CASES = [
  { value: 'upper', label: 'UPPER' },
  { value: 'lower', label: 'lower' },
  { value: 'title', label: 'Title' },
  { value: 'sentence', label: 'Sentence' },
  { value: 'camel', label: 'camelCase' },
  { value: 'pascal', label: 'PascalCase' },
  { value: 'snake', label: 'snake_case' },
  { value: 'kebab', label: 'kebab-case' },
  { value: 'constant', label: 'CONSTANT_CASE' },
] as const

const preview = (text: string, mode: string): string =>
  convertCase(text.trim() === '' ? 'Sample text' : (text.split('\n')[0] ?? ''), mode)

export const caseConverter = defineTextTool({
  meta: {
    id: 'case-converter',
    name: 'Case converter',
    category: 'text',
    description: 'UPPER, lower, Title, Sentence, camelCase, snake_case and more.',
    keywords: [
      'uppercase',
      'lowercase',
      'title case',
      'camel',
      'snake',
      'kebab',
      'pascal',
      'constant',
    ],
  },
  mode: 'upper',
  example: 'the quick brown fox',
  files: true,
  render: (c) => {
    const { h } = c
    const result = convertCase(c.input, c.mode)
    return h.div(
      [h.Class(stack)],
      [
        sourcePanel(c, { rows: 6 }),
        previewGrid(
          c,
          CASES.map((item) => ({ ...item, text: preview(c.input, item.value) })),
        ),
        panel(h, CASES.find((item) => item.value === c.mode)?.label ?? 'Result', [
          c.input === '' ? hint(h, 'Paste text to convert.') : display(h, 'Result', result),
          useAsInput(c, result),
        ]),
      ],
    )
  },
})
