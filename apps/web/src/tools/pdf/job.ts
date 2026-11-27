// A tool that takes files, applies a few options, and hands back files. The PDF tools differ
// only in their options and in the engine function they run, so this builds the rest.
import { Effect, Schema } from 'effect'
import { Command, File, Submodel } from 'foldkit'
import { zipSync } from 'fflate'
import { defineMessageUnion } from 'foldkit/message'
import { css } from '../../../styled-system/css'
import {
  button,
  dropzone,
  field,
  hint,
  output,
  panel,
  row,
  segmented,
  stack,
  textInput,
} from '../kit.ts'
import { defineTool, type ToolMeta } from '../tool.ts'
import { formatBytes } from '../images/convert.logic.ts'
import type { Options, Result } from './engine.ts'

type OptionSpec = Readonly<{
  key: string
  label: string
  /** Shown while this returns true. Receives the current options. */
  when?: (options: Options) => boolean
  hint?: string
  initial: string
  choices?: ReadonlyArray<Readonly<{ value: string; label: string }>>
  placeholder?: string
}>

type JobSpec = Readonly<{
  meta: Omit<ToolMeta, 'accepts'>
  accept: ReadonlyArray<string>
  /** True when the tool takes several files and their order matters. */
  many: boolean
  title: string
  detail: string
  options: ReadonlyArray<OptionSpec>
  action: string
  /** Run as soon as files arrive, as the inspector does. */
  auto?: boolean
  run: (files: ReadonlyArray<globalThis.File>, options: Options) => Promise<Result>
}>

const Out = Schema.Struct({ name: Schema.String, url: Schema.String, size: Schema.Finite })

const Model = Schema.Struct({
  files: Schema.Array(File.File),
  options: Schema.Record(Schema.String, Schema.String),
  status: Schema.Literals(['idle', 'working', 'done', 'failed']),
  /** Bumped by every run and every change to the files, so a late answer is ignored. */
  run: Schema.Finite,
  outputs: Schema.Array(Out),
  zipUrl: Schema.String,
  text: Schema.String,
  note: Schema.String,
  error: Schema.String,
})
type Model = typeof Model.Type

const Message = defineMessageUnion({
  AddedFiles: { files: Schema.Array(File.File) },
  ChangedOption: { key: Schema.String, value: Schema.String },
  MovedFile: { index: Schema.Finite, by: Schema.Finite },
  ClickedRemove: { index: Schema.Finite },
  ClickedClear: {},
  ClickedRun: {},
  Finished: {
    run: Schema.Finite,
    outputs: Schema.Array(Out),
    zipUrl: Schema.String,
    text: Schema.String,
    note: Schema.String,
  },
  Failed: { run: Schema.Finite, message: Schema.String },
  CompletedCleanup: {},
})
type Message = typeof Message.Type

const Revoke = Command.define('RevokeUrls', {
  args: { urls: Schema.Array(Schema.String) },
  messages: [Message.CompletedCleanup],
  execute: ({ urls }) =>
    Effect.sync(() => {
      for (const url of urls) if (url !== '') URL.revokeObjectURL(url)
    }).pipe(Effect.as(Message.CompletedCleanup())),
})

const urlsOf = (model: Model): ReadonlyArray<string> => [
  ...model.outputs.map((out) => out.url),
  model.zipUrl,
]

