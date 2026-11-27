import { codecView, defineWorkbench } from './ui.ts'

export const run = (text: string, mode: string): string => {
  if (mode === 'to-array') {
    const rows = text.split('\n').filter((line) => line.trim() !== '')
    try {
      return JSON.stringify(
        rows.map((line): unknown => JSON.parse(line)),
        null,
        2,
      )
    } catch {
      throw new Error('Every line must be valid JSON.')
    }
  }
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error('This is not valid JSON.')
  }
  if (!Array.isArray(data)) throw new Error('Use a JSON array.')
  return data.map((item) => JSON.stringify(item)).join('\n')
}

/** The offset of the first line that is not JSON. */
const badLine = (input: string): number | undefined => {
  let offset = 0
  for (const line of input.split('\n')) {
    if (line.trim() !== '') {
      try {
        JSON.parse(line)
      } catch {
        return offset
      }
    }
    offset += line.length + 1
  }
  return undefined
}

export const jsonl = defineWorkbench({
  meta: {
    id: 'jsonl',
    name: 'JSON Lines',
    category: 'developer',
    description: 'Convert between a JSON array and JSON Lines.',
    keywords: ['jsonl', 'ndjson', 'json lines', 'array', 'stream'],
  },
  mode: 'to-lines',
  example: '[{"a":1},{"b":[2]}]',
  acceptsFiles: true,
  view: (h, ctx) =>
    codecView(h, ctx, {
      id: 'jsonl',
      modes: [
        { value: 'to-lines', label: 'Array to lines' },
        { value: 'to-array', label: 'Lines to array' },
      ],
      inverse: { 'to-lines': 'to-array', 'to-array': 'to-lines' },
      run,
      locate: (input, mode) => (mode === 'to-array' ? badLine(input) : undefined),
      labels: (mode) =>
        mode === 'to-lines' ? ['JSON array', 'JSON Lines'] : ['JSON Lines', 'JSON array'],
    }),
})
