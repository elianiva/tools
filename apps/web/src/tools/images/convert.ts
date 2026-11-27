import { Effect, Schema } from 'effect'
import { Command, File, Submodel } from 'foldkit'
import { zipSync } from 'fflate'
import { defineMessageUnion } from 'foldkit/message'
import { css } from '../../../styled-system/css'
import { badge, button, panel, range, row, segmented, stack, hint } from '../kit.ts'
import { defineTool } from '../tool.ts'
import { convertImage } from './convert.engine.ts'
import { FORMATS, formatBytes, formatOf, outputName, savedPercent } from './convert.logic.ts'

const Item = Schema.Struct({
  id: Schema.String,
  file: File.File,
  status: Schema.Literals(['working', 'done', 'failed']),
  out: Schema.NullOr(File.File),
  url: Schema.String,
  note: Schema.String,
})
type Item = typeof Item.Type

const Model = Schema.Struct({
  items: Schema.Array(Item),
  format: Schema.String,
  quality: Schema.Finite,
  maxWidth: Schema.Finite,
  /** Bumped when a setting changes, so an answer for the old settings is ignored. */
  run: Schema.Finite,
  next: Schema.Finite,
  zipUrl: Schema.String,
  dragging: Schema.Boolean,
})
type Model = typeof Model.Type

const Message = defineMessageUnion({
  AddedFiles: { files: Schema.Array(File.File) },
  DraggedOver: {},
  DraggedAway: {},
  ChangedFormat: { format: Schema.String },
  ChangedQuality: { quality: Schema.Finite },
  ChangedMaxWidth: { maxWidth: Schema.Finite },
  Converted: {
    id: Schema.String,
    run: Schema.Finite,
    out: File.File,
    url: Schema.String,
    note: Schema.String,
  },
  FailedConvert: { id: Schema.String, run: Schema.Finite, note: Schema.String },
  ClickedRemove: { id: Schema.String },
  ClickedClear: {},
  ClickedZip: {},
  ReadyZip: { url: Schema.String },
  CompletedCleanup: {},
})
type Message = typeof Message.Type

const Convert = Command.define('ConvertImage', {
  args: {
    id: Schema.String,
    run: Schema.Finite,
    file: File.File,
    format: Schema.String,
    quality: Schema.Finite,
    maxWidth: Schema.Finite,
  },
  messages: [Message.Converted, Message.FailedConvert],
  execute: ({ id, run, file, format, quality, maxWidth }) =>
    Effect.tryPromise(() => convertImage(file, formatOf(format).id, quality, maxWidth)).pipe(
      Effect.map(({ blob, note }) => {
        const out = new globalThis.File([blob], outputName(file.name, formatOf(format).ext), {
          type: blob.type,
        })
        return Message.Converted({ id, run, out, url: URL.createObjectURL(out), note })
      }),
      Effect.orElseSucceed(() =>
        Message.FailedConvert({ id, run, note: 'Could not read this image.' }),
      ),
    ),
})

const Revoke = Command.define('RevokeUrls', {
  args: { urls: Schema.Array(Schema.String) },
  messages: [Message.CompletedCleanup],
  execute: ({ urls }) =>
    Effect.sync(() => {
      for (const url of urls) if (url !== '') URL.revokeObjectURL(url)
    }).pipe(Effect.as(Message.CompletedCleanup())),
})

const Zip = Command.define('ZipImages', {
  args: { files: Schema.Array(File.File) },
  messages: [Message.ReadyZip],
  execute: ({ files }) =>
    Effect.promise(async () => {
      const taken = new Map<string, number>()
      const entries: Record<string, Uint8Array> = {}
      for (const file of files) {
        const count = taken.get(file.name) ?? 0
        taken.set(file.name, count + 1)
        const dot = file.name.lastIndexOf('.')
        const name =
          count === 0 ? file.name : `${file.name.slice(0, dot)}-${count}${file.name.slice(dot)}`
        entries[name] = new Uint8Array(await file.arrayBuffer())
      }
      const zip = zipSync(entries, { level: 0 })
      return Message.ReadyZip({
        url: URL.createObjectURL(new Blob([zip as BlobPart], { type: 'application/zip' })),
      })
    }),
})

