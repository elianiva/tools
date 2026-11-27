// Shared pieces of the money calculators: the form, a receipt, split and comparison bars,
// two SVG charts, and a table. Every calculator keeps its own pure `run`; the form reads the
// facts (`Label: value` lines) that `run` returns and each tool lays them out its own way.
import { Schema } from 'effect'
import { Submodel } from 'foldkit'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { defineMessageUnion } from 'foldkit/message'
import { css } from '../../../styled-system/css'
import { parseFacts } from '../facts.ts'
import { segmented } from '../kit.ts'
import { defineTool, type ToolMeta } from '../tool.ts'
import {
  copyButton,
  failure,
  fieldError,
  inputField,
  joinValues,
  layout,
  smallLabel,
  type Field,
  type Mode,
} from '../generate/ui.ts'

export const money = (n: number): string =>
  Number.isFinite(n)
    ? n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : '—'

export const percent = (n: number): string => `${n.toFixed(2)}%`

const compact = (n: number): string => {
  const abs = Math.abs(n)
  if (abs >= 1e9) return `${(n / 1e9).toFixed(1)}B`
  if (abs >= 1e6) return `${(n / 1e6).toFixed(1)}M`
  if (abs >= 1e3) return `${(n / 1e3).toFixed(1)}k`
  return n.toFixed(0)
}

// ── The form ────────────────────────────────────────────────────────────────

export type Result = Readonly<{
  /** The numbers typed into the fields, in order. */
  nums: ReadonlyArray<number>
  mode: string
  /** The text `run` returned. */
  text: string
  /** A fact's text, such as `Sale price` → `75.00`. */
  fact: (label: string) => string
  /** A fact as a number. */
  num: (label: string) => number
}>

type CalcSpec = Readonly<{
  meta: Omit<ToolMeta, 'accepts'>
  fields: ReadonlyArray<Field>
  modes?: ReadonlyArray<Mode>
  modeLabel?: string
  run: (text: string, mode: string) => string
  render: <M>(h: HtmlBuilder<M>, result: Result) => ReadonlyArray<Html>
}>

const Model = Schema.Struct({ values: Schema.Array(Schema.String), mode: Schema.String })
type Model = typeof Model.Type

const Message = defineMessageUnion({
  ChangedField: { index: Schema.Finite, value: Schema.String },
  ChangedMode: { mode: Schema.String },
})
type Message = typeof Message.Type

const modeCls = css({ display: 'flex', flexDirection: 'column', gap: '0.35rem' })

export const defineCalc = (spec: CalcSpec) => {
  const id = spec.meta.id
  const update = (model: Model, message: Message) =>
    Message.match<{ model: Model }>(message, {
      ChangedField: ({ index, value }) => ({
        model: {
          ...model,
          values: model.values.map((current, at) => (at === index ? value : current)),
        },
      }),
      ChangedMode: ({ mode }) => ({ model: { ...model, mode } }),
    })

  const view = Submodel.defineView<Model, Message>((model, h) => {
    const errors = spec.fields.map((field, index) => fieldError(field, model.values[index] ?? ''))
    let body: ReadonlyArray<Html> = []
    if (errors.every((error) => error === '')) {
      try {
        const text = spec.run(joinValues(spec.fields, model.values), model.mode)
        const { facts } = parseFacts(text)
        const fact = (label: string): string => facts.find(([name]) => name === label)?.[1] ?? ''
        body = spec.render(h, {
          nums: model.values.map((value) => Number(value.replaceAll(/[,_\s]/gu, ''))),
          mode: model.mode,
          text,
          fact,
          num: (label) => Number.parseFloat(fact(label).replaceAll(',', '')),
        })
      } catch (error) {
        body = [failure(h, error instanceof Error ? error.message : 'Could not calculate.')]
      }
    }
    return layout(
      h,
      [
        ...(spec.modes === undefined || spec.modes.length < 2
          ? []
          : [
              h.div(
                [h.Class(modeCls)],
                [
                  spec.modeLabel === undefined ? null : smallLabel(h, spec.modeLabel),
                  segmented(h, {
                    label: spec.modeLabel ?? 'Mode',
                    value: model.mode,
                    options: spec.modes.map((mode) => ({ value: mode.id, label: mode.label })),
                    onSelect: (mode) => Message.ChangedMode({ mode }),
                  }),
                ],
              ),
            ]),
        ...spec.fields.map((field, index) =>
          inputField(h, {
            id: `${id}-field-${index}`,
            field,
            suffix: field.suffixByMode?.[model.mode] ?? field.suffix,
            value: model.values[index] ?? '',
            error: errors[index] ?? '',
            onInput: (value) => Message.ChangedField({ index, value }),
          }),
        ),
      ],
      body,
    )
  })

  return defineTool({
    meta: spec.meta,
    init: (): Model => ({
      values: spec.fields.map((field) => field.initial),
      mode: spec.modes?.[0]?.id ?? '',
    }),
    update,
    view,
  })
}

