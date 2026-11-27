// Shared pieces of the cipher, encoding, fun-text and compare tools: a small stateful
// shell (`defineLab`) and the visual parts their views are built from.
import { Elements } from '@tools/ui'
import { Schema } from 'effect'
import { Submodel } from 'foldkit'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { defineMessageUnion } from 'foldkit/message'
import { css } from '../../../styled-system/css'
import {
  button,
  columns,
  field,
  output,
  panel,
  row,
  segmented,
  textArea,
  textInput,
} from '../kit.ts'
import { defineTool, type ToolMeta } from '../tool.ts'

const Model = Schema.Struct({ input: Schema.String, mode: Schema.String, flag: Schema.Boolean })
type Model = typeof Model.Type

const Message = defineMessageUnion({
  ChangedInput: { input: Schema.String },
  ChangedMode: { mode: Schema.String },
  ChangedFlag: { flag: Schema.Boolean },
  Swapped: { input: Schema.String, mode: Schema.String },
})
type Message = typeof Message.Type

const update = (model: Model, message: Message) =>
  Message.match<{ model: Model }>(message, {
    ChangedInput: ({ input }) => ({ model: { ...model, input } }),
    ChangedMode: ({ mode }) => ({ model: { ...model, mode } }),
    ChangedFlag: ({ flag }) => ({ model: { ...model, flag } }),
    Swapped: ({ input, mode }) => ({ model: { ...model, input, mode } }),
  })

export type Ctx = Readonly<{
  model: Model
  h: HtmlBuilder<Message>
  example: string
  onInput: (input: string) => Message
  onMode: (mode: string) => Message
  onFlag: (flag: boolean) => Message
  onSwap: (input: string, mode: string) => Message
}>

type LabSpec = Readonly<{
  meta: ToolMeta
  mode?: string
  example: string
  view: (ctx: Ctx) => Html
}>

export const defineLab = (spec: LabSpec) =>
  defineTool({
    meta: spec.meta,
    init: (): Model => ({ input: spec.example, mode: spec.mode ?? '', flag: false }),
    update,
    view: Submodel.defineView<Model, Message>((model, h) =>
      spec.view({
        model,
        h,
        example: spec.example,
        onInput: (input) => Message.ChangedInput({ input }),
        onMode: (mode) => Message.ChangedMode({ mode }),
        onFlag: (flag) => Message.ChangedFlag({ flag }),
        onSwap: (input, mode) => Message.Swapped({ input, mode }),
      }),
    ),
  })

/** Runs `compute`; a thrown `Error` becomes the message to show. */
export const attempt = (compute: () => string): Readonly<{ value: string; error: string }> => {
  try {
    return { value: compute(), error: '' }
  } catch (error) {
    return {
      value: '',
      error: error instanceof Error ? error.message : 'Could not process this input.',
    }
  }
}

