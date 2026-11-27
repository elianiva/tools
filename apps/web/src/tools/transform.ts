// Many tools are one text box in, one text box out, with a few modes. They differ only in
// the modes and in what `run` does, so this builds the Model, Messages, update and view.
import { Effect, Schema } from 'effect'
import { Command, File, Submodel } from 'foldkit'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { defineMessageUnion } from 'foldkit/message'
import { css } from '../../styled-system/css'
import { presentOutput, type Present } from './presenters.ts'
import {
  button,
  columns,
  field,
  hint,
  panel,
  row,
  segmented,
  stack,
  textArea,
  textInput,
} from './kit.ts'
import { defineTool, type ToolMeta } from './tool.ts'

type Mode = Readonly<{ id: string; label: string }>

/** One labelled input of a form tool. The values are joined with spaces into the text `run` reads. */
export type FormField = Readonly<{
  label: string
  kind?: 'number' | 'date' | 'time' | 'text'
  suffix?: string
  hint?: string
}>

type TransformSpec = Readonly<{
  meta: Omit<ToolMeta, 'accepts'>
  modes: ReadonlyArray<Mode>
  inputLabel?: string
  placeholder: string
  /** Returns the output. Throw an `Error` for input that cannot be processed: its message is shown. */
  run: (input: string, mode: string) => string
  /** A starting text so the tool shows what it does. Empty by default. */
  example?: string
  /** When set, a dropped text file is read into the input. */
  acceptsFiles?: boolean
  /** Put the output under the input at full width, for long output lines. */
  stacked?: boolean
  /** How the answer is drawn: swatches, chips, cards, or bars. */
  present?: Present
  /** Labelled inputs in place of the text box. Their values start from the words of `example`. */
  fields?: ReadonlyArray<FormField>
}>

const Model = Schema.Struct({
  input: Schema.String,
  mode: Schema.String,
  values: Schema.Array(Schema.String),
})
type Model = typeof Model.Type

const Message = defineMessageUnion({
  ChangedInput: { input: Schema.String },
  ChangedMode: { mode: Schema.String },
  ChangedField: { index: Schema.Number, value: Schema.String },
  ClickedClear: {},
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

const update = (model: Model, message: Message) =>
  Message.match<{ model: Model; commands?: ReadonlyArray<Command.Command<Message>> }>(message, {
    ChangedInput: ({ input }) => ({ model: { ...model, input } }),
    ChangedMode: ({ mode }) => ({ model: { ...model, mode } }),
    ChangedField: ({ index, value }) => ({
      model: {
        ...model,
        values: model.values.map((current, at) => (at === index ? value : current)),
      },
    }),
    DroppedFiles: ({ files }) => {
      const first = files[0]
      return first === undefined ? { model } : { model, commands: [LoadText({ file: first })] }
    },
    ClickedClear: () => ({ model: { ...model, input: '', values: model.values.map(() => '') } }),
    LoadedText: ({ input }) => ({ model: { ...model, input } }),
    FailedLoad: () => ({ model }),
  })

const inputOf = (spec: TransformSpec, model: Model): string =>
  spec.fields === undefined
    ? model.input
    : model.values.some((value) => value.trim() === '')
      ? ''
      : model.values.map((value) => value.trim()).join(' ')

const attempt = (spec: TransformSpec, model: Model): Readonly<{ value: string; error: string }> => {
  const input = inputOf(spec, model)
  if (input === '') return { value: '', error: '' }
  try {
    return { value: spec.run(input, model.mode), error: '' }
  } catch (error) {
    return {
      value: '',
      error: error instanceof Error ? error.message : 'Could not process this input.',
    }
  }
}

const stackedPanels = <M>(h: HtmlBuilder<M>, children: ReadonlyArray<Html>): Html =>
  h.div([h.Class(stack)], children)

const errorCls = css({
  margin: 0,
  color: 'var(--danger)',
  fontSize: '0.85rem',
  fontFamily: 'var(--mono)',
})

type Size = Readonly<{ chars: number; words: number; lines: number }>

const measure = (text: string): Size => ({
  chars: [...text].length,
  words: text.split(/\s+/u).filter((word) => word !== '').length,
  lines: text === '' ? 0 : text.split('\n').length,
})

const stripCls = css({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.3rem 1rem',
  fontFamily: 'var(--mono)',
  fontSize: '0.72rem',
  color: 'var(--muted-foreground)',
  '& b': { color: 'var(--foreground)', fontWeight: 600 },
  '& em': { fontStyle: 'normal', color: 'var(--tone, var(--primary))' },
})
const footCls = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '0.75rem',
  flexWrap: 'wrap',
})

const delta = (now: number, before: number): string =>
  now === before ? '' : ` ${now > before ? '+' : '−'}${Math.abs(now - before)}`

/** Counts under a text box, with how far the text moved from `from` when it is given. */
const stripView = <M>(h: HtmlBuilder<M>, size: Size, from?: Size): Html =>
  h.div(
    [h.Class(stripCls)],
    [
      ['chars', size.chars, from?.chars],
      ['words', size.words, from?.words],
      ['lines', size.lines, from?.lines],
    ].map(([label, now, before]) =>
      h.span(
        [],
        [
          h.b([], [String(now)]),
          ` ${String(label)}`,
          before === undefined ? '' : h.em([], [delta(Number(now), Number(before))]),
        ],
      ),
    ),
  )

