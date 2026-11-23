import { defineTransform } from '../transform.ts'

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

export const escapeString = defineTransform({
  meta: {
    id: 'escape-string',
    name: 'String escaper',
    category: 'developer',
    description: 'Escape and unescape strings for JSON, JavaScript, and regular expressions.',
    keywords: ['escape', 'unescape', 'json string', 'regex escape', 'backslash'],
  },
  modes: [
    { id: 'escape', label: 'JSON escape' },
    { id: 'unescape', label: 'JSON unescape' },
    { id: 'regex', label: 'Regex escape' },
  ],
  placeholder: 'Type or paste text',
  example: 'a"b\nc',
  run,
})
