export const sortKeys = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(sortKeys)
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .toSorted(([a], [b]) => a.localeCompare(b))
        .map(([key, entry]) => [key, sortKeys(entry)]),
    )
  }
  return value
}

/** `JSON.parse` says "at position 17"; this adds the line and column a person can find. */
const explain = (text: string, error: unknown): Error => {
  const message = error instanceof Error ? error.message : 'Invalid JSON'
  const match = /position (\d+)/u.exec(message)
  if (match === null) return new Error(message)
  const position = Number(match[1])
  const before = text.slice(0, position)
  const line = before.split('\n').length
  const column = position - before.lastIndexOf('\n')
  return new Error(`${message} (line ${line}, column ${column})`)
}

export const formatJson = (text: string, mode: string): string => {
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch (error) {
    throw explain(text, error)
  }
  switch (mode) {
    case 'minify':
      return JSON.stringify(parsed)
    case 'sorted':
      return JSON.stringify(sortKeys(parsed), null, 2)
    case 'tab':
      return JSON.stringify(parsed, null, '\t')
    default:
      return JSON.stringify(parsed, null, 2)
  }
}

/** Pretty-prints with any indent, optionally sorting keys. `indent` of `''` gives one line. */
export const formatJsonWith = (text: string, indent: string, sort: boolean): string => {
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch (error) {
    throw explain(text, error)
  }
  return JSON.stringify(sort ? sortKeys(parsed) : parsed, null, indent === '' ? undefined : indent)
}
