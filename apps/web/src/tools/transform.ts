// Many tools are one text box in, one text box out, with a few modes. They differ only in
// the modes and in what `run` does, so this builds the Model, Messages, update and view.
import { Effect, Schema } from 'effect'
import { Command, File, Submodel } from 'foldkit'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { defineMessageUnion } from 'foldkit/message'
import { css } from '../../styled-system/css'
import { presentOutput, type Present } from './presenters.ts'
import { columns, field, hint, panel, segmented, stack, textArea } from './kit.ts'
import { defineTool, type ToolMeta } from './tool.ts'

type Mode = Readonly<{ id: string; label: string }>

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
}>

const Model = Schema.Struct({ input: Schema.String, mode: Schema.String })
type Model = typeof Model.Type

const Message = defineMessageUnion({
  ChangedInput: { input: Schema.String },
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

const update = (model: Model, message: Message) =>
  Message.match<{ model: Model; commands?: ReadonlyArray<Command.Command<Message>> }>(message, {
    ChangedInput: ({ input }) => ({ model: { ...model, input } }),
    ChangedMode: ({ mode }) => ({ model: { ...model, mode } }),
    DroppedFiles: ({ files }) => {
      const first = files[0]
      return first === undefined ? { model } : { model, commands: [LoadText({ file: first })] }
    },
    LoadedText: ({ input }) => ({ model: { ...model, input } }),
    FailedLoad: () => ({ model }),
  })

const attempt = (spec: TransformSpec, model: Model): Readonly<{ value: string; error: string }> => {
  if (model.input === '') return { value: '', error: '' }
  try {
    return { value: spec.run(model.input, model.mode), error: '' }
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
              panel(h, null, [
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
              ]),
              panel(h, null, [
                field(
                  h,
                  { label: 'Output', for: `${id}-output` },
                  presentOutput(h, spec.present, spec.meta.category, model.input, result.value),
                ),
                result.error === ''
                  ? null
                  : h.p([h.Role('alert'), h.Class(errorCls)], [result.error]),
                model.input === '' ? hint(h, 'The result appears as you type.') : null,
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
    init: () => ({ input: spec.example ?? '', mode: spec.modes[0]?.id ?? '' }),
    update,
    view,
    ...(spec.acceptsFiles === true
      ? { receive: (files: ReadonlyArray<File>) => Message.DroppedFiles({ files }) }
      : {}),
  })
}
