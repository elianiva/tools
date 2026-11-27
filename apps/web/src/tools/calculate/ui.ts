// Shared pieces of the calculators: a form-plus-visual tool builder, SVG drawing helpers,
// a plot, a month grid, and the date maths the date tools share.
import { Elements } from '@tools/ui'
import { Effect, Schema } from 'effect'
import { Command, File, Submodel } from 'foldkit'
import type { Attribute, Html, HtmlBuilder } from 'foldkit/html'
import { defineMessageUnion } from 'foldkit/message'
import { css } from '../../../styled-system/css'
import { parseFacts } from '../facts.ts'
import { button, field, meter, panel, segmented, stats, textArea, textInput } from '../kit.ts'
import { defineTool, type ToolMeta } from '../tool.ts'

type Children = ReadonlyArray<Html | string>

/* ---------------------------------- numbers ---------------------------------- */

/** A number as short text: at most `digits` decimals, no trailing zeros, no `-0`. */
export const fmt = (value: number, digits = 2): string => String(Number(value.toFixed(digits)) + 0)

export const num = (text: string | undefined): number => Number((text ?? '').trim())

/** The value after `label:` in the text a tool's `run` returns. */
export const fact = (out: string, label: string): string =>
  parseFacts(out).facts.find(([name]) => name === label)?.[1] ?? ''

/* ------------------------------------ dates ------------------------------------ */

export const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const
export const WEEKDAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const

export const utc = (year: number, month0: number, day: number): Date => {
  const date = new Date(0)
  date.setUTCFullYear(year, month0, day)
  return date
}
export const daysIn = (year: number, month0: number): number =>
  utc(year, month0 + 1, 0).getUTCDate()
export const isLeap = (year: number): boolean =>
  (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0

export type Ymd = readonly [number, number, number]

export const parseIso = (text: string): Ymd | null => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/u.exec(text.trim())
  return match === null ? null : [Number(match[1]), Number(match[2]), Number(match[3])]
}

export const dayNumber = ([year, month, day]: Ymd): number =>
  Math.round(utc(year, month - 1, day).getTime() / 86_400_000)

/** Whole years, months, and days from `from` to `to`, where `from` is not after `to`. */
export const elapsed = (
  from: Ymd,
  to: Ymd,
): Readonly<{ years: number; months: number; days: number }> => {
  let years = to[0] - from[0]
  let months = to[1] - from[1]
  let days = to[2] - from[2]
  let year = to[0]
  let month = to[1]
  while (days < 0) {
    month -= 1
    if (month === 0) {
      month = 12
      year -= 1
    }
    days += daysIn(year, month - 1)
    months -= 1
  }
  if (months < 0) {
    years -= 1
    months += 12
  }
  return { years, months, days }
}

const plural = (count: number, unit: string): string => `${count} ${unit}${count === 1 ? '' : 's'}`

/** `3 years, 2 months, 5 days`, leaving out the parts that are zero. */
export const spoken = (span: ReturnType<typeof elapsed>): string => {
  const parts = [
    span.years > 0 ? plural(span.years, 'year') : '',
    span.months > 0 ? plural(span.months, 'month') : '',
    span.days > 0 ? plural(span.days, 'day') : '',
  ].filter((part) => part !== '')
  return parts.length === 0 ? '0 days' : parts.join(', ')
}

/* ------------------------------------ styles ----------------------------------- */

