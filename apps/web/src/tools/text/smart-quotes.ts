import { defineTransform } from '../transform.ts'

export const run = (text: string, mode: string): string => {
  if (mode === 'straight')
    return text.replaceAll(/[\u201C\u201D]/gu, '"').replaceAll(/[\u2018\u2019]/gu, "'")
  return text
    .replaceAll(/(^|[\s([{—-])"/gu, '$1\u201C')
    .replaceAll('"', '\u201D')
    .replaceAll(/(^|[\s([{—-])'/gu, '$1\u2018')
    .replaceAll("'", '\u2019')
}

export const smartQuotes = defineTransform({
  meta: {
    id: 'smart-quotes',
    name: 'Smart quotes',
    category: 'text',
    description: 'Curl straight quotes, or straighten curly ones.',
    keywords: ['quotes', 'curly', 'straight', 'typography', 'apostrophe'],
  },
  modes: [
    { id: 'curly', label: 'Curl quotes' },
    { id: 'straight', label: 'Straighten quotes' },
  ],
  placeholder: 'Type or paste text',
  acceptsFiles: true,
  run,
})
