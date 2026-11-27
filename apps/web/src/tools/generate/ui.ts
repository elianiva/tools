// Shared pieces of the generate and calculate tools: validated number fields, a result
// layout, a headline number, and a builder for tools that roll a new value on demand.
import { Elements } from '@tools/ui'
import { Effect, Schema } from 'effect'
import { Command, Submodel } from 'foldkit'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { defineMessageUnion } from 'foldkit/message'
import { css } from '../../../styled-system/css'
import { button, panel, row, segmented, stack } from '../kit.ts'
import { defineTool, type ToolMeta } from '../tool.ts'

export type Field = Readonly<{
  label: string
  initial: string
  suffix?: string
  /** A suffix that depends on the selected mode, such as `L/100km` or `km/L`. */
  suffixByMode?: Readonly<Record<string, string>>
  /** Quick values shown as buttons under the input. */
  presets?: ReadonlyArray<string>
  integer?: boolean
  /** Defaults to 0: money, rates, and counts are not negative. */
  min?: number
  max?: number
  /** A free-text field checked against a pattern instead of as a number. */
  text?: Readonly<{ pattern: RegExp; message: string }>
}>

export type Mode = Readonly<{ id: string; label: string }>

export const cleanNumber = (value: string): string => value.trim().replaceAll(/[,_\s]/gu, '')

/** The message to show under a field, or an empty string when the value is fine. */
export const fieldError = (field: Field, value: string): string => {
  if (field.text !== undefined) return field.text.pattern.test(value) ? '' : field.text.message
  const text = cleanNumber(value)
  if (text === '') return 'Enter a number.'
  if (!/^-?\d+(?:\.\d+)?$/u.test(text)) return 'Use digits only.'
  const n = Number(text)
  const min = field.min ?? 0
  if (field.integer === true && !Number.isInteger(n)) return 'Use a whole number.'
  if (n < min) return `Must be at least ${min}.`
  if (field.max !== undefined && n > field.max) return `Must be at most ${field.max}.`
  return ''
}

/** The values as the single text a tool's `run` reads. */
export const joinValues = (fields: ReadonlyArray<Field>, values: ReadonlyArray<string>): string =>
  fields
    .map((field, index) =>
      field.text === undefined ? cleanNumber(values[index] ?? '') : (values[index] ?? '').trim(),
    )
    .join(' ')