const layoutCls = css({
  display: 'grid',
  gap: '1rem',
  gridTemplateColumns: 'minmax(0, 1fr)',
  alignItems: 'start',
  '@media (min-width: 56rem)': { gridTemplateColumns: 'minmax(15rem, 20rem) minmax(0, 1fr)' },
})
const columnCls = css({ display: 'flex', flexDirection: 'column', gap: '1rem', minWidth: 0 })
const inputWrapCls = css({
  position: 'relative',
  '& input': { width: '100%', paddingRight: '3.4rem', fontFamily: 'var(--mono)' },
  '& textarea': { width: '100%', fontFamily: 'var(--mono)' },
})
const suffixCls = css({
  position: 'absolute',
  right: '0.8rem',
  top: '50%',
  transform: 'translateY(-50%)',
  fontFamily: 'var(--mono)',
  fontSize: '0.72rem',
  color: 'var(--muted-foreground)',
  pointerEvents: 'none',
})
const errorCls = css({ margin: 0, color: 'var(--danger)', fontSize: '0.85rem' })
const heroCls = css({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.3rem',
  padding: '1.1rem 3.2rem 1.2rem 1.3rem',
  borderRadius: 'calc(var(--radius) * 1.4)',
  background: 'linear-gradient(135deg, var(--tone-soft), transparent 70%), var(--card)',
  boxShadow: 'var(--elev-card)',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    insetBlock: 0,
    insetInlineStart: 0,
    width: '4px',
    background: 'var(--tone)',
  },
  '& [data-slot="copy-button"]': { position: 'absolute', top: '0.6rem', right: '0.6rem' },
})
const heroLabelCls = css({
  fontFamily: 'var(--mono)',
  fontSize: '0.68rem',
  fontWeight: 500,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: 'var(--muted-foreground)',
})
const heroValueCls = css({
  fontFamily: 'var(--mono)',
  fontSize: 'clamp(1.6rem, 4.5vw, 2.6rem)',
  fontWeight: 500,
  letterSpacing: '-0.03em',
  lineHeight: 1.15,
  fontVariantNumeric: 'tabular-nums',
  color: 'var(--tone-ink)',
  overflowWrap: 'anywhere',
})
const heroSubCls = css({
  fontFamily: 'var(--mono)',
  fontSize: '0.85rem',
  color: 'var(--muted-foreground)',
})
const svgCls = css({
  display: 'block',
  width: '100%',
  maxHeight: '20rem',
  '& .ink': { fill: 'none', stroke: 'var(--foreground)', strokeWidth: 1.5 },
  '& .axis': { stroke: 'color-mix(in oklab, var(--foreground) 28%, transparent)', strokeWidth: 1 },
  '& .grid': { stroke: 'color-mix(in oklab, var(--foreground) 8%, transparent)', strokeWidth: 1 },
  '& .shape': {
    fill: 'var(--tone-soft)',
    stroke: 'var(--tone)',
    strokeWidth: 2,
    strokeLinejoin: 'round',
  },
  '& .accent': {
    fill: 'none',
    stroke: 'var(--tone)',
    strokeWidth: 2.5,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  },
  '& .dash': {
    fill: 'none',
    stroke: 'var(--muted-foreground)',
    strokeWidth: 1.25,
    strokeDasharray: '4 4',
  },
  '& .dot': { fill: 'var(--tone)', stroke: 'var(--card)', strokeWidth: 2 },
  '& .fill': { fill: 'var(--tone)' },
  '& .soft': { fill: 'var(--tone-soft)' },
  '& .well': { fill: 'var(--well)' },
  '& .lbl': { fill: 'var(--muted-foreground)', fontFamily: 'var(--mono)', fontSize: '11px' },
  '& .val': {
    fill: 'var(--foreground)',
    fontFamily: 'var(--mono)',
    fontSize: '12px',
    fontWeight: 600,
  },
  '& .mid': { textAnchor: 'middle' },
  '& .end': { textAnchor: 'end' },
})
const stageCls = css({
  padding: '0.6rem',
  borderRadius: 'calc(var(--radius) * 1.4)',
  background: 'var(--card)',
  boxShadow: 'var(--elev-card)',
})

