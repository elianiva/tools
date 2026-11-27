// Shared plumbing and parts for the developer tools. `defineWorkbench` owns what every one
// of them needs the same way (the text, the mode, a few options, file drops); each tool
// brings its own view. The parts below are small, stateless pieces those views compose.
import { Elements } from '@tools/ui'
import { Effect, Schema } from 'effect'
import { Command, File, Submodel } from 'foldkit'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { defineMessageUnion } from 'foldkit/message'
import { css } from '../../../styled-system/css'
import { button, columns, field, panel, segmented, stack, textArea, textInput } from '../kit.ts'
import { defineTool, type ToolMeta } from '../tool.ts'

type Options = Readonly<Record<string, string>>

type Model = Readonly<{ input: string; mode: string; opts: Options }>

const Message = defineMessageUnion({
  ChangedInput: { input: Schema.String },
  ChangedMode: { mode: Schema.String },
  SetOption: { key: Schema.String, value: Schema.String },
  ToggledOption: { key: Schema.String },
  Replaced: { input: Schema.String, mode: Schema.String },
  ClickedClear: {},
  DroppedFiles: { files: Schema.Array(File.File) },
  LoadedText: { input: Schema.String },
  FailedLoad: {},
})
export type Msg = typeof Message.Type
export type H = HtmlBuilder<Msg>

const LoadText = Command.define('LoadText', {
  args: { file: File.File },
  messages: [Message.LoadedText, Message.FailedLoad],
  execute: ({ file }) =>
    File.readAsText(file).pipe(
      Effect.map((input) => Message.LoadedText({ input })),
      Effect.orElseSucceed(() => Message.FailedLoad()),
    ),
})

const update = (model: Model, message: Msg) =>
  Message.match<{ model: Model; commands?: ReadonlyArray<Command.Command<Msg>> }>(message, {
    ChangedInput: ({ input }) => ({ model: { ...model, input } }),
    ChangedMode: ({ mode }) => ({ model: { ...model, mode } }),
    SetOption: ({ key, value }) => ({
      model: { ...model, opts: { ...model.opts, [key]: value } },
    }),
    ToggledOption: ({ key }) => ({
      model: { ...model, opts: { ...model.opts, [key]: model.opts[key] === '1' ? '' : '1' } },
    }),
    Replaced: ({ input, mode }) => ({ model: { ...model, input, mode } }),
    ClickedClear: () => ({ model: { ...model, input: '' } }),
    DroppedFiles: ({ files }) => {
      const first = files[0]
      return first === undefined ? { model } : { model, commands: [LoadText({ file: first })] }
    },
    LoadedText: ({ input }) => ({ model: { ...model, input } }),
    FailedLoad: () => ({ model }),
  })

/** What a tool's view gets: the state, and the Messages that change it. */
export type Ctx = Readonly<{
  input: string
  mode: string
  example: string
  /** An option's value. Toggles are `'1'` when on. */
  opt: (key: string) => string
  on: Readonly<{
    input: (value: string) => Msg
    mode: (value: string) => Msg
    option: (key: string) => (value: string) => Msg
    toggle: (key: string) => Msg
    replace: (input: string, mode: string) => Msg
    clear: Msg
  }>
}>

type WorkbenchSpec = Readonly<{
  meta: Omit<ToolMeta, 'accepts'>
  /** The first mode is the one selected at the start. */
  mode?: string
  example?: string
  opts?: Options
  acceptsFiles?: boolean
  view: (h: H, ctx: Ctx) => Html
}>

export const defineWorkbench = (spec: WorkbenchSpec) => {
  const view = Submodel.defineView<Model, Msg>((model, h) =>
    spec.view(h, {
      input: model.input,
      mode: model.mode,
      example: spec.example ?? '',
      opt: (key) => model.opts[key] ?? '',
      on: {
        input: (input) => Message.ChangedInput({ input }),
        mode: (mode) => Message.ChangedMode({ mode }),
        option: (key) => (value) => Message.SetOption({ key, value }),
        toggle: (key) => Message.ToggledOption({ key }),
        replace: (input, mode) => Message.Replaced({ input, mode }),
        clear: Message.ClickedClear(),
      },
    }),
  )
  return defineTool<Model, Msg>({
    meta: {
      ...spec.meta,
      ...(spec.acceptsFiles === true ? { accepts: ['text/*', '.txt', '.json', '.md'] } : {}),
    },
    init: () => ({ input: spec.example ?? '', mode: spec.mode ?? '', opts: spec.opts ?? {} }),
    update,
    view,
    ...(spec.acceptsFiles === true
      ? { receive: (files: ReadonlyArray<File>) => Message.DroppedFiles({ files }) }
      : {}),
  })
}

