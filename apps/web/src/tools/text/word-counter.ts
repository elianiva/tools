import { Effect, Schema } from 'effect'
import { Command, File, Submodel } from 'foldkit'
import { defineMessageUnion } from 'foldkit/message'
import { columns, field, hint, meter, panel, row, stack, stats, textArea } from '../kit.ts'
import { defineTool } from '../tool.ts'
import { analyze, duration, keywords, LIMITS } from './word-counter.logic.ts'

const Model = Schema.Struct({ text: Schema.String })
type Model = typeof Model.Type

const Message = defineMessageUnion({
  ChangedText: { text: Schema.String },
  ClickedClear: {},
  DroppedFiles: { files: Schema.Array(File.File) },
  LoadedText: { text: Schema.String },
  FailedLoad: {},
})
type Message = typeof Message.Type

const LoadText = Command.define('LoadText', {
  args: { file: File.File },
  messages: [Message.LoadedText, Message.FailedLoad],
  execute: ({ file }) =>
    File.readAsText(file).pipe(
      Effect.map((text) => Message.LoadedText({ text })),
      Effect.orElseSucceed(() => Message.FailedLoad()),
    ),
})

const update = (model: Model, message: Message) =>
  Message.match<{ model: Model; commands?: ReadonlyArray<Command.Command<Message>> }>(message, {
    ChangedText: ({ text }) => ({ model: { text } }),
    ClickedClear: () => ({ model: { text: '' } }),
    DroppedFiles: ({ files }) => {
      const first = files[0]
      return first === undefined ? { model } : { model, commands: [LoadText({ file: first })] }
    },
    LoadedText: ({ text }) => ({ model: { text } }),
    FailedLoad: () => ({ model }),
  })

const view = Submodel.defineView<Model, Message>((model, h) => {
  const stat = analyze(model.text)
  const top = keywords(model.text)
  return h.div(
    [h.Class(stack)],
    [
      panel(h, null, [
        field(
          h,
          { label: 'Text', for: 'word-counter-text' },
          textArea(h, {
            id: 'word-counter-text',
            value: model.text,
            placeholder: 'Type, paste, or drop a text file',
            rows: 12,
            onInput: (text) => Message.ChangedText({ text }),
          }),
        ),
        h.div(
          [h.Class(row)],
          [
            h.button(
              [h.Type('button'), h.Disabled(model.text === ''), h.OnClick(Message.ClickedClear())],
              ['Clear'],
            ),
          ],
        ),
      ]),
      stats(h, [
        ['Words', String(stat.words)],
        ['Characters', String(stat.characters)],
        ['No spaces', String(stat.charactersNoSpaces)],
        ['Sentences', String(stat.sentences)],
        ['Paragraphs', String(stat.paragraphs)],
        ['Unique words', String(stat.uniqueWords)],
        ['Reading time', duration(stat.readingSeconds)],
        ['Speaking time', duration(stat.speakingSeconds)],
      ]),
      columns(h, [
        panel(
          h,
          'Limits',
          LIMITS.map((limit) =>
            meter(h, { label: limit.label, value: stat.characters, limit: limit.limit }),
          ),
        ),
        panel(
          h,
          'Top words',
          top.length === 0
            ? [hint(h, 'Words you use most appear here.')]
            : top.map((keyword) =>
                meter(h, {
                  label: keyword.word,
                  value: keyword.count,
                  limit: top[0]?.count ?? 1,
                  display: `${keyword.count} · ${keyword.percent.toFixed(1)}%`,
                }),
              ),
        ),
      ]),
    ],
  )
})

export const wordCounter = defineTool({
  meta: {
    id: 'word-counter',
    name: 'Word counter',
    category: 'text',
    description: 'Words, characters, reading time, and your most used words.',
    keywords: ['count', 'characters', 'reading time', 'keyword density', 'length'],
    accepts: ['text/plain', '.txt', '.md'],
  },
  init: () => ({
    text: 'Good tools stay out of the way. Paste your draft here and see how long it is, how long it takes to read, and which words you lean on most.\n\nShort sentences help. So do short paragraphs.',
  }),
  update,
  view,
  receive: (files) => Message.DroppedFiles({ files }),
})
