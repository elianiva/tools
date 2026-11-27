import { columns, hint, panel, stack } from '../kit.ts'
import { codeBlock, defineTextTool, previewGrid, sourcePanel, useAsInput } from './ui.ts'

export const run = (text: string, mode: string): string => {
  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line !== '')
  switch (mode) {
    case 'lines':
      return text
        .split(',')
        .map((part) => part.trim())
        .filter((part) => part !== '')
        .join('\n')
    case 'quoted':
      return lines.map((line) => `"${line}"`).join(', ')
    case 'json':
      return JSON.stringify(lines)
    case 'sql':
      return lines.map((line) => `'${line.replaceAll("'", "''")}'`).join(', ')
    default:
      return lines.join(', ')
  }
}

const FORMATS = [
  { value: 'comma', label: 'Comma list', note: 'lines → list' },
  { value: 'lines', label: 'Lines', note: 'list → lines' },
  { value: 'quoted', label: 'Quoted' },
  { value: 'json', label: 'JSON array' },
  { value: 'sql', label: 'SQL IN list' },
] as const

export const listConverter = defineTextTool({
  meta: {
    id: 'list-converter',
    name: 'List converter',
    category: 'text',
    description: 'Turn lines into a comma list, quoted values, a JSON array, or SQL.',
    keywords: ['comma separated', 'array', 'sql in', 'join', 'split'],
  },
  mode: 'comma',
  example: 'red\ngreen\n\nblue',
  files: true,
  render: (c) => {
    const { h } = c
    const value = run(c.input, c.mode)
    return h.div(
      [h.Class(stack)],
      [
        previewGrid(
          c,
          FORMATS.map((item) => ({
            ...item,
            text: c.input.trim() === '' ? '' : run(c.input, item.value),
          })),
        ),
        columns(h, [
          sourcePanel(c, { label: 'List' }),
          panel(h, 'Result', [
            value === '' ? hint(h, 'Paste a list to convert.') : codeBlock(h, 'Result', value),
            useAsInput(c, value),
          ]),
        ]),
      ],
    )
  },
})