/** A chip: one value in a row of values. */
export const chipRowCls = css({ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' })
export const chipCls = css({
  display: 'inline-flex',
  alignItems: 'baseline',
  gap: '0.3rem',
  padding: '0.3rem 0.65rem',
  borderRadius: '8px',
  background: 'linear-gradient(var(--raised-top), var(--raised-bottom))',
  boxShadow: 'var(--elev-raised)',
  fontFamily: 'var(--mono)',
  fontSize: '0.95rem',
  fontVariantNumeric: 'tabular-nums',
  '& sup, & small': { fontSize: '0.65rem', color: 'var(--muted-foreground)' },
  '&[data-on]': { background: 'var(--tone)', color: 'white', boxShadow: 'none' },
})

/* ------------------------------------- views ----------------------------------- */

/** The answer, big, with a copy button. */
export const hero = <M>(
  h: HtmlBuilder<M>,
  props: Readonly<{ label: string; value: string; sub?: string; copy?: string }>,
): Html =>
  h.div(
    [h.Class(heroCls)],
    [
      h.span([h.Class(heroLabelCls)], [props.label]),
      h.span([h.Class(heroValueCls)], [props.value]),
      props.sub === undefined ? null : h.span([h.Class(heroSubCls)], [props.sub]),
      Elements.copyButton(h, false, h.Attribute('data-copy', props.copy ?? props.value)),
    ],
  )

export const tiles = <M>(
  h: HtmlBuilder<M>,
  items: ReadonlyArray<readonly [string, string]>,
): Html => stats(h, items)

export const column = <M>(h: HtmlBuilder<M>, children: Children): Html =>
  h.div([h.Class(columnCls)], children)

/** A figure's frame. */
export const stage = <M>(h: HtmlBuilder<M>, children: Children): Html =>
  h.div([h.Class(stageCls)], children)

/** A titled card, for secondary results. */
export const card = <M>(h: HtmlBuilder<M>, title: string, children: Children): Html =>
  panel(h, title, children)

/** Labelled bars that fill toward a limit. */
export const bars = <M>(
  h: HtmlBuilder<M>,
  rows: ReadonlyArray<Readonly<{ label: string; value: number; limit: number; display: string }>>,
): Html =>
  h.div(
    [h.Class(columnCls)],
    rows.map((row) => meter(h, row)),
  )

type Attrs = Readonly<Record<string, string | number>>

const attrsOf = <M>(h: HtmlBuilder<M>, given: Attrs): ReadonlyArray<Attribute<M>> =>
  Object.entries(given).map(([key, value]) =>
    key === 'class' ? h.Class(String(value)) : h.Attribute(key, String(value)),
  )

type Tag = 'g' | 'line' | 'circle' | 'ellipse' | 'path' | 'rect' | 'polygon' | 'polyline' | 'text'

/** The SVG elements a figure is drawn with. Attributes are plain records. */
export const draw = <M>(h: HtmlBuilder<M>) => {
  const make =
    (tag: Tag) =>
    (given: Attrs, children: Children = []): Html =>
      h[tag](attrsOf(h, given), children)
  return {
    g: make('g'),
    line: make('line'),
    circle: make('circle'),
    ellipse: make('ellipse'),
    path: make('path'),
    rect: make('rect'),
    polygon: make('polygon'),
    polyline: make('polyline'),
    text: (given: Attrs, content: string): Html => make('text')(given, [content]),
  }
}

/** An SVG figure. `width` and `height` set the drawing's coordinate space. */
export const figure = <M>(
  h: HtmlBuilder<M>,
  props: Readonly<{ width: number; height: number; label: string }>,
  children: Children,
): Html =>
  stage(h, [
    h.svg(
      [
        h.Class(svgCls),
        h.Attribute('viewBox', `0 0 ${props.width} ${props.height}`),
        h.Role('img'),
        h.AriaLabel(props.label),
      ],
      children,
    ),
  ])

const niceStep = (span: number): number => {
  const raw = span / 5
  const power = 10 ** Math.floor(Math.log10(raw))
  const unit = raw / power
  return (unit < 1.5 ? 1 : unit < 3.5 ? 2 : unit < 7.5 ? 5 : 10) * power
}

type PlotSpec = Readonly<{
  x: readonly [number, number]
  y: readonly [number, number]
  label: string
  fns?: ReadonlyArray<(x: number) => number>
  points?: ReadonlyArray<Readonly<{ x: number; y: number; label?: string }>>
  segments?: ReadonlyArray<
    Readonly<{ from: readonly [number, number]; to: readonly [number, number] }>
  >
}>

/** A graph with a grid, axes, curves, dashed segments and labelled points. */
export const plot = <M>(h: HtmlBuilder<M>, spec: PlotSpec): Html => {
  const [width, height, pad] = [360, 260, 30]
  const [x0, x1] = spec.x
  const [y0, y1] = spec.y
  const sx = (x: number): number => pad + ((x - x0) / (x1 - x0)) * (width - 2 * pad)
  const sy = (y: number): number => height - pad - ((y - y0) / (y1 - y0)) * (height - 2 * pad)
  const d = draw(h)
  const lines = (lo: number, hi: number, along: (v: number) => Html): ReadonlyArray<Html> => {
    const step = niceStep(hi - lo)
    const out: Array<Html> = []
    for (let v = Math.ceil(lo / step) * step; v <= hi + 1e-9; v += step) out.push(along(v))
    return out
  }
  const clamp = (y: number): number => Math.max(y0 - (y1 - y0), Math.min(y1 + (y1 - y0), y))
  const curves = (spec.fns ?? []).map((fn) => {
    const steps = 160
    let pen = 'M'
    let path = ''
    for (let i = 0; i <= steps; i += 1) {
      const x = x0 + ((x1 - x0) * i) / steps
      const y = fn(x)
      if (Number.isFinite(y)) {
        path += `${pen}${fmt(sx(x), 1)} ${fmt(sy(clamp(y)), 1)}`
        pen = 'L'
      } else pen = 'M'
    }
    return d.path({ class: 'accent', d: path })
  })
  return figure(h, { width, height, label: spec.label }, [
    ...lines(x0, x1, (v) =>
      d.line({ class: 'grid', x1: sx(v), x2: sx(v), y1: pad, y2: height - pad }),
    ),
    ...lines(y0, y1, (v) =>
      d.line({ class: 'grid', x1: pad, x2: width - pad, y1: sy(v), y2: sy(v) }),
    ),
    ...lines(x0, x1, (v) => d.text({ class: 'lbl mid', x: sx(v), y: height - 12 }, fmt(v))),
    ...lines(y0, y1, (v) => d.text({ class: 'lbl end', x: pad - 5, y: sy(v) + 4 }, fmt(v))),
    x0 < 0 && x1 > 0
      ? d.line({ class: 'axis', x1: sx(0), x2: sx(0), y1: pad, y2: height - pad })
      : null,
    y0 < 0 && y1 > 0
      ? d.line({ class: 'axis', x1: pad, x2: width - pad, y1: sy(0), y2: sy(0) })
      : null,
    ...(spec.segments ?? []).map((segment) =>
      d.line({
        class: 'dash',
        x1: sx(segment.from[0]),
        y1: sy(segment.from[1]),
        x2: sx(segment.to[0]),
        y2: sy(segment.to[1]),
      }),
    ),
    ...curves,
    ...(spec.points ?? []).flatMap((point) => [
      d.circle({ class: 'dot', cx: sx(point.x), cy: sy(point.y), r: 5 }),
      point.label === undefined
        ? null
        : d.text(
            {
              class: `val${sx(point.x) > width - 90 ? ' end' : ''}`,
              x: sx(point.x) + (sx(point.x) > width - 90 ? -9 : 9),
              y: sy(point.y) - 9,
            },
            point.label,
          ),
    ]),
  ])
}

const calendarCls = css({
  display: 'grid',
  gridTemplateColumns: 'repeat(7, 1fr)',
  gap: '2px',
  textAlign: 'center',
  fontFamily: 'var(--mono)',
  fontSize: '0.8rem',
  fontVariantNumeric: 'tabular-nums',
  '& span': { padding: '0.35rem 0', borderRadius: '6px' },
  '& [data-head]': { color: 'var(--muted-foreground)', fontSize: '0.68rem' },
  '& [data-on]': { background: 'var(--tone)', color: 'white', fontWeight: 600 },
  '& [data-edge]': { outline: '1px solid var(--tone)', outlineOffset: '-1px' },
})
const calendarTitleCls = css({ fontWeight: 600, fontSize: '0.95rem' })

/** One month as a calendar. `marked` is the day to highlight, `edge` a day to outline. */
export const monthGrid = <M>(
  h: HtmlBuilder<M>,
  props: Readonly<{ year: number; month0: number; marked?: number; edge?: number }>,
): Html => {
  const lead = utc(props.year, props.month0, 1).getUTCDay()
  const count = daysIn(props.year, props.month0)
  return h.div(
    [],
    [
      h.p([h.Class(calendarTitleCls)], [`${MONTHS[props.month0] ?? ''} ${props.year}`]),
      h.div(
        [h.Class(calendarCls)],
        [
          ...['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((name) =>
            h.span([h.Attribute('data-head', '')], [name]),
          ),
          ...Array.from({ length: lead }, () => h.span([], [])),
          ...Array.from({ length: count }, (_, i) =>
            h.span(
              [
                ...(props.marked === i + 1 ? [h.Attribute('data-on', '')] : []),
                ...(props.edge === i + 1 ? [h.Attribute('data-edge', '')] : []),
              ],
              [String(i + 1)],
            ),
          ),
        ],
      ),
    ],
  )
}

const dateCardCls = css({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  minWidth: '6.5rem',
  overflow: 'hidden',
  borderRadius: 'var(--radius)',
  background: 'var(--card)',
  boxShadow: 'var(--elev-raised)',
  textAlign: 'center',
  '& b': {
    alignSelf: 'stretch',
    padding: '0.2rem 0.5rem',
    background: 'var(--tone)',
    color: 'white',
    fontSize: '0.7rem',
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
  '& strong': { fontFamily: 'var(--mono)', fontSize: '2rem', lineHeight: 1.2, fontWeight: 500 },
  '& small': { padding: '0 0.5rem 0.5rem', color: 'var(--muted-foreground)', fontSize: '0.75rem' },
})

/** A date drawn as a tear-off calendar page. */
export const dateCard = <M>(h: HtmlBuilder<M>, date: Ymd, caption?: string): Html => {
  const [year, month, day] = date
  return h.div(
    [h.Class(dateCardCls)],
    [
      h.b([], [(MONTHS[month - 1] ?? '').slice(0, 3)]),
      h.strong([], [String(day)]),
      h.small(
        [],
        [
          `${caption ?? (WEEKDAYS[utc(year, month - 1, day).getUTCDay()] ?? '').slice(0, 3)} ${year}`,
        ],
      ),
    ],
  )
}

/* ---------------------------------- the builder -------------------------------- */

export type Field = Readonly<{
  label: string
  /** The starting value, so the tool shows an answer on load. */
  value: string
  kind?: 'number' | 'date' | 'time' | 'text' | 'area'
  suffix?: string
  placeholder?: string
}>

export type Mode = Readonly<{
  id: string
  label: string
  /** Fields for this mode, with their own starting values. */
  fields?: ReadonlyArray<Field>
}>

export type Ctx = Readonly<{ values: ReadonlyArray<string>; mode: string; out: string }>

type CalcSpec = Readonly<{
  meta: Omit<ToolMeta, 'accepts'>
  /** The tool's existing pure function. It gets the field values joined by spaces. */
  run: (text: string, mode: string) => string
  fields?: ReadonlyArray<Field>
  modes?: ReadonlyArray<Mode>
  /** Builds the text `run` reads when a space-joined list does not fit. */
  compose?: (values: ReadonlyArray<string>, mode: string) => string
  /** A dropped text file fills the first field. */
  acceptsFiles?: boolean
  /** The answer, drawn from the values and what `run` returned. */
  view: <M>(h: HtmlBuilder<M>, ctx: Ctx) => Html
}>

const Model = Schema.Struct({ mode: Schema.String, values: Schema.Array(Schema.String) })
type Model = typeof Model.Type

const Message = defineMessageUnion({
  ChangedField: { index: Schema.Finite, value: Schema.String },
  ChangedMode: { mode: Schema.String },
  DroppedFiles: { files: Schema.Array(File.File) },
  LoadedText: { input: Schema.String },
  FailedLoad: {},
})
type Message = typeof Message.Type

const LoadText = Command.define('LoadText', {
  args: { file: File.File },
  messages: [Message.LoadedText, Message.FailedLoad],
  execute: ({ file }) =>
    File.readAsText(file).pipe(
      Effect.map((input) => Message.LoadedText({ input })),
      Effect.orElseSucceed(() => Message.FailedLoad()),
    ),
})

/** A calculator with labelled inputs on one side and a drawn answer on the other. */
export const defineCalc = (spec: CalcSpec) => {
  const id = spec.meta.id
  const fieldsOf = (mode: string): ReadonlyArray<Field> =>
    spec.modes?.find((item) => item.id === mode)?.fields ?? spec.fields ?? []
  const startOf = (mode: string): ReadonlyArray<string> => fieldsOf(mode).map((item) => item.value)

  const update = (model: Model, message: Message) =>
    Message.match<{ model: Model; commands?: ReadonlyArray<Command.Command<Message>> }>(message, {
      ChangedField: ({ index, value }) => ({
        model: {
          ...model,
          values: model.values.map((current, at) => (at === index ? value : current)),
        },
      }),
      ChangedMode: ({ mode }) => ({
        model: {
          mode,
          values:
            spec.modes?.find((item) => item.id === mode)?.fields === undefined
              ? model.values
              : startOf(mode),
        },
      }),
      DroppedFiles: ({ files }) => {
        const first = files[0]
        return first === undefined ? { model } : { model, commands: [LoadText({ file: first })] }
      },
      LoadedText: ({ input }) => ({
        model: {
          ...model,
          values: model.values.map((current, at) => (at === 0 ? input : current)),
        },
      }),
      FailedLoad: () => ({ model }),
    })

  const attempt = (model: Model, count: number): Readonly<{ out: string; error: string }> => {
    const values = model.values.slice(0, count)
    if (values.some((value) => value.trim() === '')) return { out: '', error: '' }
    try {
      const text =
        spec.compose === undefined
          ? values.map((value) => value.trim()).join(' ')
          : spec.compose(values, model.mode)
      return { out: spec.run(text, model.mode), error: '' }
    } catch (error) {
      return {
        out: '',
        error: error instanceof Error ? error.message : 'Could not process this input.',
      }
    }
  }

  const view = Submodel.defineView<Model, Message>((model, h) => {
    const fields = fieldsOf(model.mode)
    const result = attempt(model, fields.length)
    const control = (item: Field, index: number): Html => {
      const fieldId = `${id}-field-${index}`
      const value = model.values[index] ?? ''
      const onInput = (next: string): Message => Message.ChangedField({ index, value: next })
      return field(
        h,
        { label: item.label, for: fieldId },
        item.kind === 'area'
          ? h.div(
              [h.Class(inputWrapCls)],
              [
                textArea(h, {
                  id: fieldId,
                  value,
                  rows: 8,
                  ...(item.placeholder === undefined ? {} : { placeholder: item.placeholder }),
                  onInput,
                }),
              ],
            )
          : h.div(
              [h.Class(inputWrapCls)],
              [
                textInput(h, {
                  id: fieldId,
                  value,
                  type: item.kind ?? 'number',
                  ...(item.placeholder === undefined ? {} : { placeholder: item.placeholder }),
                  onInput,
                }),
                item.suffix === undefined ? null : h.span([h.Class(suffixCls)], [item.suffix]),
              ],
            ),
      )
    }
    return h.div(
      [h.Class(columnCls)],
      [
        spec.modes !== undefined && spec.modes.length > 1
          ? h.div(
              [],
              [
                segmented(h, {
                  label: 'Mode',
                  value: model.mode,
                  options: spec.modes.map((mode) => ({ value: mode.id, label: mode.label })),
                  onSelect: (mode) => Message.ChangedMode({ mode }),
                }),
              ],
            )
          : null,
        h.div(
          [h.Class(layoutCls)],
          [
            panel(h, null, [
              ...fields.map(control),
              result.error === ''
                ? null
                : h.p([h.Role('alert'), h.Class(errorCls)], [result.error]),
            ]),
            result.out === ''
              ? null
              : h.div(
                  [h.Class(columnCls)],
                  [
                    spec.view(h, {
                      values: model.values.slice(0, fields.length),
                      mode: model.mode,
                      out: result.out,
                    }),
                  ],
                ),
          ],
        ),
      ],
    )
  })

  return defineTool({
    meta: {
      ...spec.meta,
      ...(spec.acceptsFiles === true
        ? { accepts: ['text/*', '.txt', '.json', '.md', '.csv'] }
        : {}),
    },
    init: (): Model => {
      const mode = spec.modes?.[0]?.id ?? ''
      return { mode, values: startOf(mode) }
    },
    update,
    view,
    ...(spec.acceptsFiles === true
      ? { receive: (files: ReadonlyArray<File>) => Message.DroppedFiles({ files }) }
      : {}),
  })
}

/* ----------------------------------- row editor --------------------------------- */

type Column = Readonly<{
  label: string
  suffix?: string
  placeholder?: string
  kind?: 'number' | 'text'
}>

export type RowsCtx = Readonly<{
  /** The rows that are filled in, trimmed. */
  rows: ReadonlyArray<ReadonlyArray<string>>
  mode: string
  out: string
}>

type RowsSpec = Readonly<{
  meta: Omit<ToolMeta, 'accepts'>
  run: (text: string, mode: string) => string
  columns: ReadonlyArray<Column>
  rows: ReadonlyArray<ReadonlyArray<string>>
  addLabel: string
  modes?: ReadonlyArray<Readonly<{ id: string; label: string }>>
  /** The text `run` reads, from the filled rows. */
  compose: (rows: ReadonlyArray<ReadonlyArray<string>>, mode: string) => string
  view: <M>(h: HtmlBuilder<M>, ctx: RowsCtx) => Html
}>

const RowsModel = Schema.Struct({
  mode: Schema.String,
  rows: Schema.Array(Schema.Array(Schema.String)),
})
type RowsModel = typeof RowsModel.Type

const RowsMessage = defineMessageUnion({
  ChangedCell: { row: Schema.Finite, col: Schema.Finite, value: Schema.String },
  ChangedMode: { mode: Schema.String },
  ClickedAdd: {},
  ClickedRemove: { row: Schema.Finite },
})
type RowsMessage = typeof RowsMessage.Type

const rowCls = css({ display: 'flex', alignItems: 'center', gap: '0.5rem' })
const cellCls = css({
  position: 'relative',
  flex: '1 1 0',
  minWidth: 0,
  '& input': { width: '100%', paddingRight: '2.8rem', fontFamily: 'var(--mono)' },
})
const headCls = css({
  display: 'flex',
  gap: '0.5rem',
  fontSize: '0.75rem',
  fontWeight: 550,
  color: 'var(--muted-foreground)',
  '& span': { flex: '1 1 0', minWidth: 0 },
  '& i': { width: '2.2rem' },
})
const gutterCls = css({ width: '2.2rem', flex: 'none', display: 'flex', justifyContent: 'center' })

/** A calculator over a list of rows the reader adds to and removes from. */
export const defineRows = (spec: RowsSpec) => {
  const id = spec.meta.id
  const blank = spec.columns.map(() => '')
  const update = (model: RowsModel, message: RowsMessage) =>
    RowsMessage.match<{ model: RowsModel }>(message, {
      ChangedCell: ({ row, col, value }) => ({
        model: {
          ...model,
          rows: model.rows.map((cells, at) =>
            at === row ? cells.map((cell, index) => (index === col ? value : cell)) : cells,
          ),
        },
      }),
      ChangedMode: ({ mode }) => ({ model: { ...model, mode } }),
      ClickedAdd: () => ({ model: { ...model, rows: [...model.rows, blank] } }),
      ClickedRemove: ({ row }) => ({
        model: { ...model, rows: model.rows.filter((_, at) => at !== row) },
      }),
    })

  const view = Submodel.defineView<RowsModel, RowsMessage>((model, h) => {
    const filled = model.rows
      .map((cells) => cells.map((cell) => cell.trim()))
      .filter((cells) => cells.some((cell) => cell !== ''))
    const partial = model.rows.findIndex(
      (cells) =>
        cells.some((cell) => cell.trim() !== '') && cells.some((cell) => cell.trim() === ''),
    )
    let out = ''
    let error = partial === -1 ? '' : `Row ${partial + 1} is incomplete.`
    if (error === '' && filled.length > 0) {
      try {
        out = spec.run(spec.compose(filled, model.mode), model.mode)
      } catch (caught) {
        error = caught instanceof Error ? caught.message : 'Could not process this input.'
      }
    }
    return h.div(
      [h.Class(columnCls)],
      [
        spec.modes !== undefined && spec.modes.length > 1
          ? h.div(
              [],
              [
                segmented(h, {
                  label: 'Mode',
                  value: model.mode,
                  options: spec.modes.map((mode) => ({ value: mode.id, label: mode.label })),
                  onSelect: (mode) => RowsMessage.ChangedMode({ mode }),
                }),
              ],
            )
          : null,
        h.div(
          [h.Class(layoutCls)],
          [
            panel(h, null, [
              h.div(
                [h.Class(headCls)],
                [...spec.columns.map((column) => h.span([], [column.label])), h.i([], [])],
              ),
              ...model.rows.map((cells, row) =>
                h.div(
                  [h.Class(rowCls)],
                  [
                    ...spec.columns.map((column, col) =>
                      h.div(
                        [h.Class(cellCls)],
                        [
                          Elements.input(
                            h,
                            {
                              type: column.kind ?? 'number',
                              ...(column.placeholder === undefined
                                ? {}
                                : { placeholder: column.placeholder }),
                            },
                            [
                              h.Id(`${id}-${row}-${col}`),
                              h.Value(cells[col] ?? ''),
                              h.AriaLabel(`${column.label}, row ${row + 1}`),
                              h.OnInput((value) => RowsMessage.ChangedCell({ row, col, value })),
                            ],
                          ),
                          column.suffix === undefined
                            ? null
                            : h.span([h.Class(suffixCls)], [column.suffix]),
                        ],
                      ),
                    ),
                    h.div(
                      [h.Class(gutterCls)],
                      [
                        button(
                          h,
                          { variant: 'ghost', size: 'sm' },
                          [
                            h.Disabled(model.rows.length <= 1),
                            h.AriaLabel(`Remove row ${row + 1}`),
                            h.OnClick(RowsMessage.ClickedRemove({ row })),
                          ],
                          ['×'],
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              h.div(
                [],
                [
                  button(
                    h,
                    { variant: 'ghost', size: 'sm' },
                    [h.OnClick(RowsMessage.ClickedAdd())],
                    [spec.addLabel],
                  ),
                ],
              ),
              error === '' ? null : h.p([h.Role('alert'), h.Class(errorCls)], [error]),
            ]),
            out === ''
              ? null
              : h.div(
                  [h.Class(columnCls)],
                  [spec.view(h, { rows: filled, mode: model.mode, out })],
                ),
          ],
        ),
      ],
    )
  })

  return defineTool({
    meta: spec.meta,
    init: (): RowsModel => ({ mode: spec.modes?.[0]?.id ?? '', rows: spec.rows }),
    update,
    view,
  })
}