export const defineJob = (spec: JobSpec) => {
  const Run = Command.define(`Run-${spec.meta.id}`, {
    args: {
      run: Schema.Finite,
      files: Schema.Array(File.File),
      options: Schema.Record(Schema.String, Schema.String),
    },
    messages: [Message.Finished, Message.Failed],
    execute: ({ run, files, options }) =>
      Effect.tryPromise({
        try: async () => {
          const result = await spec.run(files, options)
          const outputs = result.outputs.map((out) => ({
            name: out.name,
            url: URL.createObjectURL(out.blob),
            size: out.blob.size,
          }))
          let zipUrl = ''
          if (result.outputs.length > 1) {
            const entries: Record<string, Uint8Array> = {}
            for (const out of result.outputs)
              entries[out.name] = new Uint8Array(await out.blob.arrayBuffer())
            zipUrl = URL.createObjectURL(
              new Blob([zipSync(entries, { level: 0 }) as BlobPart], { type: 'application/zip' }),
            )
          }
          return Message.Finished({
            run,
            outputs,
            zipUrl,
            text: result.text ?? '',
            note: result.note ?? '',
          })
        },
        catch: (error) => (error instanceof Error ? error.message : 'Something went wrong.'),
      }).pipe(Effect.catch((message) => Effect.succeed(Message.Failed({ run, message })))),
  })

  const optionsOf = (model: Model): Options => model.options

  const start = (model: Model) => {
    const next: Model = {
      ...model,
      run: model.run + 1,
      status: 'working',
      outputs: [],
      zipUrl: '',
      text: '',
      note: '',
      error: '',
    }
    return {
      model: next,
      commands: [
        Revoke({ urls: urlsOf(model) }),
        Run({ run: next.run, files: next.files, options: optionsOf(next) }),
      ],
    }
  }

  /** Files changed: the old answer no longer matches them. */
  const filesChanged = (model: Model, files: ReadonlyArray<globalThis.File>) => {
    const next: Model = {
      ...model,
      files,
      run: model.run + 1,
      status: 'idle',
      outputs: [],
      zipUrl: '',
      text: '',
      note: '',
      error: '',
    }
    if (spec.auto === true && files.length > 0) return start(next)
    return { model: next, commands: [Revoke({ urls: urlsOf(model) })] }
  }

  const update = (model: Model, message: Message) =>
    Message.match<{ model: Model; commands?: ReadonlyArray<Command.Command<Message>> }>(message, {
      AddedFiles: ({ files }) => {
        const accepted = files.filter((file) =>
          spec.accept.some((pattern) =>
            pattern.startsWith('.')
              ? file.name.toLowerCase().endsWith(pattern)
              : pattern.endsWith('/*')
                ? file.type.startsWith(pattern.slice(0, -1))
                : file.type === pattern,
          ),
        )
        if (accepted.length === 0) return { model: { ...model, error: spec.detail } }
        return filesChanged(model, spec.many ? [...model.files, ...accepted] : accepted.slice(0, 1))
      },
      ChangedOption: ({ key, value }) => ({
        model: {
          ...model,
          options: { ...model.options, [key]: value },
          ...(model.status === 'done' || model.status === 'failed'
            ? { status: 'idle' as const, error: '' }
            : {}),
        },
      }),
      MovedFile: ({ index, by }) => {
        const target = index + by
        if (target < 0 || target >= model.files.length) return { model }
        const files = [...model.files]
        const moved = files[index]
        const other = files[target]
        if (moved === undefined || other === undefined) return { model }
        files[index] = other
        files[target] = moved
        return filesChanged(model, files)
      },
      ClickedRemove: ({ index }) =>
        filesChanged(
          model,
          model.files.filter((_, at) => at !== index),
        ),
      ClickedClear: () => filesChanged(model, []),
      ClickedRun: () => (model.files.length === 0 ? { model } : start(model)),
      Finished: ({ run, outputs, zipUrl, text, note }) =>
        run !== model.run
          ? { model, commands: [Revoke({ urls: [...outputs.map((out) => out.url), zipUrl] })] }
          : { model: { ...model, status: 'done', outputs, zipUrl, text, note } },
      Failed: ({ run, message }) =>
        run !== model.run ? { model } : { model: { ...model, status: 'failed', error: message } },
      CompletedCleanup: () => ({ model }),
    })

  const listCls = css({
    listStyle: 'none',
    margin: 0,
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  })
  const itemCls = css({
    display: 'grid',
    gridTemplateColumns: 'auto minmax(0, 1fr) auto',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.55rem 0.85rem',
    borderRadius: 'var(--radius)',
    background: 'var(--well)',
    boxShadow: 'var(--elev-well)',
    '& strong': {
      display: 'block',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      fontWeight: 550,
    },
    '& small, & > span:first-child': {
      color: 'var(--muted-foreground)',
      fontFamily: 'var(--mono)',
      fontSize: '0.75rem',
    },
    '& a[download]': {
      padding: '0.35rem 0.8rem',
      borderRadius: '8px',
      background: 'linear-gradient(var(--primary-fill-top), var(--primary-fill-bottom))',
      boxShadow: 'var(--elev-primary)',
      color: 'var(--primary-foreground)',
      fontSize: '0.85rem',
      fontWeight: 500,
      textDecoration: 'none',
    },
  })
  const errorCls = css({
    margin: 0,
    color: 'var(--danger)',
    fontSize: '0.85rem',
    fontFamily: 'var(--mono)',
  })
  const id = spec.meta.id

  const view = Submodel.defineView<Model, Message>((model, h) => {
    const working = model.status === 'working'
    const shown = spec.options.filter((option) => option.when?.(model.options) ?? true)
    return h.div(
      [h.Class(stack)],
      [
        dropzone(h, {
          id: `${id}-files`,
          accept: spec.accept,
          multiple: spec.many,
          title: spec.title,
          detail: spec.detail,
          onFiles: (files) => Message.AddedFiles({ files }),
        }),
        model.files.length === 0
          ? null
          : panel(h, spec.many ? `${model.files.length} files, in this order` : 'File', [
              h.ul(
                [h.Class(listCls)],
                model.files.map((file, index) =>
                  h.li(
                    [h.Key(`${index}-${file.name}-${file.size}`), h.Class(itemCls)],
                    [
                      h.span([], [String(index + 1)]),
                      h.div([], [h.strong([], [file.name]), h.small([], [formatBytes(file.size)])]),
                      h.div(
                        [h.Class(row)],
                        [
                          ...(spec.many
                            ? [
                                button(
                                  h,
                                  { variant: 'ghost', size: 'sm' },
                                  [
                                    h.AriaLabel(`Move ${file.name} up`),
                                    h.Disabled(index === 0),
                                    h.OnClick(Message.MovedFile({ index, by: -1 })),
                                  ],
                                  ['↑'],
                                ),
                                button(
                                  h,
                                  { variant: 'ghost', size: 'sm' },
                                  [
                                    h.AriaLabel(`Move ${file.name} down`),
                                    h.Disabled(index === model.files.length - 1),
                                    h.OnClick(Message.MovedFile({ index, by: 1 })),
                                  ],
                                  ['↓'],
                                ),
                              ]
                            : []),
                          button(
                            h,
                            { variant: 'ghost', size: 'sm' },
                            [
                              h.AriaLabel(`Remove ${file.name}`),
                              h.OnClick(Message.ClickedRemove({ index })),
                            ],
                            ['×'],
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ]),
        shown.length === 0
          ? null
          : panel(
              h,
              'Options',
              shown.map((option) => {
                const value = model.options[option.key] ?? option.initial
                return option.choices === undefined
                  ? field(
                      h,
                      {
                        label: option.label,
                        for: `${id}-${option.key}`,
                        ...(option.hint === undefined ? {} : { hint: option.hint }),
                      },
                      textInput(h, {
                        id: `${id}-${option.key}`,
                        value,
                        ...(option.placeholder === undefined
                          ? {}
                          : { placeholder: option.placeholder }),
                        onInput: (next) => Message.ChangedOption({ key: option.key, value: next }),
                      }),
                    )
                  : h.div(
                      [h.Class(css({ display: 'flex', flexDirection: 'column', gap: '0.35rem' }))],
                      [
                        h.span(
                          [h.Class(css({ fontSize: '0.85rem', fontWeight: 550 }))],
                          [option.label],
                        ),
                        segmented(h, {
                          label: option.label,
                          value,
                          options: option.choices,
                          onSelect: (next) =>
                            Message.ChangedOption({ key: option.key, value: next }),
                        }),
                        option.hint === undefined ? null : hint(h, option.hint),
                      ],
                    )
              }),
            ),
        spec.auto === true
          ? null
          : h.div(
              [h.Class(row)],
              [
                button(
                  h,
                  { variant: 'primary' },
                  [
                    h.Disabled(model.files.length === 0 || working),
                    h.OnClick(Message.ClickedRun()),
                  ],
                  [working ? 'Working…' : spec.action],
                ),
                model.files.length === 0
                  ? null
                  : button(h, { variant: 'ghost' }, [h.OnClick(Message.ClickedClear())], ['Clear']),
              ],
            ),
        model.error === '' ? null : h.p([h.Role('alert'), h.Class(errorCls)], [model.error]),
        model.status !== 'done'
          ? model.files.length === 0 && model.error === ''
            ? hint(h, 'Files stay on this device.')
            : null
          : panel(h, model.note === '' ? 'Result' : model.note, [
              model.text === '' ? null : output(h, { label: 'Result', value: model.text }),
              model.outputs.length === 0
                ? null
                : h.ul(
                    [h.Class(listCls)],
                    model.outputs.map((out) =>
                      h.li(
                        [h.Key(out.url), h.Class(itemCls)],
                        [
                          h.span([], ['✓']),
                          h.div(
                            [],
                            [h.strong([], [out.name]), h.small([], [formatBytes(out.size)])],
                          ),
                          h.a([h.Href(out.url), h.Download(out.name)], ['Download']),
                        ],
                      ),
                    ),
                  ),
              model.zipUrl === ''
                ? null
                : h.div(
                    [h.Class(row)],
                    [h.a([h.Href(model.zipUrl), h.Download(`${id}.zip`)], ['Download all as ZIP'])],
                  ),
            ]),
      ],
    )
  })

  return defineTool({
    meta: { ...spec.meta, accepts: spec.accept },
    init: (): Model => ({
      files: [],
      options: Object.fromEntries(spec.options.map((option) => [option.key, option.initial])),
      status: 'idle',
      run: 0,
      outputs: [],
      zipUrl: '',
      text: '',
      note: '',
      error: '',
    }),
    update,
    view,
    receive: (files: ReadonlyArray<globalThis.File>) => Message.AddedFiles({ files }),
  })
}
