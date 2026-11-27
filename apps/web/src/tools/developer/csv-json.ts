import { css } from '../../../styled-system/css'
import { columns, panel, segmented, stack } from '../kit.ts'
import {
  attempt,
  cellInput,
  codeBox,
  counts,
  dataTable,
  defineWorkbench,
  errorNote,
  highlightJson,
  inputBox,
  jsonTokens,
  sectionLabel,
  toolbarCls,
} from './ui.ts'

export const parseCsv = (source: string): Array<Array<string>> => {
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

export const run = (text: string, mode: string): string => {
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
  const rows = parseCsv(text)
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

const quoteCell = (value: string): string =>
  /[",\n\r]/u.test(value) ? `"${value.replaceAll('"', '""')}"` : value

const toCsv = (rows: ReadonlyArray<ReadonlyArray<string>>): string =>
  rows.map((cells) => cells.map(quoteCell).join(',')).join('\n')

const MODES = [
  { value: 'csv-to-json', label: 'CSV to JSON' },
  { value: 'json-to-csv', label: 'JSON to CSV' },
  { value: 'csv-to-markdown', label: 'CSV to Markdown' },
]

const tabCls = css({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '0.6rem',
})

export const csvJson = defineWorkbench({
  meta: {
    id: 'csv-json',
    name: 'CSV and JSON',
    category: 'developer',
    description: 'Convert between CSV, JSON, and a Markdown table.',
    keywords: ['csv', 'json', 'table', 'spreadsheet', 'excel', 'tsv', 'markdown'],
  },
  mode: 'csv-to-json',
  opts: { view: 'table' },
  example: 'a,b\n1,"x,y"\n2,"say ""hi"""',
  acceptsFiles: true,
  view: (h, ctx) => {
    const result =
      ctx.input.trim() === '' ? { value: '', error: '' } : attempt(() => run(ctx.input, ctx.mode))
    const fromJson = ctx.mode === 'json-to-csv'
    // The table shows the CSV side: the input when it is CSV, the output when it is JSON.
    const csv = fromJson ? result.value : ctx.input
    const grid = csv.trim() === '' || (fromJson && result.error !== '') ? [] : parseCsv(csv)
    const [head = [], ...body] = grid
    const preview = ctx.opt('view') !== 'output'
    const edit = (rowIndex: number, column: number, value: string) =>
      ctx.on.input(
        toCsv(
          grid.map((cells, at) =>
            at === rowIndex ? head.map((_, c) => (c === column ? value : (cells[c] ?? ''))) : cells,
          ),
        ),
      )
    const tableOk = !fromJson || result.error === ''
    return h.div(
      [h.Class(stack)],
      [
        segmented(h, {
          label: 'Direction',
          value: ctx.mode,
          options: MODES,
          onSelect: ctx.on.mode,
        }),
        columns(h, [
          panel(h, null, [
            inputBox(h, ctx, {
              id: 'csv-input',
              label: fromJson ? 'JSON' : 'CSV',
              placeholder: fromJson ? '[{"a":1}]' : 'a,b\n1,2',
              rows: 14,
            }),
            errorNote(h, result.error),
          ]),
          panel(h, null, [
            h.div(
              [h.Class(tabCls)],
              [
                sectionLabel(h, 'Result'),
                segmented(h, {
                  label: 'View',
                  value: preview ? 'table' : 'output',
                  options: [
                    { value: 'table', label: 'Table' },
                    { value: 'output', label: 'Output' },
                  ],
                  onSelect: ctx.on.option('view'),
                }),
              ],
            ),
            preview && tableOk
              ? dataTable(h, {
                  headers: head,
                  empty: 'Enter CSV to see a table.',
                  rows: body.slice(0, 200).map((cells, rowIndex) =>
                    head.map((name, column) =>
                      fromJson
                        ? (cells[column] ?? '')
                        : cellInput(h, {
                            label: `${name}, row ${rowIndex + 1}`,
                            value: cells[column] ?? '',
                            onInput: (value) => edit(rowIndex + 1, column, value),
                          }),
                    ),
                  ),
                })
              : codeBox(h, {
                  label: 'Output',
                  value: result.value,
                  ...(ctx.mode === 'csv-to-json'
                    ? { class: jsonTokens, children: highlightJson(h, result.value) }
                    : {}),
                }),
            h.div(
              [h.Class(toolbarCls)],
              [
                grid.length === 0
                  ? null
                  : h.span([], [`${body.length} rows × ${head.length} columns`]),
                result.value === '' ? null : counts(h, result.value),
              ],
            ),
          ]),
        ]),
      ],
    )
  },
})
