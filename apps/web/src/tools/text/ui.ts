// Shared plumbing of the text tools. Each tool keeps its own layout: this file holds the
// state every one of them needs (text, a mode, a few settings, file drops) and the
// pieces they draw with (highlighted text, change views, preview cards, bars, chips).
import { Elements } from '@tools/ui'
import { Effect, Schema } from 'effect'
import { Command, File, Submodel } from 'foldkit'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { defineMessageUnion } from 'foldkit/message'
import { css } from '../../../styled-system/css'
import {
  button,
  columns,
  field,
  hint,
  panel,
  row,
  segmented,
  stack,
  stats,
  textArea,
} from '../kit.ts'
import { defineTool, type ToolMeta } from '../tool.ts'
import { compare } from './diff.logic.ts'

const Model = Schema.Struct({
  input: Schema.String,
  mode: Schema.String,
  opts: Schema.Record(Schema.String, Schema.String),
})
type Model = typeof Model.Type

const Message = defineMessageUnion({
  ChangedInput: { input: Schema.String },
  ChangedMode: { mode: Schema.String },
  ChangedOpt: { key: Schema.String, value: Schema.String },
  ClickedClear: {},
  DroppedFiles: { files: Schema.Array(File.File) },
  LoadedText: { input: Schema.String },
  FailedLoad: {},
})
export type TextMessage = typeof Message.Type

const LoadText = Command.define('LoadText', {
  args: { file: File.File },
  messages: [Message.LoadedText, Message.FailedLoad],
  execute: ({ file }) =>
    File.readAsText(file).pipe(
      Effect.map((input) => Message.LoadedText({ input })),
      Effect.orElseSucceed(() => Message.FailedLoad()),
    ),
})

const update = (model: Model, message: TextMessage) =>
  Message.match<{ model: Model; commands?: ReadonlyArray<Command.Command<TextMessage>> }>(message, {
    ChangedInput: ({ input }) => ({ model: { ...model, input } }),
    ChangedMode: ({ mode }) => ({ model: { ...model, mode } }),
    ChangedOpt: ({ key, value }) => ({
      model: { ...model, opts: { ...model.opts, [key]: value } },
    }),
    ClickedClear: () => ({ model: { ...model, input: '' } }),
    DroppedFiles: ({ files }) => {
      const first = files[0]
      return first === undefined ? { model } : { model, commands: [LoadText({ file: first })] }
    },
    LoadedText: ({ input }) => ({ model: { ...model, input } }),
    FailedLoad: () => ({ model }),
  })

/** What a tool's `render` gets: its state, and the Messages that change it. */
export type Ctx = Readonly<{
  h: HtmlBuilder<TextMessage>
  id: string
  input: string
  mode: string
  example: string
  /** A setting of the tool. Settings are text; a checkbox is `'on'` or `''`. */
  opt: (key: string, fallback: string) => string
  setInput: (input: string) => TextMessage
  setMode: (mode: string) => TextMessage
  setOpt: (key: string) => (value: string) => TextMessage
  clear: TextMessage
}>

type TextToolSpec = Readonly<{
  meta: Omit<ToolMeta, 'accepts'>
  mode?: string
  example?: string
  opts?: Readonly<Record<string, string>>
  /** A dropped text file is read into the input. */
  files?: boolean
  render: (c: Ctx) => Html
}>

export const defineTextTool = (spec: TextToolSpec) => {
  const view = Submodel.defineView<Model, TextMessage>((model, h) =>
    spec.render({
      h,
      id: spec.meta.id,
      input: model.input,
      mode: model.mode,
      example: spec.example ?? '',
      opt: (key, fallback) => model.opts[key] ?? fallback,
      setInput: (input) => Message.ChangedInput({ input }),
      setMode: (mode) => Message.ChangedMode({ mode }),
      setOpt: (key) => (value) => Message.ChangedOpt({ key, value }),
      clear: Message.ClickedClear(),
    }),
  )
  return defineTool({
    meta: {
      ...spec.meta,
      ...(spec.files === true ? { accepts: ['text/*', '.txt', '.json', '.md'] } : {}),
    },
    init: () => ({ input: spec.example ?? '', mode: spec.mode ?? '', opts: spec.opts ?? {} }),
    update,
    view,
    ...(spec.files === true
      ? { receive: (files: ReadonlyArray<File>) => Message.DroppedFiles({ files }) }
      : {}),
  })
}