const convertAll = (model: Model, items: ReadonlyArray<Item>) =>
  items.map((item) =>
    Convert({
      id: item.id,
      run: model.run,
      file: item.file,
      format: model.format,
      quality: model.quality,
      maxWidth: model.maxWidth,
    }),
  )

const urlsOf = (items: ReadonlyArray<Item>, zipUrl: string) => [
  ...items.map((item) => item.url),
  zipUrl,
]

const update = (model: Model, message: Message) =>
  Message.match<{ model: Model; commands?: ReadonlyArray<Command.Command<Message>> }>(message, {
    AddedFiles: ({ files }) => {
      const fresh: ReadonlyArray<Item> = files.map((file, index) => ({
        id: String(model.next + index),
        file,
        status: 'working',
        out: null,
        url: '',
        note: '',
      }))
      const next = {
        ...model,
        dragging: false,
        items: [...model.items, ...fresh],
        next: model.next + files.length,
      }
      return { model: next, commands: convertAll(next, fresh) }
    },
    DraggedOver: () => ({ model: { ...model, dragging: true } }),
    DraggedAway: () => ({ model: { ...model, dragging: false } }),
    ChangedFormat: ({ format }) => settingsChanged({ ...model, format }, model),
    ChangedQuality: ({ quality }) => settingsChanged({ ...model, quality }, model),
    ChangedMaxWidth: ({ maxWidth }) => settingsChanged({ ...model, maxWidth }, model),
    Converted: ({ id, run, out, url, note }) =>
      run !== model.run
        ? { model, commands: [Revoke({ urls: [url] })] }
        : {
            model: {
              ...model,
              items: model.items.map((item) =>
                item.id === id ? { ...item, status: 'done', out, url, note } : item,
              ),
            },
          },
    FailedConvert: ({ id, run, note }) =>
      run !== model.run
        ? { model }
        : {
            model: {
              ...model,
              items: model.items.map((item) =>
                item.id === id ? { ...item, status: 'failed', note } : item,
              ),
            },
          },
    ClickedRemove: ({ id }) => {
      const gone = model.items.filter((item) => item.id === id)
      return {
        model: { ...model, items: model.items.filter((item) => item.id !== id), zipUrl: '' },
        commands: [Revoke({ urls: urlsOf(gone, model.zipUrl) })],
      }
    },
    ClickedClear: () => ({
      model: { ...model, items: [], zipUrl: '' },
      commands: [Revoke({ urls: urlsOf(model.items, model.zipUrl) })],
    }),
    ClickedZip: () => ({
      model,
      commands: [
        Zip({ files: model.items.flatMap((item) => (item.out === null ? [] : [item.out])) }),
      ],
    }),
    ReadyZip: ({ url }) => ({ model: { ...model, zipUrl: url } }),
    CompletedCleanup: () => ({ model }),
  })