// ── Receipt ─────────────────────────────────────────────────────────────────

export type Line = Readonly<{ label: string; value: string; sign?: string; strong?: boolean }>

const receiptCls = css({
  position: 'relative',
  padding: '1rem 3.2rem 1rem 1.2rem',
  borderRadius: 'calc(var(--radius) * 1.4)',
  background: 'var(--card)',
  boxShadow: 'var(--elev-card)',
  '& > [data-slot="copy-button"]': { position: 'absolute', top: '0.6rem', right: '0.6rem' },
  '& ul': {
    margin: 0,
    padding: 0,
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.55rem',
  },
  '& li': {
    display: 'flex',
    alignItems: 'baseline',
    gap: '0.5rem',
    fontSize: '0.92rem',
  },
  '& li i': {
    flex: 1,
    alignSelf: 'flex-end',
    marginBottom: '0.3em',
    borderBottom: '1px dotted var(--hairline)',
  },
  '& li span:last-child': { fontFamily: 'var(--mono)', fontVariantNumeric: 'tabular-nums' },
  '& li[data-strong]': {
    paddingBlockStart: '0.55rem',
    boxShadow: 'inset 0 1px 0 var(--hairline)',
    fontWeight: 600,
    fontSize: '1rem',
  },
})

/** Lines that add up to a total, like a till receipt. A copy button takes the whole receipt. */
export const receipt = <M>(h: HtmlBuilder<M>, lines: ReadonlyArray<Line>): Html =>
  h.div(
    [h.Class(receiptCls)],
    [
      h.ul(
        [],
        lines.map((line) =>
          h.li(line.strong === true ? [h.Attribute('data-strong', '')] : [], [
            h.span([], [line.label]),
            h.i([], []),
            h.span([], [`${line.sign ?? ''}${line.value}`]),
          ]),
        ),
      ),
      copyButton(h, lines.map((line) => `${line.label}: ${line.value}`).join('\n')),
    ],
  )

// ── Bars ────────────────────────────────────────────────────────────────────

export type Tone = 'ok' | 'info' | 'warn' | 'danger' | 'muted'

const TONES: Readonly<Record<Tone, string>> = {
  ok: 'var(--ok)',
  info: 'var(--info)',
  warn: 'var(--warn)',
  danger: 'var(--danger)',
  muted: 'color-mix(in oklab, var(--foreground) 28%, transparent)',
}

export type Part = Readonly<{ label: string; value: number; text: string; tone: Tone }>

const splitCls = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.6rem',
  padding: '1rem 1.2rem',
  borderRadius: 'calc(var(--radius) * 1.4)',
  background: 'var(--card)',
  boxShadow: 'var(--elev-card)',
})
const trackCls = css({
  display: 'flex',
  height: '14px',
  borderRadius: '999px',
  overflow: 'hidden',
  background: 'var(--well)',
  boxShadow: 'var(--elev-well)',
  '& > i': { display: 'block', height: '100%', transition: 'flex-grow 300ms ease' },
})
const legendCls = css({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.3rem 1.2rem',
  fontSize: '0.82rem',
  '& span': { display: 'inline-flex', alignItems: 'center', gap: '0.4rem' },
  '& i': { width: '0.7rem', height: '0.7rem', borderRadius: '3px' },
  '& b': { fontFamily: 'var(--mono)', fontWeight: 500, fontVariantNumeric: 'tabular-nums' },
})

/** One bar cut into parts, with a legend of each part and its value. */
export const splitBar = <M>(h: HtmlBuilder<M>, title: string, parts: ReadonlyArray<Part>): Html =>
  h.div(
    [h.Class(splitCls)],
    [
      smallLabel(h, title),
      h.div(
        [h.Class(trackCls), h.Role('img'), h.AriaLabel(title)],
        parts.map((part) =>
          h.i(
            [h.Style({ flexGrow: String(Math.max(0, part.value)), background: TONES[part.tone] })],
            [],
          ),
        ),
      ),
      h.div(
        [h.Class(legendCls)],
        parts.map((part) =>
          h.span(
            [],
            [
              h.i([h.Style({ background: TONES[part.tone] })], []),
              part.label,
              h.b([], [part.text]),
            ],
          ),
        ),
      ),
    ],
  )

