import { defineTransform } from '../transform.ts'

export const run = (text: string, mode: string): string => {
  const parse = (source: string): Array<Array<string>> => {
    const first = source.split('\n')[0] ?? ''
    const count = (char: string) => first.split(char).length
    const delimiter =
      count('\t') > count(',') && count('\t') >= count(';')
        ? '\t'
        : count(';') > count(',')
          ? ';'
          : ','
    const rows: Array<Array<string>> = []
    let row: Array<string> = []
    let cell = ''
    let quoted = false
    for (let i = 0; i < source.length; i += 1) {
      const char = source.charAt(i)
      if (quoted) {
        if (char === '"') {
          if (source.charAt(i + 1) === '"') {
            cell += '"'
            i += 1
          } else quoted = false
        } else cell += char
      } else if (char === '"') quoted = true
      else if (char === delimiter) {
        row.push(cell)
        cell = ''
      } else if (char === '\n' || char === '\r') {
        if (char === '\r' && source.charAt(i + 1) === '\n') i += 1
        row.push(cell)
        rows.push(row)
        row = []
        cell = ''
      } else cell += char
    }
    if (cell !== '' || row.length > 0) {
      row.push(cell)
      rows.push(row)
    }
    return rows
  }
  if (mode === 'json-to-csv') {
    let data: unknown
    try {
      data = JSON.parse(text)
    } catch {
      throw new Error('This is not valid JSON.')
    }
    if (
      !Array.isArray(data) ||
      data.some((item) => item === null || typeof item !== 'object' || Array.isArray(item))
    ) {
      throw new Error('Use a JSON array of objects.')
    }
    const items = data as Array<Record<string, unknown>>
    const headers = [...new Set(items.flatMap((item) => Object.keys(item)))]
    const cell = (value: unknown): string => {
      const raw =
        value === null || value === undefined
          ? ''
          : typeof value === 'object'
            ? JSON.stringify(value)
            : String(value)
      return /[",\n]/u.test(raw) ? `"${raw.replaceAll('"', '""')}"` : raw
    }
    return [
      headers.map(cell).join(','),
      ...items.map((item) => headers.map((key) => cell(item[key])).join(',')),
    ].join('\n')
  }
  const rows = parse(text)
  const [head = [], ...body] = rows
  if (mode === 'csv-to-markdown') {
    const clean = (value: string) => value.replaceAll('|', '\\|').replaceAll('\n', ' ')
    const line = (cells: ReadonlyArray<string>) =>
      `| ${head.map((_, i) => clean(cells[i] ?? '')).join(' | ')} |`
    return [line(head), `| ${head.map(() => '---').join(' | ')} |`, ...body.map(line)].join('\n')
  }
  return JSON.stringify(
    body.map((cells) => Object.fromEntries(head.map((name, i) => [name, cells[i] ?? '']))),
    null,
    2,
  )
}

export const csvJson = defineTransform({
  meta: {
    id: 'csv-json',
    name: 'CSV and JSON',
    category: 'developer',
    description: 'Convert between CSV, JSON, and a Markdown table.',
    keywords: ['csv', 'json', 'table', 'spreadsheet', 'excel', 'tsv', 'markdown'],
  },
  modes: [
    { id: 'csv-to-json', label: 'CSV to JSON' },
    { id: 'json-to-csv', label: 'JSON to CSV' },
    { id: 'csv-to-markdown', label: 'CSV to Markdown' },
  ],
  placeholder: 'Type or paste text',
  acceptsFiles: true,
  run,
})