/** Every file is converted again with the new settings; the old outputs are released. */
const settingsChanged = (next: Model, before: Model) => {
  const reset = {
    ...next,
    run: before.run + 1,
    zipUrl: '',
    items: before.items.map((item): Item => ({
      ...item,
      status: 'working',
      out: null,
      url: '',
      note: '',
    })),
  }
  return {
    model: reset,
    commands: [
      Revoke({ urls: urlsOf(before.items, before.zipUrl) }),
      ...convertAll(reset, reset.items),
    ],
  }
}

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
  gridTemplateColumns: '3.5rem minmax(0, 1fr) auto',
  alignItems: 'center',
  gap: '0.75rem',
  padding: '0.6rem 0.75rem',
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
  '& small': { color: 'var(--muted-foreground)', fontFamily: 'var(--mono)', fontSize: '0.75rem' },
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
const thumbCls = css({
  width: '3.5rem',
  height: '3.5rem',
  borderRadius: '8px',
  objectFit: 'cover',
  background: 'var(--card)',
  boxShadow: 'var(--elev-card)',
})
const thumbEmptyCls = css({
  width: '3.5rem',
  height: '3.5rem',
  borderRadius: '8px',
  background: 'var(--card)',
  boxShadow: 'var(--elev-card)',
})
const sizesCls = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.25rem',
  marginBlockStart: '0.3rem',
  '& div': {
    display: 'grid',
    gridTemplateColumns: '1fr 5.5rem',
    alignItems: 'center',
    gap: '0.5rem',
  },
  '& i': {
    display: 'block',
    height: '6px',
    borderRadius: '999px',
    background: 'color-mix(in oklab, var(--foreground) 28%, transparent)',
    transition: 'width 300ms cubic-bezier(0.23, 1, 0.32, 1)',
  },
  '& i[data-after]': { background: 'var(--ok)' },
  '& i[data-after][data-grew]': { background: 'var(--warn)' },
  '& small': { textAlign: 'right' },
})
const gap = css({ display: 'flex', alignItems: 'center', gap: '0.5rem' })
const dropCls = css({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.3rem',
  minHeight: '9rem',
  padding: '1.5rem',
  borderRadius: 'calc(var(--radius) * 1.4)',
  background: 'var(--well)',
  boxShadow: 'var(--elev-well)',
  color: 'var(--muted-foreground)',
  textAlign: 'center',
  cursor: 'pointer',
  outline: '2px dashed transparent',
  outlineOffset: '-6px',
  transition: 'outline-color 150ms, color 150ms, background 150ms',
  '& *': { pointerEvents: 'none' },
  '& input': { position: 'absolute', width: 1, height: 1, opacity: 0 },
  '&:hover, &:has(input:focus-visible)': {
    outlineColor: 'color-mix(in oklab, var(--foreground) 30%, transparent)',
    color: 'var(--foreground)',
  },
  '&[data-dragging]': {
    outlineColor: 'var(--tone)',
    background: 'var(--tone-soft)',
    color: 'var(--foreground)',
  },
  '& strong': { color: 'var(--foreground)', fontWeight: 550 },
})

const sizeBars = (item: Item) => {
  const before = item.file.size
  const after = item.out?.size ?? 0
  const top = Math.max(before, after, 1)
  return { before: (before / top) * 100, after: (after / top) * 100, grew: after > before }
}

const WIDTHS = [
  { value: '0', label: 'Original' },
  { value: '3840', label: '3840' },
  { value: '1920', label: '1920' },
  { value: '1280', label: '1280' },
  { value: '640', label: '640' },
] as const