// ---------------------------------------------------------------------------------------
// Text helpers

const encoder = new TextEncoder()

export const byteLength = (text: string): number => encoder.encode(text).length

export const formatSize = (bytes: number): string =>
  bytes < 1024
    ? `${bytes} B`
    : bytes < 1_048_576
      ? `${(bytes / 1024).toFixed(1)} KB`
      : `${(bytes / 1_048_576).toFixed(1)} MB`

export const hex = (value: number, width = 2): string =>
  value.toString(16).toUpperCase().padStart(width, '0')

/** Runs a tool's pure function and keeps the error message instead of throwing. */
export const attempt = (run: () => string): Readonly<{ value: string; error: string }> => {
  try {
    return { value: run(), error: '' }
  } catch (error) {
    return { value: '', error: error instanceof Error ? error.message : 'Could not process this.' }
  }
}

// ---------------------------------------------------------------------------------------
// Styles

const mono = { fontFamily: 'var(--mono)' } as const

export const toolbarCls = css({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: '0.6rem',
})
const stripCls = css({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.3rem 1rem',
  ...mono,
  fontSize: '0.72rem',
  color: 'var(--muted-foreground)',
  '& b': { color: 'var(--foreground)', fontWeight: 600 },
})
const footCls = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '0.75rem',
  flexWrap: 'wrap',
})
const errorCls = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.4rem',
  padding: '0.6rem 0.8rem',
  borderRadius: 'var(--radius)',
  background: 'color-mix(in oklab, var(--danger) 10%, transparent)',
  boxShadow: 'inset 0 0 0 1px color-mix(in oklab, var(--danger) 40%, transparent)',
  color: 'var(--danger)',
  fontSize: '0.85rem',
  ...mono,
  '& pre': {
    margin: 0,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
    color: 'var(--foreground)',
    fontSize: '0.8rem',
  },
  '& mark': {
    background: 'var(--danger)',
    color: 'var(--primary-foreground)',
    borderRadius: '3px',
    padding: '0 0.15rem',
  },
})
const chipsCls = css({ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' })
const chipCls = css({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.4rem',
  padding: '0.25rem 0.7rem',
  border: 0,
  borderRadius: '999px',
  background: 'var(--well)',
  boxShadow: 'var(--elev-well)',
  color: 'var(--muted-foreground)',
  fontSize: '0.8rem',
  fontWeight: 500,
  cursor: 'pointer',
  transition: 'color 150ms, background 150ms',
  '&:hover': { color: 'var(--foreground)' },
  '&[aria-pressed="true"]': {
    background: 'linear-gradient(var(--raised-top), var(--raised-bottom))',
    boxShadow: 'var(--elev-raised)',
    color: 'var(--foreground)',
  },
  '& small': { ...mono, fontSize: '0.7rem', opacity: 0.7 },
})
const tableWrapCls = css({
  overflow: 'auto',
  maxHeight: '32rem',
  borderRadius: 'var(--radius)',
  background: 'var(--well)',
  boxShadow: 'var(--elev-well)',
  '& table': { width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' },
  '& th': {
    position: 'sticky',
    top: 0,
    zIndex: 1,
    padding: '0.5rem 0.75rem',
    textAlign: 'left',
    background: 'var(--well)',
    ...mono,
    fontSize: '0.68rem',
    fontWeight: 500,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'var(--muted-foreground)',
  },
  '& td': {
    padding: '0.4rem 0.75rem',
    borderTop: '1px solid var(--hairline-soft)',
    verticalAlign: 'top',
  },
  '& td[data-mono]': { ...mono, fontSize: '0.8rem', wordBreak: 'break-all' },
  '& td[data-num]': { ...mono, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' },
})
const labelCls = css({
  ...mono,
  fontSize: '0.68rem',
  fontWeight: 500,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: 'var(--muted-foreground)',
})
const emptyCls = css({
  margin: 0,
  padding: '1.5rem 1rem',
  textAlign: 'center',
  color: 'var(--muted-foreground)',
  fontSize: '0.85rem',
})
const cellInputCls = css({
  width: '100%',
  minWidth: '5rem',
  padding: '0.2rem 0.4rem',
  border: 0,
  borderRadius: '5px',
  background: 'transparent',
  color: 'inherit',
  font: 'inherit',
  '&:hover': { background: 'var(--card)' },
  '&:focus': { background: 'var(--card)', outline: '2px solid var(--ring)' },
})

// ---------------------------------------------------------------------------------------
// Parts

export const sectionLabel = (h: H, text: string): Html => h.span([h.Class(labelCls)], [text])

/** Counts under a text box. */
export const counts = (h: H, text: string): Html =>
  h.div(
    [h.Class(stripCls)],
    [
      h.span([], [h.b([], [String([...text].length)]), ' chars']),
      h.span([], [h.b([], [formatSize(byteLength(text))])]),
      h.span([], [h.b([], [String(text === '' ? 0 : text.split('\n').length)]), ' lines']),
    ],
  )

/** A text box with its counts, an Example button, and Clear. */
export const inputBox = (
  h: H,
  ctx: Ctx,
  props: Readonly<{
    id: string
    label: string
    placeholder?: string
    rows?: number
    /** Extra controls next to Clear. */
    actions?: ReadonlyArray<Html>
  }>,
): Html =>
  h.div(
    [h.Class(css({ display: 'flex', flexDirection: 'column', gap: '0.6rem' }))],
    [
      field(
        h,
        { label: props.label, for: props.id },
        textArea(h, {
          id: props.id,
          value: ctx.input,
          ...(props.placeholder === undefined ? {} : { placeholder: props.placeholder }),
          rows: props.rows ?? 12,
          onInput: ctx.on.input,
        }),
      ),
      h.div(
        [h.Class(footCls)],
        [
          counts(h, ctx.input),
          h.div(
            [h.Class(toolbarCls)],
            [
              ...(props.actions ?? []),
              ctx.example === '' || ctx.input === ctx.example
                ? null
                : button(
                    h,
                    { variant: 'ghost', size: 'sm' },
                    [h.OnClick(ctx.on.input(ctx.example))],
                    ['Example'],
                  ),
              button(
                h,
                { variant: 'ghost', size: 'sm' },
                [h.Disabled(ctx.input === ''), h.OnClick(ctx.on.clear)],
                ['Clear'],
              ),
            ],
          ),
        ],
      ),
    ],
  )

/** An error, with the offending part of the input marked when its position is known. */
export const errorNote = (
  h: H,
  message: string,
  at?: Readonly<{ text: string; index: number; length?: number }>,
): Html => {
  if (message === '') return null
  const marked =
    at === undefined || at.index < 0 || at.index > at.text.length
      ? null
      : (() => {
          const length = Math.max(1, at.length ?? 1)
          const from = Math.max(0, at.index - 24)
          const to = Math.min(at.text.length, at.index + length + 24)
          return h.pre(
            [],
            [
              from > 0 ? '…' : '',
              at.text.slice(from, at.index),
              h.mark([], [at.text.slice(at.index, at.index + length) || '⏎']),
              at.text.slice(at.index + length, to),
              to < at.text.length ? '…' : '',
            ],
          )
        })()
  return h.div([h.Role('alert'), h.Class(errorCls)], [h.span([], [message]), marked])
}

/** A filter chip row. `count` shows how many rows each chip would leave. */
export const chips = <V extends string>(
  h: H,
  props: Readonly<{
    label: string
    value: V
    options: ReadonlyArray<Readonly<{ value: V; label: string; count?: number }>>
    onPick: (value: V) => Msg
  }>,
): Html =>
  h.div(
    [h.Class(chipsCls), h.Role('group'), h.AriaLabel(props.label)],
    props.options.map((option) =>
      h.button(
        [
          h.Class(chipCls),
          h.Type('button'),
          h.AriaPressed(String(option.value === props.value)),
          h.OnClick(props.onPick(option.value)),
        ],
        [option.label, option.count === undefined ? null : h.small([], [String(option.count)])],
      ),
    ),
  )

export const copyButton = (h: H, value: string): Html =>
  value === '' ? null : Elements.copyButton(h, false, h.Attribute('data-copy', value))

/** A table with a sticky head. Cells may be text or Html. */
export const dataTable = (
  h: H,
  props: Readonly<{
    headers: ReadonlyArray<string>
    /** `mono` and `num` style the column's cells. */
    kinds?: ReadonlyArray<'mono' | 'num' | 'text'>
    rows: ReadonlyArray<ReadonlyArray<Html | string>>
    empty?: string
  }>,
): Html =>
  props.rows.length === 0
    ? h.p([h.Class(emptyCls)], [props.empty ?? 'Nothing matches.'])
    : h.div(
        [h.Class(tableWrapCls), h.Tabindex(0)],
        [
          h.table(
            [],
            [
              h.thead(
                [],
                [
                  h.tr(
                    [],
                    props.headers.map((header) => h.th([h.Scope('col')], [header])),
                  ),
                ],
              ),
              h.tbody(
                [],
                props.rows.map((cells, index) =>
                  h.tr(
                    [h.Key(String(index))],
                    cells.map((cell, column) => {
                      const kind = props.kinds?.[column]
                      return h.td(
                        kind === 'mono'
                          ? [h.Attribute('data-mono', '')]
                          : kind === 'num'
                            ? [h.Attribute('data-num', '')]
                            : [],
                        [cell],
                      )
                    }),
                  ),
                ),
              ),
            ],
          ),
        ],
      )

/** A table cell that edits in place. */
export const cellInput = (
  h: H,
  props: Readonly<{ label: string; value: string; onInput: (value: string) => Msg }>,
): Html =>
  h.input([
    h.Class(cellInputCls),
    h.Type('text'),
    h.AriaLabel(props.label),
    h.Value(props.value),
    h.Spellcheck(false),
    h.OnInput(props.onInput),
  ])

/** Direction toggle with a swap button that moves the output into the input. */
export const direction = (
  h: H,
  ctx: Ctx,
  props: Readonly<{
    modes: ReadonlyArray<Readonly<{ value: string; label: string }>>
    /** The mode that undoes each mode. A mode with no entry cannot swap. */
    inverse?: Readonly<Record<string, string>>
    output: string
    extra?: ReadonlyArray<Html>
  }>,
): Html => {
  const back = props.inverse?.[ctx.mode]
  return h.div(
    [h.Class(toolbarCls)],
    [
      props.modes.length === 0
        ? null
        : segmented(h, {
            label: 'Direction',
            value: ctx.mode,
            options: props.modes,
            onSelect: ctx.on.mode,
          }),
      back === undefined
        ? null
        : button(
            h,
            { variant: 'secondary', size: 'sm' },
            [
              h.Disabled(props.output === ''),
              h.AriaLabel('Use the output as the input and reverse the direction'),
              h.OnClick(ctx.on.replace(props.output, back)),
            ],
            ['⇄ Swap'],
          ),
      ...(props.extra ?? []),
    ],
  )
}

// ---------------------------------------------------------------------------------------
// JSON highlighting

const jsonTokenCls = css({
  '& [data-t="key"]': { color: 'var(--info)' },
  '& [data-t="string"]': { color: 'var(--ok)' },
  '& [data-t="number"]': { color: 'var(--warn)' },
  '& [data-t="literal"]': { color: 'var(--primary)' },
  '& [data-t="punct"]': { color: 'var(--muted-foreground)' },
})
export const jsonTokens = jsonTokenCls

const TOKEN =
  /("(?:[^"\\]|\\.)*")(\s*:)?|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|\b(true|false|null)\b|([{}[\],:])/gu

/** JSON text split into coloured spans. Works on any text; unknown characters stay plain. */
export const highlightJson = (h: H, text: string): ReadonlyArray<Html | string> => {
  const out: Array<Html | string> = []
  let cursor = 0
  for (const match of text.matchAll(TOKEN)) {
    if (match.index > cursor) out.push(text.slice(cursor, match.index))
    const [whole, string, colon, number, literal] = match
    if (string !== undefined) {
      out.push(h.span([h.Attribute('data-t', colon === undefined ? 'string' : 'key')], [string]))
      if (colon !== undefined) out.push(h.span([h.Attribute('data-t', 'punct')], [colon]))
    } else {
      out.push(
        h.span(
          [
            h.Attribute(
              'data-t',
              number !== undefined ? 'number' : literal !== undefined ? 'literal' : 'punct',
            ),
          ],
          [whole],
        ),
      )
    }
    cursor = match.index + whole.length
  }
  if (cursor < text.length) out.push(text.slice(cursor))
  return out
}

const codeCls = css({
  position: 'relative',
  '& pre': {
    margin: 0,
    padding: '0.8rem 3rem 0.8rem 0.9rem',
    minHeight: '4rem',
    maxHeight: '32rem',
    overflow: 'auto',
    borderRadius: 'var(--radius)',
    background: 'var(--well)',
    boxShadow: 'var(--elev-well)',
    ...mono,
    fontSize: '0.82rem',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },
  '& [data-slot="copy-button"]': { position: 'absolute', top: '0.4rem', right: '0.4rem' },
})

/** Read-only text with a copy button. Pass `children` to colour it. */
export const codeBox = (
  h: H,
  props: Readonly<{
    label: string
    value: string
    children?: ReadonlyArray<Html | string>
    class?: string
  }>,
): Html =>
  h.div(
    [h.Class(props.class === undefined ? codeCls : `${codeCls} ${props.class}`)],
    [
      h.pre([h.AriaLabel(props.label), h.Tabindex(0)], props.children ?? [props.value]),
      copyButton(h, props.value),
    ],
  )

/** `[label, value]` pairs as a plain definition list, each with a copy button. */
const factsCls = css({
  display: 'grid',
  gridTemplateColumns: 'minmax(6rem, max-content) 1fr auto',
  alignItems: 'center',
  gap: '0.3rem 0.9rem',
  margin: 0,
  '& dt': { ...mono, fontSize: '0.72rem', color: 'var(--muted-foreground)' },
  '& dd': { margin: 0, ...mono, fontSize: '0.85rem', wordBreak: 'break-all' },
})
export const facts = (h: H, rows: ReadonlyArray<readonly [label: string, value: string]>): Html =>
  h.dl(
    [h.Class(factsCls)],
    rows.flatMap(([label, value]) => [
      h.dt([], [label]),
      h.dd([], [value]),
      h.div([], [copyButton(h, value)]),
    ]),
  )

// ---------------------------------------------------------------------------------------
// Encode and decode layout

/** The layout of the encode and decode tools: direction and swap, input beside output. */
export const codecView = (
  h: H,
  ctx: Ctx,
  spec: Readonly<{
    id: string
    modes: ReadonlyArray<Readonly<{ value: string; label: string }>>
    inverse?: Readonly<Record<string, string>>
    run: (input: string, mode: string) => string
    /** Index of the first character that cannot be decoded, when the mode can tell. */
    locate?: (input: string, mode: string) => number | undefined
    /** The input and output labels for a mode. */
    labels: (mode: string) => readonly [input: string, output: string]
    placeholder?: string
    toolbar?: ReadonlyArray<Html>
    details?: (input: string, output: string, mode: string) => Html
  }>,
): Html => {
  const result =
    ctx.input === '' ? { value: '', error: '' } : attempt(() => spec.run(ctx.input, ctx.mode))
  const [inputLabel, outputLabel] = spec.labels(ctx.mode)
  const at =
    result.error === ''
      ? undefined
      : (spec.locate?.(ctx.input, ctx.mode) ?? locateInMessage(ctx.input, result.error))
  const details = result.value === '' ? null : spec.details?.(ctx.input, result.value, ctx.mode)
  return h.div(
    [h.Class(stack)],
    [
      spec.modes.length === 0 && spec.toolbar === undefined
        ? null
        : direction(h, ctx, {
            modes: spec.modes,
            inverse: spec.inverse ?? {},
            output: result.value,
            ...(spec.toolbar === undefined ? {} : { extra: spec.toolbar }),
          }),
      columns(h, [
        panel(h, null, [
          inputBox(h, ctx, {
            id: `${spec.id}-input`,
            label: inputLabel,
            ...(spec.placeholder === undefined ? {} : { placeholder: spec.placeholder }),
            rows: 10,
          }),
          errorNote(h, result.error, at === undefined ? undefined : { text: ctx.input, index: at }),
        ]),
        panel(h, null, [
          sectionLabel(h, outputLabel),
          codeBox(h, { label: outputLabel, value: result.value }),
          result.value === '' ? null : counts(h, result.value),
        ]),
      ]),
      details === null || details === undefined ? null : panel(h, null, [details]),
    ],
  )
}

/** Where a parser error points, read from its message: `position 5`, `line 2, column 3`, or `Line 4`. */
export const locateInMessage = (input: string, message: string): number | undefined => {
  const position = /position (\d+)/u.exec(message)
  if (position !== null) return Number(position[1])
  const lineColumn = /line (\d+),? column (\d+)/iu.exec(message)
  if (lineColumn !== null) {
    const lines = input.split('\n')
    const line = Math.max(1, Number(lineColumn[1]))
    const before = lines.slice(0, line - 1).reduce((sum, text) => sum + text.length + 1, 0)
    return before + Math.max(0, Number(lineColumn[2]) - 1)
  }
  const lineOnly = /^Line (\d+)/u.exec(message)
  if (lineOnly !== null) {
    return input
      .split('\n')
      .slice(0, Number(lineOnly[1]) - 1)
      .reduce((sum, text) => sum + text.length + 1, 0)
  }
  return undefined
}

// ---------------------------------------------------------------------------------------
// Bits

const bitsCls = css({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.5rem 0.9rem',
  '& [data-group]': { display: 'flex', gap: '2px' },
  '& button, & span[data-bit]': {
    width: '1.55rem',
    height: '2rem',
    padding: 0,
    border: 0,
    borderRadius: '5px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--well)',
    boxShadow: 'var(--elev-well)',
    color: 'var(--muted-foreground)',
    ...mono,
    fontSize: '0.85rem',
  },
  '& button': { cursor: 'pointer', transition: 'background 120ms, color 120ms' },
  '& button:hover': { color: 'var(--foreground)' },
  '& [data-on]': {
    background: 'linear-gradient(var(--primary-fill-top), var(--primary-fill-bottom))',
    boxShadow: 'var(--elev-primary)',
    color: 'var(--primary-foreground)',
  },
  '& [data-host]': { opacity: 0.55 },
})

/** A row of bits, most significant first, in groups of eight. Pass `onToggle` to make them buttons. */
export const bitRow = (
  h: H,
  props: Readonly<{
    label: string
    value: bigint
    width: number
    onToggle?: (bit: number) => Msg
    /** Bits counted from the left that are dimmed, such as the host part of an address. */
    dimFrom?: number
  }>,
): Html => {
  const unsigned = BigInt.asUintN(props.width, props.value)
  const groups: Array<Html> = []
  for (let start = 0; start < props.width; start += 8) {
    groups.push(
      h.div(
        [h.Attribute('data-group', ''), h.Key(String(start))],
        Array.from({ length: Math.min(8, props.width - start) }, (_, offset) => {
          const left = start + offset
          const bit = props.width - 1 - left
          const on = ((unsigned >> BigInt(bit)) & 1n) === 1n
          const attrs = [
            ...(on ? [h.Attribute('data-on', '')] : []),
            ...(props.dimFrom !== undefined && left >= props.dimFrom
              ? [h.Attribute('data-host', '')]
              : []),
          ]
          return props.onToggle === undefined
            ? h.span([h.Attribute('data-bit', ''), ...attrs], [on ? '1' : '0'])
            : h.button(
                [
                  h.Type('button'),
                  h.AriaLabel(`${props.label} bit ${bit}`),
                  h.AriaPressed(String(on)),
                  h.OnClick(props.onToggle(bit)),
                  ...attrs,
                ],
                [on ? '1' : '0'],
              )
        }),
      ),
    )
  }
  return h.div([h.Class(bitsCls), h.Role('group'), h.AriaLabel(props.label)], groups)
}

// ---------------------------------------------------------------------------------------
// Fields and digests

export const textField = (
  h: H,
  props: Readonly<{
    id: string
    label: string
    value: string
    placeholder?: string
    onInput: (value: string) => Msg
  }>,
): Html =>
  field(
    h,
    { label: props.label, for: props.id },
    textInput(h, {
      id: props.id,
      value: props.value,
      ...(props.placeholder === undefined ? {} : { placeholder: props.placeholder }),
      onInput: props.onInput,
    }),
  )

const digestCls = css({
  display: 'grid',
  gridTemplateColumns: 'minmax(5.5rem, max-content) 1fr auto',
  alignItems: 'center',
  gap: '0.4rem 0.9rem',
  '& [data-name]': { ...mono, fontSize: '0.75rem', color: 'var(--muted-foreground)' },
  '& [data-value]': { ...mono, fontSize: '0.82rem', wordBreak: 'break-all' },
  '& [data-match] [data-value], & [data-value][data-match]': { color: 'var(--ok)' },
})

/** Named digests, one copy button each. A digest equal to `compare` is marked. */
export const digestList = (
  h: H,
  rows: ReadonlyArray<readonly [name: string, value: string]>,
  compare: string,
): Html => {
  const wanted = compare.trim().toLowerCase()
  return h.div(
    [h.Class(digestCls)],
    rows.flatMap(([name, value]) => {
      const hit = wanted !== '' && value.toLowerCase() === wanted
      return [
        h.span([h.Attribute('data-name', '')], [name]),
        h.span(
          [h.Attribute('data-value', ''), ...(hit ? [h.Attribute('data-match', '')] : [])],
          [hit ? `${value}  ✓ match` : value],
        ),
        h.div([], [copyButton(h, value)]),
      ]
    }),
  )
}

// ---------------------------------------------------------------------------------------
// Reference tables

export type RefRow = Readonly<{
  category: string
  /** Lower-case text the search box matches. */
  search: string
  cells: ReadonlyArray<string>
}>

/** A search box, category chips with counts, and a table. The category is the `cat` option. */
export const referenceView = (
  h: H,
  ctx: Ctx,
  spec: Readonly<{
    id: string
    label: string
    placeholder: string
    categories: ReadonlyArray<string>
    headers: ReadonlyArray<string>
    kinds: ReadonlyArray<'mono' | 'num' | 'text'>
    /** The column that gets a copy button. */
    copyColumn: number
    rows: ReadonlyArray<RefRow>
    empty: string
  }>,
): Html => {
  const words = ctx.input
    .trim()
    .toLowerCase()
    .split(/\s+/u)
    .filter((word) => word !== '')
  const searched = spec.rows.filter((row) => words.every((word) => row.search.includes(word)))
  const category = ctx.opt('cat')
  const shown = category === '' ? searched : searched.filter((row) => row.category === category)
  return h.div(
    [h.Class(css({ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }))],
    [
      panel(h, null, [
        textField(h, {
          id: `${spec.id}-search`,
          label: spec.label,
          value: ctx.input,
          placeholder: spec.placeholder,
          onInput: ctx.on.input,
        }),
        chips(h, {
          label: 'Category',
          value: category,
          options: [
            { value: '', label: 'All', count: searched.length },
            ...spec.categories.map((name) => ({
              value: name,
              label: name,
              count: searched.filter((row) => row.category === name).length,
            })),
          ],
          onPick: ctx.on.option('cat'),
        }),
      ]),
      dataTable(h, {
        headers: spec.headers,
        kinds: spec.kinds,
        empty: spec.empty,
        rows: shown.map((row) =>
          row.cells.map((cell, column) =>
            column === spec.copyColumn
              ? h.span([h.Class(copyCellCls)], [cell, copyButton(h, cell)])
              : cell,
          ),
        ),
      }),
    ],
  )
}

const copyCellCls: string = css({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.4rem',
  '& [data-slot="copy-button"]': { opacity: 0.55 },
  '&:hover [data-slot="copy-button"]': { opacity: 1 },
})
