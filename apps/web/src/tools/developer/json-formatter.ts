import { defineTransform } from '../transform.ts'
import { formatJson } from './json-formatter.logic.ts'

export const jsonFormatter = defineTransform({
  meta: {
    id: 'json-formatter',
    name: 'JSON formatter',
    category: 'developer',
    description: 'Pretty-print, minify, or sort JSON, with the exact place of an error.',
    keywords: ['json', 'pretty', 'minify', 'validate', 'sort keys', 'beautify'],
  },
  modes: [
    { id: 'pretty', label: 'Pretty' },
    { id: 'sorted', label: 'Sort keys' },
    { id: 'tab', label: 'Tabs' },
    { id: 'minify', label: 'Minify' },
  ],
  placeholder: '{"paste":"json here"}',
  run: formatJson,
  acceptsFiles: true,
})
