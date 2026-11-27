import { codecView, defineWorkbench } from './ui.ts'

export const run = (text: string, mode: string): string => {
  if (mode === 'regex') return text.replaceAll(/[.*+?^${}()|[\]\\]/gu, '\\$&')
  if (mode === 'unescape') {
    try {
      const value: unknown = JSON.parse(`"${text.replaceAll('\n', '\\n')}"`)
      return typeof value === 'string' ? value : text
    } catch {
      throw new Error('This is not a valid escaped string.')
    }
  }
  return JSON.stringify(text).slice(1, -1)
}

const badEscape = (input: string): number | undefined => {
  const at = input.search(/\\(?![\\"/bfnrtu])|\\u(?![0-9a-fA-F]{4})|(?<!\\)"/u)
  return at < 0 ? undefined : at
}

export const escapeString = defineWorkbench({
  meta: {
    id: 'escape-string',
    name: 'String escaper',
    category: 'developer',
    description: 'Escape and unescape strings for JSON, JavaScript, and regular expressions.',
    keywords: ['escape', 'unescape', 'json string', 'regex escape', 'backslash'],
  },
  mode: 'escape',
  example: 'a"b\nc',
  view: (h, ctx) =>
    codecView(h, ctx, {
      id: 'escape-string',
      modes: [
        { value: 'escape', label: 'JSON escape' },
        { value: 'unescape', label: 'JSON unescape' },
        { value: 'regex', label: 'Regex escape' },
      ],
      inverse: { escape: 'unescape', unescape: 'escape' },
      run,
      locate: (input, mode) => (mode === 'unescape' ? badEscape(input) : undefined),
      labels: (mode) => (mode === 'unescape' ? ['Escaped', 'Text'] : ['Text', 'Escaped']),
      placeholder: 'Type or paste text',
    }),
})