const errorCls = css({
  margin: 0,
  color: 'var(--danger)',
  fontSize: '0.85rem',
  fontFamily: 'var(--mono)',
})
const footCls = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '0.75rem',
  flexWrap: 'wrap',
})
const countCls = css({
  fontFamily: 'var(--mono)',
  fontSize: '0.72rem',
  color: 'var(--muted-foreground)',
  '& b': { color: 'var(--foreground)', fontWeight: 600 },
})
const stackCls = css({ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' })
const barCls = css({ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', alignItems: 'center' })

export const errorLine = (h: HtmlBuilder<Message>, error: string): Html =>
  error === '' ? null : h.p([h.Role('alert'), h.Class(errorCls)], [error])

/** The tool's controls row, then its panels, in one column. */
export const layout = (
  h: HtmlBuilder<Message>,
  controls: ReadonlyArray<Html>,
  children: ReadonlyArray<Html>,
): Html =>
  h.div(
    [h.Class(stackCls)],
    [controls.length === 0 ? null : h.div([h.Class(barCls)], controls), ...children],
  )

const foot = (ctx: Ctx, extra: ReadonlyArray<Html> = []): Html => {
  const { h, model } = ctx
  const words = model.input.split(/\s+/u).filter((word) => word !== '').length
  return h.div(
    [h.Class(footCls)],
    [
      h.span(
        [h.Class(countCls)],
        [
          h.b([], [String([...model.input].length)]),
          ' chars · ',
          h.b([], [String(words)]),
          ' words',
        ],
      ),
      h.div(
        [h.Class(row)],
        [
          ...extra,
          model.input === ctx.example
            ? null
            : button(
                h,
                { variant: 'ghost', size: 'sm' },
                [h.OnClick(ctx.onInput(ctx.example))],
                ['Example'],
              ),
          button(
            h,
            { variant: 'ghost', size: 'sm' },
            [h.Disabled(model.input === ''), h.OnClick(ctx.onInput(''))],
            ['Clear'],
          ),
        ],
      ),
    ],
  )
}

/** A text box with counts and Example and Clear buttons. */
export const inputPanel = (
  ctx: Ctx,
  props: Readonly<{ label: string; placeholder: string; rows?: number }>,
): Html =>
  panel(ctx.h, null, [
    field(
      ctx.h,
      { label: props.label, for: 'lab-input' },
      textArea(ctx.h, {
        id: 'lab-input',
        value: ctx.model.input,
        placeholder: props.placeholder,
        rows: props.rows ?? 8,
        onInput: ctx.onInput,
      }),
    ),
    foot(ctx),
  ])

/** Input and output side by side. `extra` goes under the output. */
export const ioPanels = (
  ctx: Ctx,
  props: Readonly<{
    inputLabel: string
    outputLabel: string
    placeholder: string
    rows?: number
    result: Readonly<{ value: string; error: string }>
  }>,
): Html =>
  columns(ctx.h, [
    inputPanel(ctx, {
      label: props.inputLabel,
      placeholder: props.placeholder,
      ...(props.rows === undefined ? {} : { rows: props.rows }),
    }),
    panel(ctx.h, null, [
      field(
        ctx.h,
        { label: props.outputLabel, for: 'lab-output' },
        output(ctx.h, { label: props.outputLabel, value: props.result.value }),
      ),
      errorLine(ctx.h, props.result.error),
    ]),
  ])

/** Two modes plus a button that turns the output into the input of the other mode. */
export const directionBar = (
  ctx: Ctx,
  props: Readonly<{
    options: ReadonlyArray<Readonly<{ value: string; label: string }>>
    swapTo: Readonly<{ input: string; mode: string }> | null
  }>,
): Html =>
  ctx.h.div(
    [ctx.h.Class(row)],
    [
      segmented(ctx.h, {
        label: 'Direction',
        value: ctx.model.mode,
        options: props.options,
        onSelect: ctx.onMode,
      }),
      button(
        ctx.h,
        { variant: 'secondary', size: 'sm' },
        [
          ctx.h.Disabled(props.swapTo === null),
          ctx.h.AriaLabel('Swap input and output'),
          ctx.h.OnClick(
            props.swapTo === null
              ? ctx.onMode(ctx.model.mode)
              : ctx.onSwap(props.swapTo.input, props.swapTo.mode),
          ),
        ],
        ['⇄ Swap'],
      ),
    ],
  )

/** Two one-line fields stored as the two lines the tool's `run` reads. */
export const pairOf = (input: string): readonly [string, string] => {
  const [first = '', second = ''] = input.split('\n')
  return [first, second.replace(/\r$/u, '')]
}

export const pairPanel = (
  ctx: Ctx,
  props: Readonly<{ labels: readonly [string, string]; placeholders: readonly [string, string] }>,
): Html => {
  const [first, second] = pairOf(ctx.model.input)
  const join = (a: string, b: string): string => (a === '' && b === '' ? '' : `${a}\n${b}`)
  return panel(ctx.h, null, [
    columns(ctx.h, [
      field(
        ctx.h,
        { label: props.labels[0], for: 'lab-a' },
        textInput(ctx.h, {
          id: 'lab-a',
          value: first,
          placeholder: props.placeholders[0],
          onInput: (value) => ctx.onInput(join(value, second)),
        }),
      ),
      field(
        ctx.h,
        { label: props.labels[1], for: 'lab-b' },
        textInput(ctx.h, {
          id: 'lab-b',
          value: second,
          placeholder: props.placeholders[1],
          onInput: (value) => ctx.onInput(join(first, value)),
        }),
      ),
    ]),
    ctx.h.div(
      [ctx.h.Class(row)],
      [
        ctx.model.input === ctx.example
          ? null
          : button(
              ctx.h,
              { variant: 'ghost', size: 'sm' },
              [ctx.h.OnClick(ctx.onInput(ctx.example))],
              ['Example'],
            ),
        button(
          ctx.h,
          { variant: 'ghost', size: 'sm' },
          [ctx.h.Disabled(ctx.model.input === ''), ctx.h.OnClick(ctx.onInput(''))],
          ['Clear'],
        ),
        button(
          ctx.h,
          { variant: 'ghost', size: 'sm' },
          [
            ctx.h.Disabled(first === '' && second === ''),
            ctx.h.OnClick(ctx.onInput(join(second, first))),
          ],
          ['⇄ Swap'],
        ),
      ],
    ),
  ])
}

export type TileState = 'plain' | 'on' | 'same' | 'diff' | 'dim'

const tileCls = css({
  display: 'inline-flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.1rem',
  minWidth: '2.1rem',
  padding: '0.35rem 0.3rem',
  borderRadius: '8px',
  background: 'var(--muted)',
  fontFamily: 'var(--mono)',
  fontSize: '1rem',
  lineHeight: 1.2,
  textAlign: 'center',
  transition: 'background 150ms, color 150ms',
  '& small': { fontSize: '0.62rem', color: 'var(--muted-foreground)' },
  '&[data-state="on"]': {
    background: 'color-mix(in oklab, var(--primary) 16%, var(--muted))',
    boxShadow: 'inset 0 0 0 1.5px var(--primary)',
  },
  '&[data-state="same"]': { background: 'var(--ok-soft)', color: 'var(--ok)' },
  '&[data-state="diff"]': { background: 'var(--danger-soft)', color: 'var(--danger)' },
  '&[data-state="dim"]': { opacity: 0.45 },
})
const stripCls = css({ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' })
const groupsCls = css({ display: 'flex', flexWrap: 'wrap', gap: '0.9rem 1.4rem' })

/** One column: `top` over `bottom`, tinted by `state`. `join` is the small glyph between them. */
export const tile = (
  h: HtmlBuilder<Message>,
  props: Readonly<{
    top: string | Html
    bottom: string | Html
    state?: TileState
    join?: string
    label?: string
  }>,
): Html =>
  h.div(
    [
      h.Class(tileCls),
      h.Attribute('data-state', props.state ?? 'plain'),
      ...(props.label === undefined ? [] : [h.AriaLabel(props.label)]),
    ],
    [
      h.span([], [props.top]),
      props.join === undefined ? null : h.small([], [props.join]),
      h.span([], [props.bottom]),
    ],
  )

export const tileStrip = (h: HtmlBuilder<Message>, tiles: ReadonlyArray<Html>): Html =>
  h.div([h.Class(stripCls)], tiles)

/** Tiles grouped by word, with a wider gap between words. */
export const wordGroups = (
  h: HtmlBuilder<Message>,
  groups: ReadonlyArray<ReadonlyArray<Html>>,
): Html =>
  h.div(
    [h.Class(groupsCls)],
    groups.map((group) => tileStrip(h, group)),
  )

const bannerCls = css({
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
  padding: '1.1rem 1.3rem',
  borderRadius: 'calc(var(--radius) * 1.4)',
  background: 'var(--card)',
  boxShadow: 'var(--elev-card)',
  borderLeft: '6px solid var(--danger)',
  '&[data-yes]': { borderLeftColor: 'var(--ok)' },
  '& i': { fontStyle: 'normal', fontSize: '2rem', lineHeight: 1 },
  '& b': { display: 'block', fontSize: '1.2rem' },
  '& span': { fontSize: '0.85rem', color: 'var(--muted-foreground)' },
})

/** A yes or no answer with one line of detail. */
export const banner = (
  h: HtmlBuilder<Message>,
  props: Readonly<{ yes: boolean; title: string; detail: string }>,
): Html =>
  h.div(
    [h.Class(bannerCls), h.Role('status'), ...(props.yes ? [h.Attribute('data-yes', '')] : [])],
    [
      h.i([], [props.yes ? '✓' : '✗']),
      h.div([], [h.b([], [props.title]), props.detail === '' ? null : h.span([], [props.detail])]),
    ],
  )

const galleryCls = css({
  display: 'grid',
  gap: '0.6rem',
  gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 16rem), 1fr))',
})
const cardCls = css({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.3rem',
  padding: '0.7rem 3rem 0.8rem 0.9rem',
  minWidth: 0,
  borderRadius: 'var(--radius)',
  background: 'var(--card)',
  boxShadow: 'var(--elev-raised)',
  '& small': {
    fontFamily: 'var(--mono)',
    fontSize: '0.66rem',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: 'var(--muted-foreground)',
  },
  '& p': {
    margin: 0,
    fontSize: '1.25rem',
    lineHeight: 1.35,
    overflowWrap: 'anywhere',
    whiteSpace: 'pre-wrap',
  },
  '&[data-empty] p': { opacity: 0.4 },
  '& [data-slot="copy-button"]': { position: 'absolute', top: '0.5rem', right: '0.5rem' },
})

/** One card per style, each with its own copy button. */
export const gallery = (
  h: HtmlBuilder<Message>,
  items: ReadonlyArray<Readonly<{ label: string; text: string }>>,
  empty: boolean,
): Html =>
  h.div(
    [h.Class(galleryCls)],
    items.map((item) =>
      h.div(
        [h.Class(cardCls), ...(empty ? [h.Attribute('data-empty', '')] : [])],
        [
          h.small([], [item.label]),
          h.p([], [item.text]),
          empty ? null : Elements.copyButton(h, false, h.Attribute('data-copy', item.text)),
        ],
      ),
    ),
  )

const bitsCls = css({
  display: 'inline-flex',
  gap: '2px',
  '& i': {
    display: 'block',
    width: '0.55rem',
    height: '0.55rem',
    borderRadius: '2px',
    boxShadow: 'inset 0 0 0 1px color-mix(in oklab, var(--foreground) 35%, transparent)',
  },
  '& i[data-on]': { background: 'var(--primary)', boxShadow: 'none' },
})
const bytesCls = css({ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' })
const MAX_CHARS = 200

/**
 * Each character of `text` over the bytes it takes in UTF-8, written in `base`. Binary
 * bytes also show as eight squares, filled for 1.
 */
export const byteBreakdown = (h: HtmlBuilder<Message>, text: string, base: 2 | 16): Html => {
  const chars = Array.from(text)
  const shown = chars.slice(0, MAX_CHARS)
  const encoder = new TextEncoder()
  return h.div(
    [h.Class(stackCls)],
    [
      tileStrip(
        h,
        shown.map((char) => {
          const bytes = [...encoder.encode(char)]
          return tile(h, {
            top: char === ' ' ? '␠' : char === '\n' ? '↵' : char,
            ...(bytes.length > 1 ? { join: `${bytes.length} bytes` } : {}),
            bottom: h.div(
              [h.Class(bytesCls)],
              bytes.map((byte) =>
                base === 2
                  ? h.span(
                      [h.Class(bitsCls), h.AriaLabel(byte.toString(2).padStart(8, '0'))],
                      [...byte.toString(2).padStart(8, '0')].map((bit) =>
                        h.i(bit === '1' ? [h.Attribute('data-on', '')] : [], []),
                      ),
                    )
                  : h.span([], [byte.toString(16).padStart(2, '0')]),
              ),
            ),
          })
        }),
      ),
      chars.length > MAX_CHARS
        ? h.p([h.Class(countCls)], [`Showing the first ${MAX_CHARS} characters.`])
        : null,
    ],
  )
}

const bigCls = css({
  position: 'relative',
  padding: '1.2rem 3rem 1.2rem 1.2rem',
  minHeight: '4rem',
  borderRadius: 'var(--radius)',
  background: 'var(--well)',
  boxShadow: 'var(--elev-well)',
  fontSize: 'clamp(1.4rem, 3vw, 2.2rem)',
  lineHeight: 1.35,
  overflowWrap: 'anywhere',
  whiteSpace: 'pre-wrap',
  '& [data-slot="copy-button"]': { position: 'absolute', top: '0.5rem', right: '0.5rem' },
})

/** The result in large type with a copy button, in a titled panel. */
export const resultPanel = (
  h: HtmlBuilder<Message>,
  value: string,
  error: string,
  title = 'Result',
): Html =>
  panel(h, title, [
    h.div(
      [h.Class(bigCls), h.Tabindex(0), h.AriaLabel(title)],
      [value, value === '' ? null : Elements.copyButton(h, false, h.Attribute('data-copy', value))],
    ),
    errorLine(h, error),
  ])
