import { css } from '../../../styled-system/css'
import { checkbox, columns, panel, segmented, stack } from '../kit.ts'
import { formatJsonWith } from './json-formatter.logic.ts'
import {
  attempt,
  byteLength,
  codeBox,
  counts,
  errorNote,
  formatSize,
  highlightJson,
  inputBox,
  jsonTokens,
  locateInMessage,
  sectionLabel,
  toolbarCls,
  type H,
} from './ui.ts'
import { defineWorkbench } from './ui.ts'
import type { Html } from 'foldkit/html'

const INDENTS = [
  { value: '2', label: '2 spaces' },
  { value: '4', label: '4 spaces' },
  { value: 'tab', label: 'Tab' },
  { value: 'min', label: 'Minify' },
]

const indentOf = (mode: string): string =>
  mode === 'tab' ? '\t' : mode === 'min' ? '' : ' '.repeat(Number(mode) || 2)

const treeCls = css({
  margin: 0,
  padding: '0.8rem 0.9rem',
  maxHeight: '32rem',
  overflow: 'auto',
  borderRadius: 'var(--radius)',
  background: 'var(--well)',
  boxShadow: 'var(--elev-well)',
  fontFamily: 'var(--mono)',
  fontSize: '0.82rem',
  lineHeight: 1.6,
  '& details': { paddingLeft: '1.1rem' },
  '& summary': { cursor: 'pointer', marginLeft: '-1.1rem', listStylePosition: 'inside' },
  '& [data-leaf]': { paddingLeft: '1.1rem' },
  '& [data-note]': { color: 'var(--muted-foreground)', marginLeft: '0.4rem' },
})

type Budget = { left: number }

const leaf = (h: H, value: unknown): Html =>
  typeof value === 'string'
    ? h.span([h.Attribute('data-t', 'string')], [JSON.stringify(value)])
    : typeof value === 'number'
      ? h.span([h.Attribute('data-t', 'number')], [String(value)])
      : h.span([h.Attribute('data-t', 'literal')], [String(value)])

const node = (h: H, key: string | null, value: unknown, depth: number, budget: Budget): Html => {
  const name: ReadonlyArray<Html | string> =
    key === null
      ? []
      : [
          h.span([h.Attribute('data-t', 'key')], [key]),
          h.span([h.Attribute('data-t', 'punct')], [': ']),
        ]
  if (value === null || typeof value !== 'object') {
    return h.div([h.Attribute('data-leaf', '')], [...name, leaf(h, value)])
  }
  const entries: ReadonlyArray<readonly [string, unknown]> = Array.isArray(value)
    ? value.map((item, index): readonly [string, unknown] => [String(index), item])
    : Object.entries(value)
  const [open, close] = Array.isArray(value) ? ['[', ']'] : ['{', '}']
  const note = `${entries.length} ${Array.isArray(value) ? 'items' : 'keys'}`
  const shown = entries.slice(0, Math.max(0, budget.left))
  budget.left -= shown.length
  return h.details(depth < 2 ? [h.Open(true)] : [], [
    h.summary(
      [],
      [
        ...name,
        open,
        h.span([h.Attribute('data-note', '')], [entries.length === 0 ? close : note]),
      ],
    ),
    ...shown.map(([k, v]) =>
      node(h, Array.isArray(value) ? null : JSON.stringify(k), v, depth + 1, budget),
    ),
    shown.length < entries.length
      ? h.div([h.Attribute('data-leaf', '')], [`… ${entries.length - shown.length} more`])
      : null,
    entries.length === 0 ? null : h.div([h.Attribute('data-leaf', '')], [close]),
  ])
}

export const jsonFormatter = defineWorkbench({
  meta: {
    id: 'json-formatter',
    name: 'JSON formatter',
    category: 'developer',
    description: 'Pretty-print, minify, or sort JSON, with the exact place of an error.',
    keywords: ['json', 'pretty', 'minify', 'validate', 'sort keys', 'beautify'],
  },
  mode: '2',
  opts: { view: 'text' },
  example: '{"name":"Ada","tags":["math","code"],"born":{"year":1815}}',
  acceptsFiles: true,
  view: (h, ctx) => {
    const sort = ctx.opt('sort') === '1'
    const tree = ctx.opt('view') === 'tree'
    const result =
      ctx.input.trim() === ''
        ? { value: '', error: '' }
        : attempt(() => formatJsonWith(ctx.input, indentOf(ctx.mode), sort))
    const parsed: unknown = result.value === '' ? null : JSON.parse(result.value)
    const before = byteLength(ctx.input)
    const after = byteLength(result.value)
    return h.div(
      [h.Class(stack)],
      [
        h.div(
          [h.Class(toolbarCls)],
          [
            segmented(h, {
              label: 'Indent',
              value: ctx.mode,
              options: INDENTS,
              onSelect: ctx.on.mode,
            }),
            checkbox(h, {
              id: 'json-sort',
              label: 'Sort keys',
              checked: sort,
              onToggle: ctx.on.toggle('sort'),
            }),
          ],
        ),
        columns(h, [
          panel(h, null, [
            inputBox(h, ctx, {
              id: 'json-input',
              label: 'JSON',
              placeholder: '{"paste":"json here"}',
              rows: 16,
            }),
            errorNote(h, result.error, {
              text: ctx.input,
              index: locateInMessage(ctx.input, result.error) ?? -1,
            }),
          ]),
          panel(h, null, [
            h.div(
              [h.Class(toolbarCls)],
              [
                sectionLabel(h, 'Output'),
                segmented(h, {
                  label: 'View',
                  value: tree ? 'tree' : 'text',
                  options: [
                    { value: 'text', label: 'Text' },
                    { value: 'tree', label: 'Tree' },
                  ],
                  onSelect: ctx.on.option('view'),
                }),
              ],
            ),
            tree && result.value !== ''
              ? h.div(
                  [h.Class(`${treeCls} ${jsonTokens}`), h.Tabindex(0), h.AriaLabel('JSON tree')],
                  [node(h, null, parsed, 0, { left: 1500 })],
                )
              : codeBox(h, {
                  label: 'Output',
                  value: result.value,
                  class: jsonTokens,
                  children: highlightJson(h, result.value),
                }),
            result.value === ''
              ? null
              : h.div(
                  [h.Class(toolbarCls)],
                  [
                    counts(h, result.value),
                    h.span([], [`${formatSize(before)} → ${formatSize(after)}`]),
                  ],
                ),
          ]),
        ]),
      ],
    )
  },
})
