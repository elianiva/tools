import { defineTransform } from '../transform.ts'

export const run = (text: string): string => {
  const quote = (key: string): string =>
    /^[A-Za-z_$][\w$]*$/u.test(key) ? key : JSON.stringify(key)
  const typeOf = (value: unknown, depth: number): string => {
    if (value === null) return 'null'
    if (Array.isArray(value)) {
      const kinds = [...new Set(value.map((item) => typeOf(item, depth)))]
      const inner =
        kinds.length === 0
          ? 'unknown'
          : kinds.length === 1
            ? (kinds[0] ?? 'unknown')
            : `(${kinds.join(' | ')})`
      return `${inner}[]`
    }
    if (typeof value === 'object') {
      const entries = Object.entries(value)
      if (entries.length === 0) return '{}'
      const pad = '  '.repeat(depth + 1)
      return `{\n${entries.map(([key, entry]) => `${pad}${quote(key)}: ${typeOf(entry, depth + 1)}`).join('\n')}\n${'  '.repeat(depth)}}`
    }
    return typeof value
  }
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error('This is not valid JSON.')
  }
  return `type Root = ${typeOf(data, 0)}`
}

export const jsonToTypescript = defineTransform({
  meta: {
    id: 'json-to-typescript',
    name: 'JSON to TypeScript',
    category: 'developer',
    description: 'Write a TypeScript type from a JSON sample.',
    keywords: ['json', 'typescript', 'type', 'interface', 'schema', 'infer'],
  },
  modes: [{ id: 'run', label: 'Run' }],
  placeholder: 'Type or paste text',
  acceptsFiles: true,
  run,
})
