import { defineTransform } from '../transform.ts'

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

export const jsonl = defineTransform({
  meta: {
    id: 'jsonl',
    name: 'JSON Lines',
    category: 'developer',
    description: 'Convert between a JSON array and JSON Lines.',
    keywords: ['jsonl', 'ndjson', 'json lines', 'array', 'stream'],
  },
  modes: [
    { id: 'to-lines', label: 'Array to lines' },
    { id: 'to-array', label: 'Lines to array' },
  ],
  placeholder: 'Type or paste text',
  acceptsFiles: true,
  run,
})
