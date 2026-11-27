// Shared pieces of the convert tools' bespoke views. Each tool writes its own view; this file
// holds the state they all keep (named text values, plus an optional ticking clock) and the
// few controls that repeat: a linked field, a copyable row, a unit converter.
import { Elements } from '@tools/ui'
import { Effect, Schema } from 'effect'
import { Command, Submodel } from 'foldkit'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { defineMessageUnion } from 'foldkit/message'
import { css } from '../../../styled-system/css'
import { button, segmented } from '../kit.ts'
import { defineTool, type ToolMeta } from '../tool.ts'

const Values = Schema.Record(Schema.String, Schema.String)
export type Values = Readonly<Record<string, string>>

const Model = Schema.Struct({
  values: Values,
  now: Schema.Finite,
  live: Schema.Boolean,
  run: Schema.Finite,
})
type Model = typeof Model.Type

const Message = defineMessageUnion({
  ChangedValue: { key: Schema.String, value: Schema.String },
  PatchedValues: { values: Values },
  ToggledLive: {},
  ResetClock: {},
  Ticked: { now: Schema.Finite, run: Schema.Finite },
})
export type Msg = typeof Message.Type

const Tick = Command.define('Tick', {
  args: { run: Schema.Finite },
  messages: [Message.Ticked],
  execute: ({ run }) =>
    Effect.sleep('1 second').pipe(Effect.map(() => Message.Ticked({ now: Date.now(), run }))),
})

const update = (model: Model, message: Msg) =>
  Message.match<{ model: Model; commands?: ReadonlyArray<Command.Command<Msg>> }>(message, {
    ChangedValue: ({ key, value }) => ({
      model: { ...model, values: { ...model.values, [key]: value } },
    }),
    PatchedValues: ({ values }) => ({
      model: { ...model, values: { ...model.values, ...values } },
    }),
    ToggledLive: () => {
      const run = model.run + 1
      return model.live
        ? { model: { ...model, live: false, run } }
        : { model: { ...model, live: true, run, now: Date.now() }, commands: [Tick({ run })] }
    },
    ResetClock: () => ({ model: { ...model, now: Date.now() } }),
    Ticked: ({ now, run }) =>
      model.live && run === model.run
        ? { model: { ...model, now }, commands: [Tick({ run })] }
        : { model },
  })

/** What a view reads and sends. */
export type Form = Readonly<{
  values: Values
  /** The value of a key, empty when unset. */
  get: (key: string) => string
  /** Milliseconds now, as of the last tick or reset. */
  now: number
  live: boolean
  /** An `OnInput` handler that stores the text under `key`. */
  set: (key: string) => (value: string) => Msg
  patch: (values: Values) => Msg
  toggleLive: Msg
  resetClock: Msg
}>

export const defineForm = (
  spec: Readonly<{
    meta: ToolMeta
    init: Values
    view: (form: Form, h: HtmlBuilder<Msg>) => Html
  }>,
) =>
  defineTool({
    meta: spec.meta,
    init: (): Model => ({ values: spec.init, now: Date.now(), live: false, run: 0 }),
    update,
    view: Submodel.defineView<Model, Msg>((model, h) =>
      spec.view(
        {
          values: model.values,
          get: (key) => model.values[key] ?? '',
          now: model.now,
          live: model.live,
          set: (key) => (value) => Message.ChangedValue({ key, value }),
          patch: (values) => Message.PatchedValues({ values }),
          toggleLive: Message.ToggledLive(),
          resetClock: Message.ResetClock(),
        },
        h,
      ),
    ),
  })

type Children = ReadonlyArray<Html | string | null>