const compareCls = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.7rem',
  padding: '1rem 1.2rem',
  borderRadius: 'calc(var(--radius) * 1.4)',
  background: 'var(--card)',
  boxShadow: 'var(--elev-card)',
})
const compareRowCls = css({
  display: 'grid',
  gridTemplateColumns: 'minmax(5rem, 8rem) minmax(0, 1fr) auto',
  alignItems: 'center',
  gap: '0.7rem',
  fontSize: '0.85rem',
  '& i': {
    display: 'block',
    height: '12px',
    borderRadius: '4px',
    transition: 'width 300ms cubic-bezier(0.23, 1, 0.32, 1)',
  },
  '& b': { fontFamily: 'var(--mono)', fontWeight: 500, fontVariantNumeric: 'tabular-nums' },
})

/** One bar per value, all on the same scale. */
export const compareBars = <M>(
  h: HtmlBuilder<M>,
  title: string,
  rows: ReadonlyArray<Part>,
): Html => {
  const top = Math.max(...rows.map((entry) => Math.abs(entry.value)), 1e-9)
  return h.div(
    [h.Class(compareCls)],
    [
      smallLabel(h, title),
      ...rows.map((entry) =>
        h.div(
          [h.Class(compareRowCls)],
          [
            h.span([], [entry.label]),
            h.div(
              [],
              [
                h.i(
                  [
                    h.Style({
                      width: `${Math.max(1, (Math.abs(entry.value) / top) * 100)}%`,
                      background: TONES[entry.tone],
                    }),
                  ],
                  [],
                ),
              ],
            ),
            h.b([], [entry.text]),
          ],
        ),
      ),
    ],
  )
}

// ── Tiles ───────────────────────────────────────────────────────────────────

const tilesCls = css({
  display: 'grid',
  gap: '0.6rem',
  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 11rem), 1fr))',
})
const tileCls = css({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.2rem',
  padding: '0.7rem 2.6rem 0.7rem 0.9rem',
  borderRadius: 'var(--radius)',
  background: 'var(--card)',
  boxShadow: 'var(--elev-raised)',
  '& > [data-slot="copy-button"]': { position: 'absolute', top: '0.4rem', right: '0.4rem' },
  '& b': {
    fontFamily: 'var(--mono)',
    fontSize: '1.05rem',
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
    overflowWrap: 'anywhere',
  },
})

/** Small numbers with names, each with its own copy button. */
export const tiles = <M>(
  h: HtmlBuilder<M>,
  items: ReadonlyArray<readonly [string, string]>,
): Html =>
  h.div(
    [h.Class(tilesCls)],
    items.map(([label, value]) =>
      h.div([h.Class(tileCls)], [smallLabel(h, label), h.b([], [value]), copyButton(h, value)]),
    ),
  )

// ── Table ───────────────────────────────────────────────────────────────────

const tableWrapCls = css({
  maxHeight: '22rem',
  overflow: 'auto',
  borderRadius: 'calc(var(--radius) * 1.4)',
  background: 'var(--card)',
  boxShadow: 'var(--elev-card)',
  '& table': { width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' },
  '& th, & td': {
    padding: '0.5rem 0.9rem',
    textAlign: 'right',
    fontFamily: 'var(--mono)',
    fontVariantNumeric: 'tabular-nums',
  },
  '& th': {
    position: 'sticky',
    top: 0,
    background: 'var(--card)',
    fontSize: '0.68rem',
    fontWeight: 500,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: 'var(--muted-foreground)',
    boxShadow: 'inset 0 -1px 0 var(--hairline)',
  },
  '& tr[data-current] td': { background: 'var(--tone-soft)' },
  '& tbody tr + tr td': { boxShadow: 'inset 0 1px 0 var(--hairline)' },
  '& th:first-child, & td:first-child': { textAlign: 'left' },
})

export const dataTable = <M>(
  h: HtmlBuilder<M>,
  headers: ReadonlyArray<string>,
  rows: ReadonlyArray<ReadonlyArray<string>>,
  current: number = -1,
): Html =>
  h.div(
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
                headers.map((header) => h.th([h.Scope('col')], [header])),
              ),
            ],
          ),
          h.tbody(
            [],
            rows.map((cells, index) =>
              h.tr(
                index === current ? [h.Attribute('data-current', '')] : [],
                cells.map((cell) => h.td([], [cell])),
              ),
            ),
          ),
        ],
      ),
    ],
  )

