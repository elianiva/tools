import { columns, hint, panel, stack } from '../kit.ts'
import { codeBlock, defineTextTool, previewGrid, sourcePanel, useAsInput } from './ui.ts'

export const run = (text: string, mode: string): string => {
  const items = text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line !== '')
    .map((line) => line.replace(/^(?:[-*+]\s+(?:\[[ xX]\]\s+)?|\d+[.)]\s+)/u, ''))
  switch (mode) {
    case 'numbered':
      return items.map((item, index) => `${index + 1}. ${item}`).join('\n')
    case 'checklist':
      return items.map((item) => `- [ ] ${item}`).join('\n')
    case 'strip':
      return items.join('\n')
    default:
      return items.map((item) => `- ${item}`).join('\n')
  }
}

const STYLES = [
  { value: 'bullets', label: 'Bullets' },
  { value: 'numbered', label: 'Numbered' },
  { value: 'checklist', label: 'Checklist' },
  { value: 'strip', label: 'Plain' },
] as const

const firstItems = (text: string): string => text.split('\n').slice(0, 2).join('  ')

export const bulletList = defineTextTool({
  meta: {
    id: 'bullet-list',
    name: 'Bullet list maker',
    category: 'text',
    description: 'Turn lines into bullets, a numbered list, or a checklist.',
    keywords: ['list', 'markdown', 'bullets', 'numbered', 'checklist', 'todo'],
  },
  mode: 'bullets',
  example: 'Buy milk\nBook flights\n\nCall the bank',
  files: true,
  render: (c) => {
    const { h } = c
    const value = run(c.input, c.mode)
    return h.div(
      [h.Class(stack)],
      [
        previewGrid(
          c,
          STYLES.map((item) => ({
            ...item,
            text: c.input.trim() === '' ? '' : firstItems(run(c.input, item.value)),
          })),
        ),
        columns(h, [
          sourcePanel(c, { label: 'Items', placeholder: 'One item per line' }),
          panel(h, 'List', [
            value === '' ? hint(h, 'Paste items to start.') : codeBlock(h, 'List', value),
            useAsInput(c, value),
          ]),
        ]),
      ],
    )
  },
})
