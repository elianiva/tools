import { parse, stringify } from 'yaml'

export const convertYaml = (text: string, mode: string): string => {
  if (mode === 'json-to-yaml') {
    let value: unknown
    try {
      value = JSON.parse(text)
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Invalid JSON')
    }
    return stringify(value, { indent: 2 })
  }
  let value: unknown
  try {
    value = parse(text)
  } catch (error) {
    throw new Error(
      error instanceof Error ? (error.message.split('\n')[0] ?? 'Invalid YAML') : 'Invalid YAML',
    )
  }
  return JSON.stringify(value, null, 2)
}