// ── Charts ──────────────────────────────────────────────────────────────────

const chartCls = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.6rem',
  padding: '1rem 1.2rem',
  borderRadius: 'calc(var(--radius) * 1.4)',
  background: 'var(--card)',
  boxShadow: 'var(--elev-card)',
  '& svg': { width: '100%', height: 'auto', overflow: 'visible' },
  '& text': {
    fill: 'var(--muted-foreground)',
    fontFamily: 'var(--mono)',
    fontSize: '10px',
  },
})

const W = 640
const H = 220
const LEFT = 46
const TOP = 10
const BOTTOM = 22
const RIGHT = 10
const plotW = W - LEFT - RIGHT
const plotH = H - TOP - BOTTOM
const fixed = (n: number): string => n.toFixed(1)

const axis = <M>(h: HtmlBuilder<M>, top: number): ReadonlyArray<Html> =>
  [0, 0.5, 1].flatMap((share) => {
    const y = TOP + plotH * (1 - share)
    return [
      h.line(
        [
          h.Attribute('x1', String(LEFT)),
          h.Attribute('x2', String(W - RIGHT)),
          h.Attribute('y1', fixed(y)),
          h.Attribute('y2', fixed(y)),
          h.Attribute('stroke', 'var(--hairline)'),
        ],
        [],
      ),
      h.text(
        [
          h.Attribute('x', String(LEFT - 6)),
          h.Attribute('y', fixed(y + 3)),
          h.Attribute('text-anchor', 'end'),
        ],
        [compact(top * share)],
      ),
    ]
  })

const swatchLegend = <M>(h: HtmlBuilder<M>, items: ReadonlyArray<readonly [string, Tone]>): Html =>
  h.div(
    [h.Class(legendCls)],
    items.map(([label, tone]) =>
      h.span([], [h.i([h.Style({ background: TONES[tone] })], []), label]),
    ),
  )

export type Bar = Readonly<{ label: string; base: number; value: number }>

/** Stacked columns: what you put in, and what it earned on top. */
export const growthChart = <M>(
  h: HtmlBuilder<M>,
  title: string,
  bars: ReadonlyArray<Bar>,
): Html => {
  const top = Math.max(...bars.map((bar) => bar.value), 1)
  const slot = plotW / Math.max(bars.length, 1)
  const width = Math.max(2, slot * 0.72)
  const every = Math.ceil(bars.length / 8)
  return h.div(
    [h.Class(chartCls)],
    [
      smallLabel(h, title),
      h.svg(
        [h.Attribute('viewBox', `0 0 ${W} ${H}`), h.Role('img'), h.AriaLabel(title)],
        [
          ...axis(h, top),
          ...bars.flatMap((bar, index) => {
            const x = LEFT + index * slot + (slot - width) / 2
            const base = (plotH * Math.min(bar.base, bar.value)) / top
            const gain = (plotH * Math.max(0, bar.value - bar.base)) / top
            return [
              h.rect(
                [
                  h.Attribute('x', fixed(x)),
                  h.Attribute('y', fixed(TOP + plotH - base)),
                  h.Attribute('width', fixed(width)),
                  h.Attribute('height', fixed(base)),
                  h.Attribute('fill', TONES.info),
                ],
                [],
              ),
              h.rect(
                [
                  h.Attribute('x', fixed(x)),
                  h.Attribute('y', fixed(TOP + plotH - base - gain)),
                  h.Attribute('width', fixed(width)),
                  h.Attribute('height', fixed(gain)),
                  h.Attribute('fill', TONES.ok),
                ],
                [],
              ),
              index % every === 0 || index === bars.length - 1
                ? h.text(
                    [
                      h.Attribute('x', fixed(x + width / 2)),
                      h.Attribute('y', String(H - 6)),
                      h.Attribute('text-anchor', 'middle'),
                    ],
                    [bar.label],
                  )
                : null,
            ]
          }),
        ],
      ),
      swatchLegend(h, [
        ['Principal', 'info'],
        ['Interest', 'ok'],
      ]),
    ],
  )
}

