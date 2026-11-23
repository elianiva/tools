import { marked } from 'marked'
import { defineTransform } from '../transform.ts'

export const run = (text: string): string => {
  return String(marked.parse(text, { async: false })).trim()
}

export const markdownToHtml = defineTransform({
  meta: {
    id: 'markdown-to-html',
    name: 'Markdown to HTML',
    category: 'developer',
    description: 'Turn Markdown into HTML you can copy.',
    keywords: ['markdown', 'md', 'html', 'convert', 'render'],
  },
  modes: [{ id: 'run', label: 'Run' }],
  placeholder: 'Type or paste text',
  acceptsFiles: true,
  run,
})
