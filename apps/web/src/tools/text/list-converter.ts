import { defineTransform } from '../transform.ts'

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

export const listConverter = defineTransform({
  meta: {
    id: 'list-converter',
    name: 'List converter',
    category: 'text',
    description: 'Turn lines into a comma list, quoted values, a JSON array, or SQL.',
    keywords: ['comma separated', 'array', 'sql in', 'join', 'split'],
  },
  modes: [
    { id: 'comma', label: 'Lines to comma list' },
    { id: 'lines', label: 'Comma list to lines' },
    { id: 'quoted', label: 'Quoted list' },
    { id: 'json', label: 'JSON array' },
    { id: 'sql', label: 'SQL IN list' },
  ],
  placeholder: 'Type or paste text',
  acceptsFiles: true,
  run,
})