export type Series = Readonly<{
  label: string
  tone: Tone
  points: ReadonlyArray<readonly [number, number]>
}>

/** Lines over a shared scale, with optional ticks along the bottom and one marked point. */
export const lineChart = <M>(
  h: HtmlBuilder<M>,
  props: Readonly<{
    title: string
    series: ReadonlyArray<Series>
    xMax: number
    ticks: ReadonlyArray<readonly [number, string]>
    mark?: Readonly<{ x: number; y: number; label: string }>
  }>,
): Html => {
  const top = Math.max(...props.series.flatMap((s) => s.points.map(([, y]) => y)), 1)
  const px = (x: number): number => LEFT + (plotW * x) / props.xMax
  const py = (y: number): number => TOP + plotH * (1 - y / top)
  const mark = props.mark
  return h.div(
    [h.Class(chartCls)],
    [
      smallLabel(h, props.title),
      h.svg(
        [h.Attribute('viewBox', `0 0 ${W} ${H}`), h.Role('img'), h.AriaLabel(props.title)],
        [
          ...axis(h, top),
          ...props.ticks.map(([x, label]) =>
            h.text(
              [
                h.Attribute('x', fixed(px(x))),
                h.Attribute('y', String(H - 6)),
                h.Attribute('text-anchor', 'middle'),
              ],
              [label],
            ),
          ),
          ...props.series.map((s) =>
            h.polyline(
              [
                h.Attribute(
                  'points',
                  s.points.map(([x, y]) => `${fixed(px(x))},${fixed(py(y))}`).join(' '),
                ),
                h.Attribute('fill', 'none'),
                h.Attribute('stroke', TONES[s.tone]),
                h.Attribute('stroke-width', '2.5'),
                h.Attribute('stroke-linejoin', 'round'),
                h.Attribute('stroke-linecap', 'round'),
              ],
              [],
            ),
          ),
          mark === undefined
            ? null
            : h.g(
                [],
                [
                  h.line(
                    [
                      h.Attribute('x1', fixed(px(mark.x))),
                      h.Attribute('x2', fixed(px(mark.x))),
                      h.Attribute('y1', fixed(py(mark.y))),
                      h.Attribute('y2', String(TOP + plotH)),
                      h.Attribute('stroke', 'var(--foreground)'),
                      h.Attribute('stroke-dasharray', '3 3'),
                    ],
                    [],
                  ),
                  h.circle(
                    [
                      h.Attribute('cx', fixed(px(mark.x))),
                      h.Attribute('cy', fixed(py(mark.y))),
                      h.Attribute('r', '5'),
                      h.Attribute('fill', 'var(--foreground)'),
                    ],
                    [],
                  ),
                  h.text(
                    [
                      h.Attribute('x', fixed(px(mark.x) + (mark.x > props.xMax / 2 ? -8 : 8))),
                      h.Attribute('y', fixed(py(mark.y) - 10)),
                      h.Attribute('text-anchor', mark.x > props.xMax / 2 ? 'end' : 'start'),
                    ],
                    [mark.label],
                  ),
                ],
              ),
        ],
      ),
      swatchLegend(
        h,
        props.series.map((s) => [s.label, s.tone] as const),
      ),
    ],
  )
}

// ── Growth over years ───────────────────────────────────────────────────────

/** Whole-number years up to `years` (about sixty points at most), ending on `years` itself. */
export const yearSteps = (years: number): ReadonlyArray<number> => {
  const step = Math.max(1, Math.ceil(years / 60))
  const points: Array<number> = []
  for (let t = step; t < years; t += step) points.push(t)
  points.push(years)
  return points
}

/** A chart and a year-by-year table of a balance that starts at `principal`. */
export const growthSection = <M>(
  h: HtmlBuilder<M>,
  principal: number,
  years: number,
  valueAt: (year: number) => number,
): ReadonlyArray<Html> => {
  const steps = yearSteps(years)
  const label = (t: number): string => String(Number(t.toFixed(2)))
  return [
    growthChart(
      h,
      'Balance by year',
      steps.map((t) => ({ label: label(t), base: principal, value: valueAt(t) })),
    ),
    dataTable(
      h,
      ['Year', 'Interest', 'Balance'],
      steps.map((t) => [label(t), money(valueAt(t) - principal), money(valueAt(t))]),
    ),
  ]
}