/** Runs `fn`; a thrown `Error` becomes the message to show. */
export const attempt = (fn: () => string): Readonly<{ value: string; error: string }> => {
  try {
    return { value: fn(), error: '' }
  } catch (error) {
    return {
      value: '',
      error: error instanceof Error ? error.message : 'Could not process this input.',
    }
  }
}

const footCls = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '0.75rem',
  flexWrap: 'wrap',
})
const stripCls = css({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.3rem 1rem',
  fontFamily: 'var(--mono)',
  fontSize: '0.72rem',
  color: 'var(--muted-foreground)',
  '& b': { color: 'var(--foreground)', fontWeight: 600 },
})
const errorCls = css({
  margin: 0,
  color: 'var(--danger)',
  fontSize: '0.85rem',
  fontFamily: 'var(--mono)',
})
const copyWrapCls = css({
  position: 'relative',
  '& [data-slot="copy-button"]': { position: 'absolute', top: '0.4rem', right: '0.4rem' },
})
const markedCls = css({
  margin: 0,
  padding: '0.8rem 3rem 0.8rem 0.9rem',
  minHeight: '4rem',
  maxHeight: '28rem',
  overflow: 'auto',
  borderRadius: 'var(--radius)',
  background: 'var(--well)',
  boxShadow: 'var(--elev-well)',
  fontFamily: 'var(--mono)',
  fontSize: '0.82rem',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
  '& mark': {
    background: 'var(--info-soft)',
    color: 'var(--info)',
    borderRadius: '3px',
    boxShadow: '0 0 0 1px var(--info-soft)',
  },
  '& mark[data-warn]': {
    background: 'var(--warn-soft)',
    color: 'oklch(0.5 0.13 66)',
    boxShadow: '0 0 0 1px var(--warn-soft)',
  },
  '& ins': { background: 'var(--ok-soft)', color: 'var(--ok)', textDecoration: 'none' },
  '& del': { background: 'var(--danger-soft)', color: 'var(--danger)' },
  '& [data-dim]': { opacity: 0.45 },
})
const displayCls = css({
  margin: 0,
  padding: '1.2rem 3rem 1.2rem 1.2rem',
  borderRadius: 'calc(var(--radius) * 1.4)',
  background: 'var(--well)',
  boxShadow: 'var(--elev-well)',
  fontSize: 'clamp(1.2rem, 2.6vw, 1.9rem)',
  lineHeight: 1.35,
  wordBreak: 'break-word',
  whiteSpace: 'pre-wrap',
  maxHeight: '28rem',
  overflow: 'auto',
  '& [data-dim]': { opacity: 0.4 },
})
const gridCls = css({
  display: 'grid',
  gap: '0.6rem',
  gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 12rem), 1fr))',
})
const optionCls = css({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  gap: '0.3rem',
  minWidth: 0,
  padding: '0.65rem 0.8rem',
  textAlign: 'left',
  borderRadius: 'var(--radius)',
  background: 'linear-gradient(var(--raised-top), var(--raised-bottom))',
  boxShadow: 'var(--elev-raised)',
  color: 'var(--foreground)',
  cursor: 'pointer',
  '& small': {
    fontFamily: 'var(--mono)',
    fontSize: '0.68rem',
    letterSpacing: '0.04em',
    color: 'var(--muted-foreground)',
  },
  '& span': {
    fontFamily: 'var(--mono)',
    fontSize: '0.85rem',
    overflow: 'hidden',
    maxHeight: '3.2em',
    overflowWrap: 'anywhere',
    minHeight: '2.4em',
  },
  '&[aria-pressed="true"]': {
    background: 'var(--well)',
    boxShadow: 'var(--elev-well), 0 0 0 2px var(--primary)',
  },
})
const barsCls = css({ display: 'flex', flexDirection: 'column', gap: '0.3rem' })
const barRowCls = css({
  display: 'grid',
  gridTemplateColumns: 'minmax(2rem, 7rem) 1fr auto',
  alignItems: 'center',
  gap: '0.7rem',
  fontFamily: 'var(--mono)',
  fontSize: '0.85rem',
  '& b': { fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  '& i': {
    display: 'block',
    height: '12px',
    borderRadius: '4px',
    background: 'var(--primary)',
    opacity: 0.8,
    transition: 'width 250ms cubic-bezier(0.23, 1, 0.32, 1)',
  },
  '& small': { color: 'var(--muted-foreground)', marginLeft: '0.5rem' },
})
const scrollCls = css({ maxHeight: '26rem', overflow: 'auto', paddingRight: '0.3rem' })
const chipsCls = css({ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' })
const chipCls = css({
  padding: '0.25rem 0.6rem',
  borderRadius: '8px',
  background: 'linear-gradient(var(--raised-top), var(--raised-bottom))',
  boxShadow: 'var(--elev-raised)',
  fontFamily: 'var(--mono)',
  fontSize: '0.85rem',
  '& small': { marginLeft: '0.35rem', color: 'var(--muted-foreground)', fontSize: '0.7rem' },
})
const codeCls = css({
  margin: 0,
  padding: '0.8rem 3rem 0.8rem 0',
  borderRadius: 'var(--radius)',
  background: 'var(--well)',
  boxShadow: 'var(--elev-well)',
  fontFamily: 'var(--mono)',
  fontSize: '0.82rem',
  lineHeight: 1.6,
  maxHeight: '28rem',
  overflow: 'auto',
  counterReset: 'ln',
  '& > span': {
    display: 'block',
    position: 'relative',
    paddingLeft: '3rem',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
    minHeight: '1.6em',
    counterIncrement: 'ln',
    '&::before': {
      content: 'counter(ln)',
      position: 'absolute',
      left: 0,
      width: '2.2rem',
      textAlign: 'right',
      color: 'var(--muted-foreground)',
      opacity: 0.7,
    },
  },
})

const measure = (text: string) => ({
  chars: [...text].length,
  words: text.split(/\s+/u).filter((word) => word !== '').length,
  lines: text === '' ? 0 : text.split('\n').length,
})

export const counts = <M>(h: HtmlBuilder<M>, text: string): Html => {
  const size = measure(text)
  return h.div(
    [h.Class(stripCls)],
    (
      [
        ['chars', size.chars],
        ['words', size.words],
        ['lines', size.lines],
      ] as const
    ).map(([label, value]) => h.span([], [h.b([], [String(value)]), ` ${label}`])),
  )
}

/** The text box of a tool, with its counts, an example and a clear button. */
export const sourcePanel = (
  c: Ctx,
  props: Readonly<{ label?: string; placeholder?: string; rows?: number }> = {},
): Html => {
  const { h } = c
  const id = `${c.id}-input`
  return panel(h, null, [
    field(
      h,
      { label: props.label ?? 'Text', for: id },
      textArea(h, {
        id,
        value: c.input,
        placeholder: props.placeholder ?? 'Type, paste, or drop a text file',
        rows: props.rows ?? 12,
        onInput: c.setInput,
      }),
    ),
    h.div(
      [h.Class(footCls)],
      [
        counts(h, c.input),
        h.div(
          [h.Class(row)],
          [
            c.example === '' || c.input === c.example
              ? null
              : button(
                  h,
                  { variant: 'ghost', size: 'sm' },
                  [h.OnClick(c.setInput(c.example))],
                  ['Example'],
                ),
            button(
              h,
              { variant: 'ghost', size: 'sm' },
              [h.Disabled(c.input === ''), h.OnClick(c.clear)],
              ['Clear'],
            ),
          ],
        ),
      ],
    ),
  ])
}

export const modePicker = (
  c: Ctx,
  options: ReadonlyArray<Readonly<{ value: string; label: string }>>,
  label = 'Mode',
): Html => segmented(c.h, { label, value: c.mode, options, onSelect: c.setMode })

export const errorLine = (c: Ctx, error: string): Html =>
  error === '' ? null : c.h.p([c.h.Role('alert'), c.h.Class(errorCls)], [error])

export const useAsInput = (c: Ctx, value: string): Html =>
  button(
    c.h,
    { variant: 'ghost', size: 'sm' },
    [c.h.Disabled(value === '' || value === c.input), c.h.OnClick(c.setInput(value))],
    ['Use as input'],
  )

/** Wraps something in a box with a copy button in the corner. */
export const copyable = <M>(h: HtmlBuilder<M>, text: string, child: Html): Html =>
  h.div(
    [h.Class(copyWrapCls)],
    [child, text === '' ? null : Elements.copyButton(h, false, h.Attribute('data-copy', text))],
  )

export type Piece = Readonly<{
  text: string
  kind?: 'hit' | 'warn' | 'dim' | 'ins' | 'del'
}>

const pieceView = <M>(h: HtmlBuilder<M>, piece: Piece): Html | string => {
  switch (piece.kind) {
    case 'hit':
      return h.mark([], [piece.text])
    case 'warn':
      return h.mark([h.Attribute('data-warn', '')], [piece.text])
    case 'dim':
      return h.span([h.Attribute('data-dim', '')], [piece.text])
    case 'ins':
      return h.ins([], [piece.text])
    case 'del':
      return h.del([], [piece.text])
    default:
      return piece.text
  }
}

/** Text with some stretches marked. `copy` is what the copy button takes. */
export const marked = <M>(
  h: HtmlBuilder<M>,
  label: string,
  pieces: ReadonlyArray<Piece>,
  copy?: string,
): Html => {
  const pre = h.pre(
    [h.Class(markedCls), h.AriaLabel(label), h.Tabindex(0)],
    pieces.map((piece) => pieceView(h, piece)),
  )
  return copy === undefined ? pre : copyable(h, copy, pre)
}

/** The same text as large type, for short results such as headlines and slugs. */
export const display = <M>(
  h: HtmlBuilder<M>,
  label: string,
  value: string,
  pieces?: ReadonlyArray<Piece>,
): Html =>
  copyable(
    h,
    value,
    h.div(
      [h.Class(displayCls), h.AriaLabel(label), h.Tabindex(0)],
      (pieces ?? [{ text: value }]).map((piece) => pieceView(h, piece)),
    ),
  )

const visible = (text: string): string =>
  text
    .replaceAll(/[ \u00a0]/gu, '·')
    .replaceAll('\t', '→')
    .replaceAll('\n', '↵\n')
    .replaceAll('\r', '')
    .replaceAll(/[\u200b-\u200d\u2060\ufeff]/gu, (char) => `‹${char.codePointAt(0)?.toString(16)}›`)

/** What turning `before` into `after` removed and added, character by character. */
export const changePieces = (before: string, after: string): ReadonlyArray<Piece> =>
  compare(before, after, 'chars').map((part) =>
    part.kind === 'remove'
      ? { text: visible(part.text), kind: 'del' }
      : part.kind === 'add'
        ? { text: part.text.trim() === '' ? visible(part.text) : part.text, kind: 'ins' }
        : { text: part.text },
  )

export const changeTotals = (
  before: string,
  after: string,
): Readonly<{ removed: number; added: number }> => {
  const parts = compare(before, after, 'chars')
  const size = (kind: string) =>
    parts.filter((part) => part.kind === kind).reduce((sum, part) => sum + [...part.text].length, 0)
  return { removed: size('remove'), added: size('add') }
}

type Option = Readonly<{ value: string; label: string }>

/**
 * A clean-up tool: the text on the left; on the right what the clean-up did, with what it
 * removed marked in red, or just the result.
 */
export const cleaner = (
  c: Ctx,
  props: Readonly<{
    options?: ReadonlyArray<Option>
    run: (text: string, mode: string) => string
    placeholder?: string
    /** More numbers for the tiles, from the text before and after. */
    extra?: (before: string, after: string) => ReadonlyArray<readonly [string, string]>
  }>,
): Html => {
  const { h } = c
  const result = attempt(() => props.run(c.input, c.mode))
  const showing = c.opt('view', 'changes')
  const totals = changeTotals(c.input, result.value)
  return h.div(
    [h.Class(stack)],
    [
      props.options === undefined ? null : modePicker(c, props.options),
      columns(h, [
        sourcePanel(c, props.placeholder === undefined ? {} : { placeholder: props.placeholder }),
        panel(h, null, [
          h.div(
            [h.Class(footCls)],
            [
              segmented(h, {
                label: 'Show',
                value: showing,
                options: [
                  { value: 'changes', label: 'Changes' },
                  { value: 'result', label: 'Result' },
                ],
                onSelect: c.setOpt('view'),
              }),
              useAsInput(c, result.value),
            ],
          ),
          result.value === '' && result.error === ''
            ? hint(h, 'Paste text to see what changes.')
            : showing === 'changes'
              ? marked(h, 'Changes', changePieces(c.input, result.value), result.value)
              : marked(h, 'Result', [{ text: result.value }], result.value),
          errorLine(c, result.error),
          result.value === ''
            ? null
            : stats(h, [
                ['Removed', String(totals.removed)],
                ['Added', String(totals.added)],
                ['Characters', `${[...c.input].length} → ${[...result.value].length}`],
                ...(props.extra?.(c.input, result.value) ?? []),
              ]),
        ]),
      ]),
    ],
  )
}

/** A row of choices that each show what they would produce. */
export const previewGrid = (
  c: Ctx,
  items: ReadonlyArray<Readonly<{ value: string; label: string; text: string; note?: string }>>,
): Html =>
  c.h.div(
    [c.h.Class(gridCls), c.h.Role('group'), c.h.AriaLabel('Options')],
    items.map((item) =>
      c.h.button(
        [
          c.h.Type('button'),
          c.h.Class(optionCls),
          c.h.AriaPressed(item.value === c.mode ? 'true' : 'false'),
          c.h.OnClick(c.setMode(item.value)),
        ],
        [
          c.h.small([], [item.note === undefined ? item.label : `${item.label} · ${item.note}`]),
          c.h.span([], [item.text === '' ? '—' : item.text]),
        ],
      ),
    ),
  )

/** Horizontal bars, longest first. `share` is shown as a percent. */
export const bars = <M>(
  h: HtmlBuilder<M>,
  rows: ReadonlyArray<Readonly<{ label: string; count: number; share: number }>>,
): Html => {
  const top = Math.max(1, ...rows.map((item) => item.count))
  return h.div(
    [h.Class(`${barsCls} ${scrollCls}`)],
    rows.map((item) =>
      h.div(
        [h.Class(barRowCls)],
        [
          h.b([], [item.label]),
          h.i([h.Style({ width: `${Math.max(2, (item.count / top) * 100)}%` })], []),
          h.span([], [String(item.count), h.small([], [`${item.share.toFixed(1)}%`])]),
        ],
      ),
    ),
  )
}

export const chips = <M>(
  h: HtmlBuilder<M>,
  items: ReadonlyArray<Readonly<{ text: string; note?: string }>>,
): Html =>
  h.div(
    [h.Class(`${chipsCls} ${scrollCls}`)],
    items.map((item) =>
      h.span(
        [h.Class(chipCls)],
        [item.text, item.note === undefined ? null : h.small([], [item.note])],
      ),
    ),
  )

/** Source with line numbers and visible tabs. */
export const codeBlock = <M>(h: HtmlBuilder<M>, label: string, text: string): Html =>
  copyable(
    h,
    text,
    h.pre(
      [h.Class(codeCls), h.AriaLabel(label), h.Tabindex(0)],
      text.split('\n').map((line) => h.span([], [line.replaceAll('\t', '→   ')])),
    ),
  )

/** `n` of something, with the right noun: `1 word`, `2 words`. */
export const plural = (n: number, one: string, many = `${one}s`): string =>
  `${n} ${n === 1 ? one : many}`

/** Reads the `label  count  percent` lines the frequency tools return. */
export const frequencyRows = (
  value: string,
): ReadonlyArray<Readonly<{ label: string; count: number; share: number }>> =>
  value
    .split('\n')
    .filter((line) => line !== '')
    .map((line) => {
      const [label = '', count = '0', share = ''] = line.split('  ')
      return { label, count: Number(count), share: Number.parseFloat(share) || 0 }
    })

/** A frequency tool: the text, and bars of what appears most. */
export const frequency = (
  c: Ctx,
  props: Readonly<{
    run: (text: string, mode: string) => string
    options?: ReadonlyArray<Option>
    noun: string
  }>,
): Html => {
  const { h } = c
  const result = attempt(() => (c.input.trim() === '' ? '' : props.run(c.input, c.mode)))
  const rows = result.value === '' ? [] : frequencyRows(result.value)
  const total = rows.reduce((sum, item) => sum + item.count, 0)
  return h.div(
    [h.Class(stack)],
    [
      props.options === undefined ? null : modePicker(c, props.options),
      columns(h, [
        sourcePanel(c),
        panel(h, 'Frequency', [
          rows.length === 0
            ? hint(h, result.error === '' ? 'Paste text to count.' : result.error)
            : h.div(
                [h.Class(stack)],
                [
                  stats(h, [
                    [`Total ${props.noun}`, String(total)],
                    ['Distinct', String(rows.length)],
                    ['Most common', rows[0]?.label ?? ''],
                  ]),
                  bars(h, rows),
                ],
              ),
        ]),
      ]),
    ],
  )
}
