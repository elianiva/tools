import { cleaner, defineTextTool } from './ui.ts'

export const run = (text: string, mode: string): string => {
  if (mode === 'straight')
    return text.replaceAll(/[\u201C\u201D]/gu, '"').replaceAll(/[\u2018\u2019]/gu, "'")
  return text
    .replaceAll(/(^|[\s([{—-])"/gu, '$1\u201C')
    .replaceAll('"', '\u201D')
    .replaceAll(/(^|[\s([{—-])'/gu, '$1\u2018')
    .replaceAll("'", '\u2019')
}

export const smartQuotes = defineTextTool({
  meta: {
    id: 'smart-quotes',
    name: 'Smart quotes',
    category: 'text',
    description: 'Curl straight quotes, or straighten curly ones.',
    keywords: ['quotes', 'curly', 'straight', 'typography', 'apostrophe'],
  },
  mode: 'curly',
  example: 'He said "it\'s fine" and left.',
  files: true,
  render: (c) =>
    cleaner(c, {
      run,
      options: [
        { value: 'curly', label: 'Curl quotes' },
        { value: 'straight', label: 'Straighten quotes' },
      ],
    }),
})
