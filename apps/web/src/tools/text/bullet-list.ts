import { defineTransform } from '../transform.ts'

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

export const bulletList = defineTransform({
  meta: {
    id: 'bullet-list',
    name: 'Bullet list maker',
    category: 'text',
    description: 'Turn lines into bullets, a numbered list, or a checklist.',
    keywords: ['list', 'markdown', 'bullets', 'numbered', 'checklist', 'todo'],
  },
  modes: [
    { id: 'bullets', label: 'Bullets' },
    { id: 'numbered', label: 'Numbered' },
    { id: 'checklist', label: 'Checklist' },
    { id: 'strip', label: 'Remove markers' },
  ],
  placeholder: 'Type or paste text',
  acceptsFiles: true,
  example: 'a\n b\n\nc',
  run,
})