const pageCls = css({ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' })
const cardCls = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.8rem',
  padding: '1rem 1.1rem',
  borderRadius: 'calc(var(--radius) * 1.6)',
  background: 'var(--card)',
  boxShadow: 'var(--elev-card)',
  minWidth: 0,
})
const splitCls = css({
  display: 'grid',
  gap: '1rem',
  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 20rem), 1fr))',
  alignItems: 'start',
})
const titleCls = css({
  margin: 0,
  fontFamily: 'var(--mono)',
  fontSize: '0.68rem',
  fontWeight: 500,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: 'var(--muted-foreground)',
})
const labelCls = css({ fontSize: '0.85rem', fontWeight: 550 })
const fieldCls = css({ display: 'flex', flexDirection: 'column', gap: '0.35rem', minWidth: 0 })
const wrapCls = css({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  '& input': { width: '100%', fontFamily: 'var(--mono)', paddingRight: '3.4rem' },
  '& [data-slot="copy-button"]': { position: 'absolute', right: '0.35rem' },
})
const suffixCls = css({
  position: 'absolute',
  right: '0.9rem',
  fontFamily: 'var(--mono)',
  fontSize: '0.72rem',
  color: 'var(--muted-foreground)',
  pointerEvents: 'none',
})
const rowsCls = css({ display: 'flex', flexDirection: 'column' })
const rowCls = css({
  display: 'grid',
  gridTemplateColumns: 'minmax(5rem, 9rem) 1fr auto',
  alignItems: 'center',
  gap: '0.75rem',
  padding: '0.4rem 0',
  borderTop: '1px solid color-mix(in oklab, var(--foreground) 8%, transparent)',
  '&:first-child': { borderTop: 'none' },
  '& > span:first-child': { fontSize: '0.8rem', color: 'var(--muted-foreground)' },
  '& > code': {
    fontFamily: 'var(--mono)',
    fontSize: '0.88rem',
    fontVariantNumeric: 'tabular-nums',
    overflowWrap: 'anywhere',
  },
})
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
const heroValueCls = css({
  fontFamily: 'var(--mono)',
  fontSize: 'clamp(1.6rem, 4.5vw, 2.6rem)',
  fontWeight: 500,
  letterSpacing: '-0.02em',
  lineHeight: 1.15,
  fontVariantNumeric: 'tabular-nums',
  color: 'var(--tone-ink)',
  overflowWrap: 'anywhere',
})
const errorCls = css({
  margin: 0,
  color: 'var(--danger)',
  fontSize: '0.85rem',
  fontFamily: 'var(--mono)',
})
const chipsCls = css({ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' })
const chipCls = css({
  padding: '0.25rem 0.65rem',
  borderRadius: '999px',
  fontFamily: 'var(--mono)',
  fontSize: '0.78rem',
  background: 'var(--well)',
  boxShadow: 'var(--elev-well)',
  color: 'var(--foreground)',
  cursor: 'pointer',
  '&[aria-pressed="true"]': { outline: '2px solid var(--primary)', outlineOffset: '-2px' },
})
const selectCls = css({
  height: '2.4rem',
  padding: '0 0.6rem',
  borderRadius: 'var(--radius)',
  background: 'var(--well)',
  boxShadow: 'var(--elev-well)',
  color: 'var(--foreground)',
  fontFamily: 'inherit',
  minWidth: 0,
})
const converterCls = css({
  display: 'grid',
  gridTemplateColumns: '1fr auto 1fr',
  gap: '0.75rem',
  alignItems: 'end',
  '@media (max-width: 40rem)': { gridTemplateColumns: '1fr' },
})
const tableCls = css({
  display: 'grid',
  gap: '0.5rem',
  gridTemplateColumns: 'repeat(auto-fill, minmax(12rem, 1fr))',
})
const cellCls = css({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.1rem',
  padding: '0.6rem 2.6rem 0.6rem 0.8rem',
  borderRadius: 'var(--radius)',
  background: 'var(--well)',
  boxShadow: 'var(--elev-well)',
  '& span': { fontSize: '0.72rem', color: 'var(--muted-foreground)' },
  '& code': {
    fontFamily: 'var(--mono)',
    fontSize: '0.95rem',
    fontVariantNumeric: 'tabular-nums',
    overflowWrap: 'anywhere',
  },
  '& [data-slot="copy-button"]': {
    position: 'absolute',
    top: '50%',
    right: '0.3rem',
    transform: 'translateY(-50%)',
  },
})

export const copyButton = <M>(h: HtmlBuilder<M>, text: string): Html | null =>
  text === '' ? null : Elements.copyButton(h, false, h.Attribute('data-copy', text))

/** The page: cards in a column. */
export const page = <M>(h: HtmlBuilder<M>, children: Children): Html =>
  h.div([h.Class(pageCls)], children)

/** Cards side by side while they fit. */
export const split = <M>(h: HtmlBuilder<M>, children: Children): Html =>
  h.div([h.Class(splitCls)], children)

export const card = <M>(h: HtmlBuilder<M>, title: string | null, children: Children): Html =>
  h.section(
    [h.Class(cardCls)],
    title === null ? children : [h.h3([h.Class(titleCls)], [title]), ...children],
  )

export type FieldProps<M> = Readonly<{
  id: string
  label: string
  value: string
  onInput: (value: string) => M
  placeholder?: string
  suffix?: string
  type?: string
  inputMode?: 'decimal' | 'numeric' | 'text'
  invalid?: boolean
  /** Show a copy button for the value. */
  copy?: boolean
}>

/** A labelled input, with an optional unit and a copy button inside it. */
export const field = <M>(h: HtmlBuilder<M>, props: FieldProps<M>): Html =>
  h.div(
    [h.Class(fieldCls)],
    [
      h.label([h.Class(labelCls), h.For(props.id)], [props.label]),
      h.div(
        [h.Class(wrapCls)],
        [
          Elements.input(
            h,
            {
              ...(props.placeholder === undefined ? {} : { placeholder: props.placeholder }),
              type: props.type ?? 'text',
              ...(props.invalid === true ? { invalid: true } : {}),
            },
            [
              h.Id(props.id),
              h.Value(props.value),
              h.OnInput(props.onInput),
              h.Spellcheck(false),
              h.Autocomplete('off'),
              ...(props.inputMode === undefined ? [] : [h.InputMode(props.inputMode)]),
              ...(props.suffix === undefined ? [] : [h.Style({ paddingRight: '3.6rem' })]),
            ],
          ),
          props.suffix === undefined
            ? props.copy === true
              ? copyButton(h, props.value)
              : null
            : h.span([h.Class(suffixCls)], [props.suffix]),
        ],
      ),
    ],
  )

export const errorText = <M>(h: HtmlBuilder<M>, text: string): Html | null =>
  text === '' ? null : h.p([h.Role('alert'), h.Class(errorCls)], [text])

/** A list of `label  value  copy` lines. */
export const rows = <M>(h: HtmlBuilder<M>, items: ReadonlyArray<readonly [string, string]>): Html =>
  h.div(
    [h.Class(rowsCls)],
    items.map(([label, value]) =>
      h.div([h.Class(rowCls)], [h.span([], [label]), h.code([], [value]), copyButton(h, value)]),
    ),
  )

/** A grid of small cells, each a label over a value with a copy button. */
export const cells = <M>(
  h: HtmlBuilder<M>,
  items: ReadonlyArray<readonly [string, string]>,
): Html =>
  h.div(
    [h.Class(tableCls)],
    items.map(([label, value]) =>
      h.div([h.Class(cellCls)], [h.span([], [label]), h.code([], [value]), copyButton(h, value)]),
    ),
  )

/** The answer, large, with its name above and a copy button. */
export const hero = <M>(h: HtmlBuilder<M>, label: string, value: string): Html =>
  h.div(
    [h.Class(heroCls)],
    [
      h.span([h.Class(titleCls)], [label]),
      h.span([h.Class(heroValueCls)], [value === '' ? '—' : value]),
      copyButton(h, value),
    ],
  )

/** Small buttons that fill the tool with an example. */
export const chips = <M>(
  h: HtmlBuilder<M>,
  items: ReadonlyArray<Readonly<{ label: string; message: M; active?: boolean }>>,
): Html =>
  h.div(
    [h.Class(chipsCls)],
    items.map((item) =>
      h.button(
        [
          h.Class(chipCls),
          h.Type('button'),
          h.AriaPressed(item.active === true ? 'true' : 'false'),
          h.OnClick(item.message),
        ],
        [item.label],
      ),
    ),
  )

export const select = <M>(
  h: HtmlBuilder<M>,
  props: Readonly<{
    id: string
    label: string
    value: string
    options: ReadonlyArray<Readonly<{ value: string; label: string }>>
    onChange: (value: string) => M
  }>,
): Html =>
  h.select(
    [
      h.Class(selectCls),
      h.Id(props.id),
      h.AriaLabel(props.label),
      h.Value(props.value),
      h.OnChange(props.onChange),
    ],
    props.options.map((option) =>
      h.option([h.Value(option.value), h.Selected(option.value === props.value)], [option.label]),
    ),
  )

export const swapButton = <M>(h: HtmlBuilder<M>, onSwap: M): Html =>
  button(
    h,
    { variant: 'secondary', size: 'base', shape: 'square' },
    [h.OnClick(onSwap), h.AriaLabel('Swap'), h.Title('Swap')],
    ['⇄'],
  )

/** The text of a number for a field: no exponent, at most ten significant digits. */
export const formatValue = (value: number): string =>
  Number.isFinite(value)
    ? value.toLocaleString('en', { useGrouping: false, maximumSignificantDigits: 10 })
    : ''

/** Parses a typed number, accepting a comma as the decimal mark. NaN when it is not one. */
export const parseNumber = (text: string): number =>
  text.trim() === '' ? Number.NaN : Number(text.trim().replace(',', '.'))

export type Unit = Readonly<{
  id: string
  label: string
  toBase: (value: number) => number
  fromBase: (base: number) => number
}>
export type UnitSet = Readonly<{ id: string; name: string; units: ReadonlyArray<Unit> }>

/** Linear units from their size in the base unit. */
export const linear = (id: string, label: string, factor: number): Unit => ({
  id,
  label,
  toBase: (value) => value * factor,
  fromBase: (base) => base / factor,
})

const find = (set: UnitSet, id: string): Unit => {
  const unit = set.units.find((entry) => entry.id === id) ?? set.units[0]
  if (unit === undefined) throw new Error('A unit set needs a unit.')
  return unit
}

export const convertBetween = (set: UnitSet, value: number, from: string, to: string): number =>
  find(set, to).fromBase(find(set, from).toBase(value))

/**
 * Two linked fields with a unit each and a swap button, and every unit of the set below.
 * It keeps `set`, `from`, `to`, `amount` and `right` in the form; `extra` renders under the table.
 */
export const unitConverter = (
  h: HtmlBuilder<Msg>,
  form: Form,
  props: Readonly<{ sets: ReadonlyArray<UnitSet>; extra?: Html | null }>,
): Html => {
  const set = props.sets.find((entry) => entry.id === form.get('set')) ?? props.sets[0]
  if (set === undefined) throw new Error('A converter needs a unit set.')
  const from = find(set, form.get('from'))
  const to = find(set, form.get('to'))
  const amount = form.get('amount')
  const forward = (text: string, a: string, b: string): string =>
    formatValue(convertBetween(set, parseNumber(text), a, b))
  const options = set.units.map((unit) => ({ value: unit.id, label: unit.label }))
  const value = parseNumber(amount)
  return page(h, [
    props.sets.length > 1
      ? segmented(h, {
          label: 'Quantity',
          value: set.id,
          options: props.sets.map((entry) => ({ value: entry.id, label: entry.name })),
          onSelect: (id) => {
            const next = props.sets.find((entry) => entry.id === id) ?? set
            const a = next.units[0]?.id ?? ''
            const b = next.units[1]?.id ?? a
            return form.patch({
              set: id,
              from: a,
              to: b,
              right:
                forward(amount, a, b) === '' ? '' : formatValue(convertBetween(next, value, a, b)),
            })
          },
        })
      : null,
    card(h, null, [
      h.div(
        [h.Class(converterCls)],
        [
          h.div(
            [h.Class(fieldCls)],
            [
              field(h, {
                id: 'amount',
                label: 'From',
                value: amount,
                inputMode: 'decimal',
                copy: true,
                invalid: amount.trim() !== '' && Number.isNaN(value),
                onInput: (text) =>
                  form.patch({ amount: text, right: forward(text, from.id, to.id) }),
              }),
              select(h, {
                id: 'from',
                label: 'From unit',
                value: from.id,
                options,
                onChange: (id) => form.patch({ from: id, right: forward(amount, id, to.id) }),
              }),
            ],
          ),
          swapButton(
            h,
            form.patch({ from: to.id, to: from.id, amount: form.get('right'), right: amount }),
          ),
          h.div(
            [h.Class(fieldCls)],
            [
              field(h, {
                id: 'right',
                label: 'To',
                value: form.get('right'),
                inputMode: 'decimal',
                copy: true,
                onInput: (text) =>
                  form.patch({ right: text, amount: forward(text, to.id, from.id) }),
              }),
              select(h, {
                id: 'to',
                label: 'To unit',
                value: to.id,
                options,
                onChange: (id) => form.patch({ to: id, right: forward(amount, from.id, id) }),
              }),
            ],
          ),
        ],
      ),
    ]),
    props.extra ?? null,
    card(h, `${amount === '' ? '' : `${amount} ${from.label} in`} ${set.name}`.trim(), [
      Number.isNaN(value)
        ? h.span([], [])
        : cells(
            h,
            set.units
              .filter((unit) => unit.id !== from.id)
              .map((unit) => [
                unit.label,
                formatValue(convertBetween(set, value, from.id, unit.id)),
              ]),
          ),
    ]),
  ])
}

/** The values a unit converter starts with. */
export const unitStart = (
  sets: ReadonlyArray<UnitSet>,
  from: string,
  to: string,
  amount: string,
): Values => {
  const set = sets[0]
  return {
    set: set?.id ?? '',
    from,
    to,
    amount,
    right: set === undefined ? '' : formatValue(convertBetween(set, Number(amount), from, to)),
  }
}

/** Reads `Label: value` lines into a record. */
export const parseLines = (text: string): Values =>
  Object.fromEntries(
    text
      .split('\n')
      .map((line) => line.split(': '))
      .filter((parts) => parts.length >= 2)
      .map(([label = '', ...rest]) => [label, rest.join(': ')]),
  )

/**
 * Fields that all show the same quantity. Typing in one stores `src` and `text`; `convert`
 * fills the others and throws when the text is not valid for that field.
 */
export const linked = (
  h: HtmlBuilder<Msg>,
  form: Form,
  items: ReadonlyArray<Readonly<{ key: string; label: string; suffix?: string }>>,
  convert: (src: string, text: string) => Values,
): Readonly<{ values: Values; error: string; fields: Html }> => {
  const src = form.get('src')
  const text = form.get('text')
  let values: Values = {}
  let error = ''
  if (text.trim() !== '') {
    try {
      values = convert(src, text)
    } catch (caught) {
      error = caught instanceof Error ? caught.message : 'Could not convert this.'
    }
  }
  return {
    values,
    error,
    fields: split(
      h,
      items.map((item) =>
        field(h, {
          id: item.key,
          label: item.label,
          value: item.key === src ? text : (values[item.key] ?? ''),
          copy: true,
          invalid: item.key === src && error !== '',
          onInput: (value) => form.patch({ src: item.key, text: value }),
          ...(item.suffix === undefined ? {} : { suffix: item.suffix }),
        }),
      ),
    ),
  }
}

/** Digits in groups of `size` from the right: `1111 0000`. */
export const spaced = (digits: string, size: number): string => {
  const negative = digits.startsWith('-')
  const body = negative ? digits.slice(1) : digits
  const parts: Array<string> = []
  for (let end = body.length; end > 0; end -= size)
    parts.unshift(body.slice(Math.max(0, end - size), end))
  return `${negative ? '-' : ''}${parts.join(' ')}`
}

const swatchCls = css({
  height: '5rem',
  borderRadius: 'var(--radius)',
  boxShadow: 'inset 0 0 0 1px color-mix(in oklab, var(--foreground) 15%, transparent)',
})

/** A block of a CSS color. Anything that is not a color shows as empty. */
export const swatch = <M>(h: HtmlBuilder<M>, color: string): Html =>
  h.div([h.Class(swatchCls), h.Style({ background: color === '' ? 'transparent' : color })], [])

/** Reads `Label    value` lines, where the gap is two or more spaces. */
export const parseColumns = (text: string): ReadonlyArray<readonly [string, string]> =>
  text
    .split('\n')
    .map((line) => /^(.+?)\s{2,}(.*)$/u.exec(line))
    .filter((match) => match !== null)
    .map((match) => [match[1] ?? '', match[2] ?? ''] as const)