const view = Submodel.defineView<Model, Message>((model, h) => {
  const format = formatOf(model.format)
  const done = model.items.filter((item) => item.status === 'done')
  return h.div(
    [h.Class(stack)],
    [
      h.label(
        [
          h.Class(dropCls),
          h.For('image-files'),
          ...(model.dragging ? [h.Attribute('data-dragging', '')] : []),
          h.AllowDrop(),
          h.OnDragEnter(Message.DraggedOver()),
          h.OnDragLeave(Message.DraggedAway()),
          h.OnDropFiles((files) => Message.AddedFiles({ files })),
        ],
        [
          h.input([
            h.Id('image-files'),
            h.Type('file'),
            h.Accept('image/*,.heic,.heif'),
            h.Multiple(true),
            h.OnFileChange((files) => Message.AddedFiles({ files })),
          ]),
          h.strong(
            [],
            [model.dragging ? 'Drop to convert' : 'Drop images, paste them, or click to choose'],
          ),
          h.span([], ['PNG, JPG, WebP, AVIF, GIF, BMP, SVG and HEIC. They stay on this device.']),
        ],
      ),
      panel(h, 'Convert to', [
        segmented(h, {
          label: 'Output format',
          value: model.format,
          options: FORMATS.map((entry) => ({ value: entry.id as string, label: entry.label })),
          onSelect: (value) => Message.ChangedFormat({ format: value }),
        }),
        format.lossy
          ? h.div(
              [h.Class(gap)],
              [
                h.label([h.For('image-quality')], [`Quality ${model.quality}`]),
                range(h, {
                  id: 'image-quality',
                  min: 10,
                  max: 100,
                  value: model.quality,
                  onInput: (quality) => Message.ChangedQuality({ quality }),
                }),
              ],
            )
          : hint(h, 'PNG is lossless, so there is no quality setting.'),
        segmented(h, {
          label: 'Longest width',
          value: String(model.maxWidth),
          options: WIDTHS.map((width) => ({ value: width.value as string, label: width.label })),
          onSelect: (value) => Message.ChangedMaxWidth({ maxWidth: Number(value) }),
        }),
      ]),
      model.items.length === 0
        ? null
        : panel(h, `${model.items.length} ${model.items.length === 1 ? 'image' : 'images'}`, [
            h.ul(
              [h.Class(listCls)],
              model.items.map((item) =>
                h.li(
                  [h.Key(item.id), h.Class(itemCls)],
                  [
                    item.status === 'done'
                      ? h.img([h.Class(thumbCls), h.Src(item.url), h.Alt('')])
                      : h.div([h.Class(thumbEmptyCls)], []),
                    h.div(
                      [],
                      [
                        h.strong([], [item.out?.name ?? item.file.name]),
                        h.small(
                          [],
                          [
                            item.status === 'working'
                              ? `${formatBytes(item.file.size)} · converting…`
                              : item.status === 'failed'
                                ? item.note
                                : [saved(item), item.note]
                                    .filter((part) => part !== '')
                                    .join(' · '),
                          ],
                        ),
                        item.status === 'done'
                          ? h.div(
                              [h.Class(sizesCls)],
                              [
                                h.div(
                                  [],
                                  [
                                    h.i([h.Style({ width: `${sizeBars(item).before}%` })], []),
                                    h.small([], [formatBytes(item.file.size)]),
                                  ],
                                ),
                                h.div(
                                  [],
                                  [
                                    h.i(
                                      [
                                        h.Attribute('data-after', ''),
                                        ...(sizeBars(item).grew
                                          ? [h.Attribute('data-grew', '')]
                                          : []),
                                        h.Style({ width: `${sizeBars(item).after}%` }),
                                      ],
                                      [],
                                    ),
                                    h.small([], [formatBytes(item.out?.size ?? 0)]),
                                  ],
                                ),
                              ],
                            )
                          : null,
                      ],
                    ),
                    h.div(
                      [h.Class(gap)],
                      [
                        item.status === 'done'
                          ? h.a(
                              [h.Href(item.url), h.Download(item.out?.name ?? 'image')],
                              ['Download'],
                            )
                          : item.status === 'failed'
                            ? badge(h, 'error', ['Failed'])
                            : null,
                        button(
                          h,
                          { variant: 'ghost', size: 'sm' },
                          [
                            h.AriaLabel(`Remove ${item.file.name}`),
                            h.OnClick(Message.ClickedRemove({ id: item.id })),
                          ],
                          ['×'],
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            h.div(
              [h.Class(row)],
              [
                done.length > 1
                  ? model.zipUrl === ''
                    ? button(
                        h,
                        { variant: 'primary' },
                        [h.OnClick(Message.ClickedZip())],
                        ['Prepare ZIP'],
                      )
                    : h.a([h.Href(model.zipUrl), h.Download('images.zip')], ['Download ZIP'])
                  : null,
                button(h, { variant: 'ghost' }, [h.OnClick(Message.ClickedClear())], ['Clear all']),
              ],
            ),
          ]),
    ],
  )
})

const saved = (item: Item): string => {
  const pct = savedPercent(item.file.size, item.out?.size ?? 0)
  return pct >= 0 ? `${pct}% smaller` : `${-pct}% larger`
}

export const imageConverter = defineTool({
  meta: {
    id: 'image-converter',
    name: 'Image converter',
    category: 'images',
    description: 'Convert and shrink images between PNG, JPG, WebP, AVIF. Reads HEIC too.',
    keywords: ['png', 'jpg', 'jpeg', 'webp', 'avif', 'heic', 'compress', 'resize', 'photo'],
    accepts: ['image/*', '.heic', '.heif'],
  },
  init: () => ({
    items: [],
    format: 'webp',
    quality: 80,
    maxWidth: 0,
    run: 0,
    next: 0,
    zipUrl: '',
    dragging: false,
  }),
  update,
  view,
  receive: (files) => Message.AddedFiles({ files }),
})