const bigCls = css({ '& input': { fontSize: '1.6rem', padding: '0.9rem 1rem', height: 'auto' } })

const formCls = css({
  display: 'grid',
  gap: '1rem',
  gridTemplateColumns: 'repeat(auto-fit, minmax(11rem, 1fr))',
})
const inputWrapCls = css({
  position: 'relative',
  '& input': { width: '100%', paddingRight: '3.2rem', fontFamily: 'var(--mono)' },
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

export const defineTransform = (spec: TransformSpec) => {
  const id = spec.meta.id
  const view = Submodel.defineView<Model, Message>((model, h) => {
    const result = attempt(spec, model)
    return h.div(
      [],
      [
        h.div(
          [],
          spec.modes.length > 1
            ? [
                segmented(h, {
                  label: 'Mode',
                  value: model.mode,
                  options: spec.modes.map((mode) => ({ value: mode.id, label: mode.label })),
                  onSelect: (mode) => Message.ChangedMode({ mode }),
                }),
              ]
            : [],
        ),
        h.div(
          [h.Class(stack)],
          [
            (spec.stacked === true ? stackedPanels : columns)(h, [
              panel(
                h,
                null,
                spec.fields === undefined
                  ? [
                      field(
                        h,
                        { label: spec.inputLabel ?? 'Input', for: `${id}-input` },
                        textArea(h, {
                          id: `${id}-input`,
                          value: model.input,
                          placeholder: spec.placeholder,
                          rows: 14,
                          onInput: (input) => Message.ChangedInput({ input }),
                        }),
                      ),
                      h.div(
                        [h.Class(footCls)],
                        [
                          stripView(h, measure(model.input)),
                          h.div(
                            [h.Class(row)],
                            [
                              spec.example === undefined || model.input === spec.example
                                ? null
                                : button(
                                    h,
                                    { variant: 'ghost', size: 'sm' },
                                    [h.OnClick(Message.ChangedInput({ input: spec.example }))],
                                    ['Example'],
                                  ),
                              button(
                                h,
                                { variant: 'ghost', size: 'sm' },
                                [h.Disabled(model.input === ''), h.OnClick(Message.ClickedClear())],
                                ['Clear'],
                              ),
                            ],
                          ),
                        ],
                      ),
                    ]
                  : [
                      h.div(
                        [h.Class(spec.fields.length === 1 ? `${formCls} ${bigCls}` : formCls)],
                        spec.fields.map((item, index) =>
                          field(
                            h,
                            {
                              label: item.label,
                              for: `${id}-field-${index}`,
                              ...(item.hint === undefined ? {} : { hint: item.hint }),
                            },
                            h.div(
                              [h.Class(inputWrapCls)],
                              [
                                textInput(h, {
                                  id: `${id}-field-${index}`,
                                  value: model.values[index] ?? '',
                                  type: item.kind === 'text' ? 'text' : (item.kind ?? 'number'),
                                  onInput: (value) => Message.ChangedField({ index, value }),
                                }),
                                item.suffix === undefined
                                  ? null
                                  : h.span([h.Class(suffixCls)], [item.suffix]),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ],
              ),
              panel(h, null, [
                field(
                  h,
                  { label: 'Output', for: `${id}-output` },
                  presentOutput(
                    h,
                    spec.present,
                    spec.meta.category,
                    inputOf(spec, model),
                    result.value,
                  ),
                ),
                result.value !== '' && spec.fields === undefined && spec.present === undefined
                  ? h.div(
                      [h.Class(footCls)],
                      [
                        stripView(h, measure(result.value), measure(model.input)),
                        spec.meta.category === 'text' || spec.meta.category === 'developer'
                          ? button(
                              h,
                              { variant: 'ghost', size: 'sm' },
                              [h.OnClick(Message.ChangedInput({ input: result.value }))],
                              ['Use as input'],
                            )
                          : null,
                      ],
                    )
                  : null,
                result.error === ''
                  ? null
                  : h.p([h.Role('alert'), h.Class(errorCls)], [result.error]),
                inputOf(spec, model) === ''
                  ? hint(
                      h,
                      spec.fields === undefined
                        ? 'The result appears as you type.'
                        : 'Fill every field to see the result.',
                    )
                  : null,
              ]),
            ]),
          ],
        ),
      ],
    )
  })
  return defineTool({
    meta: {
      ...spec.meta,
      ...(spec.acceptsFiles === true ? { accepts: ['text/*', '.txt', '.json', '.md'] } : {}),
    },
    init: () => ({
      input: spec.example ?? '',
      mode: spec.modes[0]?.id ?? '',
      values: (spec.fields ?? []).map(
        (_, index) => (spec.example ?? '').split(/\s+/u)[index] ?? '',
      ),
    }),
    update,
    view,
    ...(spec.acceptsFiles === true
      ? { receive: (files: ReadonlyArray<File>) => Message.DroppedFiles({ files }) }
      : {}),
  })
}