const fieldCls = css({ display: 'flex', flexDirection: 'column', gap: '0.35rem', minWidth: 0 })
const labelCls = css({ fontSize: '0.85rem', fontWeight: 550 })
const wrapCls = css({
  position: 'relative',
  '& input': { width: '100%', paddingRight: '4.2rem', fontFamily: 'var(--mono)' },
  '& input[aria-invalid="true"]': { outline: '1.5px solid var(--danger)', outlineOffset: '-1px' },
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
const errorCls = css({ margin: 0, color: 'var(--danger)', fontSize: '0.78rem' })
const smallLabelCls = css({
  fontFamily: 'var(--mono)',
  fontSize: '0.68rem',
  fontWeight: 500,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: 'var(--muted-foreground)',
})

/** A labelled input with its unit, its presets, and its error in place. */
export const inputField = <M>(
  h: HtmlBuilder<M>,
  props: Readonly<{
    id: string
    field: Field
    suffix: string | undefined
    value: string
    error: string
    onInput: (value: string) => M
  }>,
): Html =>
  h.div(
    [h.Class(fieldCls)],
    [
      h.label([h.Class(labelCls), h.For(props.id)], [props.field.label]),
      h.div(
        [h.Class(wrapCls)],
        [
          Elements.input(h, { type: 'text' }, [
            h.Id(props.id),
            h.Value(props.value),
            h.InputMode(props.field.text === undefined ? 'decimal' : 'text'),
            h.Spellcheck(false),
            h.AriaInvalid(props.error !== ''),
            h.OnInput(props.onInput),
          ]),
          props.suffix === undefined ? null : h.span([h.Class(suffixCls)], [props.suffix]),
        ],
      ),
      props.error === '' ? null : h.p([h.Role('alert'), h.Class(errorCls)], [props.error]),
      props.field.presets === undefined
        ? null
        : segmented(h, {
            label: `${props.field.label} presets`,
            value: props.value,
            options: props.field.presets.map((preset) => ({ value: preset, label: preset })),
            onSelect: props.onInput,
          }),
    ],
  )

export const smallLabel = <M>(h: HtmlBuilder<M>, text: string): Html =>
  h.span([h.Class(smallLabelCls)], [text])

const layoutCls = css({
  display: 'grid',
  gap: '1rem',
  alignItems: 'start',
  gridTemplateColumns: 'minmax(0, 1fr)',
  '@media (min-width: 60rem)': { gridTemplateColumns: 'minmax(16rem, 20rem) minmax(0, 1fr)' },
})

/** Controls on the left, the result beside them when there is room and under them when not. */
export const layout = <M>(
  h: HtmlBuilder<M>,
  controls: ReadonlyArray<Html>,
  result: ReadonlyArray<Html>,
): Html => h.div([h.Class(layoutCls)], [panel(h, null, controls), h.div([h.Class(stack)], result)])

export const copyButton = <M>(h: HtmlBuilder<M>, text: string): Html =>
  text === '' ? null : Elements.copyButton(h, false, h.Attribute('data-copy', text))

const heroCls = css({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.3rem',
  padding: '1.1rem 3.4rem 1.2rem 1.3rem',
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
  '& > [data-slot="copy-button"]': { position: 'absolute', top: '0.6rem', right: '0.6rem' },
})
const heroValueCls = css({
  fontFamily: 'var(--mono)',
  fontSize: 'clamp(1.8rem, 5vw, 3rem)',
  fontWeight: 500,
  letterSpacing: '-0.03em',
  lineHeight: 1.1,
  fontVariantNumeric: 'tabular-nums',
  color: 'var(--tone-ink)',
  overflowWrap: 'anywhere',
})

/** The headline answer, with a copy button. */
export const hero = <M>(
  h: HtmlBuilder<M>,
  label: string,
  value: string,
  extra: ReadonlyArray<Html> = [],
): Html =>
  h.div(
    [h.Class(heroCls)],
    [
      smallLabel(h, label),
      h.span([h.Class(heroValueCls)], [value]),
      ...extra,
      copyButton(h, value),
    ],
  )

const codeCls = css({
  position: 'relative',
  padding: '1.2rem 3.4rem 1.2rem 1.3rem',
  borderRadius: 'calc(var(--radius) * 1.4)',
  background: 'var(--card)',
  boxShadow: 'var(--elev-card)',
  fontFamily: 'var(--mono)',
  fontSize: 'clamp(1.1rem, 2.6vw, 1.7rem)',
  letterSpacing: '0.04em',
  wordBreak: 'break-all',
  '& [data-kind=digit]': { color: 'oklch(0.55 0.2 255)' },
  '& [data-kind=symbol]': { color: 'oklch(0.58 0.22 25)' },
  '& > [data-slot="copy-button"]': { position: 'absolute', top: '0.6rem', right: '0.6rem' },
})

const kindOf = (char: string): string =>
  /\d/u.test(char) ? 'digit' : /[a-z]/iu.test(char) ? 'letter' : 'symbol'

/** A generated string in large type, digits and symbols coloured, with a copy button. */
export const secretBox = <M>(h: HtmlBuilder<M>, label: string, text: string): Html =>
  h.div(
    [h.Class(codeCls)],
    [
      h.div(
        [h.AriaLabel(label), h.Tabindex(0)],
        [...text].map((char) => h.span([h.Attribute('data-kind', kindOf(char))], [char])),
      ),
      copyButton(h, text),
    ],
  )

const alertCls = css({
  margin: 0,
  padding: '0.8rem 1rem',
  borderRadius: 'var(--radius)',
  background: 'var(--warn-soft)',
  fontSize: '0.88rem',
})

export const failure = <M>(h: HtmlBuilder<M>, message: string): Html =>
  h.p([h.Role('alert'), h.Class(alertCls)], [message])

// ── Generators ──────────────────────────────────────────────────────────────

export type RollContext = Readonly<{
  /** The latest output of `run`, or an empty string while the inputs are invalid. */
  out: string
  /** Earlier outputs, newest first, kept when the user rolls again. */
  history: ReadonlyArray<string>
  /** How many times a value has been drawn, for animations. */
  rolls: number
  values: ReadonlyArray<string>
  mode: string
}>

type GeneratorSpec = Readonly<{
  meta: Omit<ToolMeta, 'accepts'>
  fields: ReadonlyArray<Field>
  modes?: ReadonlyArray<Mode>
  modeLabel?: string
  /** The roll button's label. Leave it out for a tool whose answer only changes with its inputs. */
  action?: string
  run: (text: string, mode: string) => string
  view: <M>(h: HtmlBuilder<M>, context: RollContext) => Html
}>

const Model = Schema.Struct({
  values: Schema.Array(Schema.String),
  mode: Schema.String,
  out: Schema.String,
  error: Schema.String,
  history: Schema.Array(Schema.String),
  rolls: Schema.Finite,
})
type Model = typeof Model.Type

const Message = defineMessageUnion({
  ChangedField: { index: Schema.Finite, value: Schema.String },
  ChangedMode: { mode: Schema.String },
  ClickedRoll: {},
  Rolled: { out: Schema.String, error: Schema.String, push: Schema.Boolean },
})
type Message = typeof Message.Type

const history = 12

export const defineGenerator = (spec: GeneratorSpec) => {
  const id = spec.meta.id
  const attempt = (
    values: ReadonlyArray<string>,
    mode: string,
  ): Readonly<{ out: string; error: string }> => {
    if (spec.fields.some((field, index) => fieldError(field, values[index] ?? '') !== '')) {
      return { out: '', error: '' }
    }
    try {
      return { out: spec.run(joinValues(spec.fields, values), mode), error: '' }
    } catch (error) {
      return { out: '', error: error instanceof Error ? error.message : 'Could not generate.' }
    }
  }

  const Roll = Command.define(`Roll${id}`, {
    args: { values: Schema.Array(Schema.String), mode: Schema.String, push: Schema.Boolean },
    messages: [Message.Rolled],
    execute: ({ values, mode, push }) =>
      Effect.sync(() => Message.Rolled({ ...attempt(values, mode), push })),
  })

  const reroll = (model: Model, push: boolean) => ({
    model,
    commands: [Roll({ values: model.values, mode: model.mode, push })],
  })

  const update = (model: Model, message: Message) =>
    Message.match<{ model: Model; commands?: ReadonlyArray<Command.Command<Message>> }>(message, {
      ChangedField: ({ index, value }) =>
        reroll(
          {
            ...model,
            values: model.values.map((current, at) => (at === index ? value : current)),
          },
          false,
        ),
      ChangedMode: ({ mode }) => reroll({ ...model, mode }, false),
      ClickedRoll: () => reroll(model, true),
      Rolled: ({ out, error, push }) => ({
        model: {
          ...model,
          out,
          error,
          rolls: model.rolls + 1,
          history:
            push && out !== '' && model.out !== ''
              ? [model.out, ...model.history].slice(0, history)
              : model.history,
        },
      }),
    })

  const view = Submodel.defineView<Model, Message>((model, h) => {
    const errors = spec.fields.map((field, index) => fieldError(field, model.values[index] ?? ''))
    return layout(
      h,
      [
        ...(spec.modes === undefined || spec.modes.length < 2
          ? []
          : [
              h.div(
                [h.Class(fieldCls)],
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
        spec.action === undefined
          ? null
          : h.div(
              [h.Class(row)],
              [
                button(
                  h,
                  { variant: 'primary' },
                  [h.OnClick(Message.ClickedRoll()), h.Disabled(errors.some((e) => e !== ''))],
                  [spec.action],
                ),
              ],
            ),
      ],
      [
        model.error !== ''
          ? failure(h, model.error)
          : model.out === ''
            ? null
            : spec.view(h, {
                out: model.out,
                history: model.history,
                rolls: model.rolls,
                values: model.values,
                mode: model.mode,
              }),
      ],
    )
  })

  return defineTool({
    meta: spec.meta,
    init: (): Model => {
      const values = spec.fields.map((field) => field.initial)
      const mode = spec.modes?.[0]?.id ?? ''
      return { values, mode, ...attempt(values, mode), history: [], rolls: 0 }
    },
    update,
    view,
  })
}
