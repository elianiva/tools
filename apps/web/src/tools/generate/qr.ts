import { Effect, Schema } from 'effect'
import { Command, Submodel } from 'foldkit'
import { defineMessageUnion } from 'foldkit/message'
import QRCode from 'qrcode'
import { css } from '../../../styled-system/css'
import { field, hint, panel, columns, segmented, stack, textArea } from '../kit.ts'
import { defineTool } from '../tool.ts'

const LEVELS = [
  { value: 'L', label: 'Low' },
  { value: 'M', label: 'Medium' },
  { value: 'Q', label: 'Quartile' },
  { value: 'H', label: 'High' },
] as const

const Model = Schema.Struct({
  text: Schema.String,
  level: Schema.String,
  url: Schema.String,
  failed: Schema.Boolean,
})
type Model = typeof Model.Type

const Message = defineMessageUnion({
  ChangedText: { text: Schema.String },
  ChangedLevel: { level: Schema.String },
  Drew: { text: Schema.String, level: Schema.String, url: Schema.String },
  FailedDraw: { text: Schema.String, level: Schema.String },
})
type Message = typeof Message.Type

const Draw = Command.define('DrawQr', {
  args: { text: Schema.String, level: Schema.String },
  messages: [Message.Drew, Message.FailedDraw],
  execute: ({ text, level }) =>
    Effect.tryPromise(() =>
      QRCode.toDataURL(text, {
        errorCorrectionLevel: level === 'L' || level === 'Q' || level === 'H' ? level : 'M',
        margin: 2,
        width: 640,
      }),
    ).pipe(
      Effect.map((url) => Message.Drew({ text, level, url })),
      Effect.orElseSucceed(() => Message.FailedDraw({ text, level })),
    ),
})

const redraw = (model: Model) =>
  model.text === ''
    ? { model: { ...model, url: '', failed: false } }
    : { model, commands: [Draw({ text: model.text, level: model.level })] }

const update = (model: Model, message: Message) =>
  Message.match<{ model: Model; commands?: ReadonlyArray<Command.Command<Message>> }>(message, {
    ChangedText: ({ text }) => redraw({ ...model, text }),
    ChangedLevel: ({ level }) => redraw({ ...model, level }),
    // An answer for text or a level the user has already changed is ignored.
    Drew: ({ text, level, url }) =>
      text === model.text && level === model.level
        ? { model: { ...model, url, failed: false } }
        : { model },
    FailedDraw: ({ text, level }) =>
      text === model.text && level === model.level
        ? { model: { ...model, url: '', failed: true } }
        : { model },
  })

const imageCls = css({
  width: '100%',
  maxWidth: '20rem',
  aspectRatio: '1',
  borderRadius: 'var(--radius)',
  background: '#fff',
  boxShadow: 'var(--elev-card)',
  imageRendering: 'pixelated',
})
const downloadCls = css({
  alignSelf: 'flex-start',
  padding: '0.45rem 0.9rem',
  borderRadius: '8px',
  background: 'linear-gradient(var(--primary-fill-top), var(--primary-fill-bottom))',
  boxShadow: 'var(--elev-primary)',
  color: 'var(--primary-foreground)',
  fontSize: '0.85rem',
  fontWeight: 500,
  textDecoration: 'none',
})

/** The code as an SVG data URL, drawn without waiting, so the first view is not empty. */
const sketch = (text: string, level: string): string => {
  try {
    const { modules } = QRCode.create(text, {
      errorCorrectionLevel: level === 'L' || level === 'Q' || level === 'H' ? level : 'M',
    })
    const size = modules.size
    const cells: string[] = []
    for (let y = 0; y < size; y += 1)
      for (let x = 0; x < size; x += 1)
        if (modules.get(x, y) !== 0) cells.push(`M${x + 2} ${y + 2}h1v1h-1z`)
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size + 4} ${size + 4}" shape-rendering="crispEdges"><rect width="100%" height="100%" fill="#fff"/><path d="${cells.join('')}"/></svg>`
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
  } catch {
    return ''
  }
}

const view = Submodel.defineView<Model, Message>((model, h) => {
  const shown =
    model.url !== '' ? model.url : model.text === '' ? '' : sketch(model.text, model.level)
  return h.div(
    [h.Class(stack)],
    [
      columns(h, [
        panel(h, null, [
          field(
            h,
            { label: 'Text or link', for: 'qr-text' },
            textArea(h, {
              id: 'qr-text',
              value: model.text,
              placeholder: 'https://example.com',
              rows: 6,
              onInput: (text) => Message.ChangedText({ text }),
            }),
          ),
          segmented(h, {
            label: 'Error correction',
            value: model.level,
            options: LEVELS,
            onSelect: (level) => Message.ChangedLevel({ level }),
          }),
          hint(h, 'Higher correction survives more damage but needs a denser code.'),
        ]),
        panel(h, null, [
          model.failed
            ? h.p([h.Role('alert')], ['This text is too long for a QR code at this level.'])
            : shown === ''
              ? hint(h, 'Your code appears here.')
              : h.img([h.Class(imageCls), h.Src(shown), h.Alt('QR code')]),
          shown === ''
            ? null
            : h.a(
                [
                  h.Class(downloadCls),
                  h.Href(shown),
                  h.Download(model.url === '' ? 'qr-code.svg' : 'qr-code.png'),
                ],
                [model.url === '' ? 'Download SVG' : 'Download PNG'],
              ),
        ]),
      ]),
    ],
  )
})

export const qrCode = defineTool({
  meta: {
    id: 'qr',
    name: 'QR code generator',
    category: 'generate',
    description: 'Turn a link or text into a QR code you can download.',
    keywords: ['qr', 'barcode', 'link', 'url', 'wifi', 'scan'],
  },
  init: () => ({ text: 'https://tools.elianiva.com', level: 'M', url: '', failed: false }),
  update,
  view,
})
