import { Effect, Schema } from 'effect'
import { Command, Submodel } from 'foldkit'
import { defineMessageUnion } from 'foldkit/message'
import QRCode from 'qrcode'
import { css } from '../../../styled-system/css'
import { field, segmented, textArea } from '../kit.ts'
import { failure, layout, smallLabel } from './ui.ts'
import { defineTool } from '../tool.ts'

const LEVELS = [
  { value: 'L', label: 'Low 7%' },
  { value: 'M', label: 'Medium 15%' },
  { value: 'Q', label: 'Quartile 25%' },
  { value: 'H', label: 'High 30%' },
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
  maxWidth: '22rem',
  aspectRatio: '1',
  borderRadius: 'var(--radius)',
  background: '#fff',
  boxShadow: 'var(--elev-card)',
  imageRendering: 'pixelated',
})
const stageCls = css({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '1rem',
})
const emptyCls = css({
  display: 'grid',
  placeItems: 'center',
  width: '100%',
  maxWidth: '22rem',
  aspectRatio: '1',
  borderRadius: 'var(--radius)',
  background: 'var(--well)',
  boxShadow: 'var(--elev-well)',
  color: 'var(--muted-foreground)',
  fontSize: '0.85rem',
})
const downloadsCls = css({
  display: 'flex',
  gap: '0.6rem',
  '& a': {
    padding: '0.45rem 0.9rem',
    borderRadius: '8px',
    background: 'linear-gradient(var(--primary-fill-top), var(--primary-fill-bottom))',
    boxShadow: 'var(--elev-primary)',
    color: 'var(--primary-foreground)',
    fontSize: '0.85rem',
    fontWeight: 500,
    textDecoration: 'none',
  },
  '& a[data-secondary]': {
    background: 'linear-gradient(var(--raised-top), var(--raised-bottom))',
    boxShadow: 'var(--elev-raised)',
    color: 'var(--foreground)',
  },
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
  const svg = model.text === '' ? '' : sketch(model.text, model.level)
  const shown = model.url !== '' ? model.url : svg
  return layout(
    h,
    [
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
      h.div(
        [h.Class(css({ display: 'flex', flexDirection: 'column', gap: '0.35rem' }))],
        [
          smallLabel(h, 'Error correction'),
          segmented(h, {
            label: 'Error correction',
            value: model.level,
            options: LEVELS,
            onSelect: (level) => Message.ChangedLevel({ level }),
          }),
        ],
      ),
    ],
    [
      h.div(
        [h.Class(stageCls)],
        [
          model.failed || (model.text !== '' && svg === '')
            ? failure(h, 'This text is too long for a QR code at this level.')
            : shown === ''
              ? h.div([h.Class(emptyCls)], ['Enter text'])
              : h.img([h.Class(imageCls), h.Src(shown), h.Alt('QR code')]),
          shown === '' || svg === ''
            ? null
            : h.div(
                [h.Class(downloadsCls)],
                [
                  model.url === ''
                    ? null
                    : h.a([h.Href(model.url), h.Download('qr-code.png')], ['Download PNG']),
                  h.a(
                    [h.Href(svg), h.Download('qr-code.svg'), h.Attribute('data-secondary', '')],
                    ['Download SVG'],
                  ),
                ],
              ),
        ],
      ),
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
