import { Schema } from 'effect'
import { Submodel } from 'foldkit'
import { defineMessageUnion } from 'foldkit/message'
import { css } from '../../../styled-system/css'
import { columns, field, hint, panel, segmented, stack, stats, textArea } from '../kit.ts'
import { defineTool } from '../tool.ts'
import { compare, countChanges } from './diff.logic.ts'

const Model = Schema.Struct({ before: Schema.String, after: Schema.String, mode: Schema.String })
type Model = typeof Model.Type

const Message = defineMessageUnion({
  ChangedBefore: { before: Schema.String },
  ChangedAfter: { after: Schema.String },
  ChangedMode: { mode: Schema.String },
})
type Message = typeof Message.Type

const update = (model: Model, message: Message) =>
  Message.match<{ model: Model }>(message, {
    ChangedBefore: ({ before }) => ({ model: { ...model, before } }),
    ChangedAfter: ({ after }) => ({ model: { ...model, after } }),
    ChangedMode: ({ mode }) => ({ model: { ...model, mode } }),
  })

const resultCls = css({
  margin: 0,
  padding: '0.8rem 0.9rem',
  maxHeight: '32rem',
  overflow: 'auto',
  borderRadius: 'var(--radius)',
  background: 'var(--well)',
  boxShadow: 'var(--elev-well)',
  fontFamily: 'var(--mono)',
  fontSize: '0.82rem',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
  '& ins': { background: 'var(--ok-soft)', color: 'var(--ok)', textDecoration: 'none' },
  '& del': { background: 'var(--danger-soft)', color: 'var(--danger)' },
})

const view = Submodel.defineView<Model, Message>((model, h) => {
  const parts = compare(model.before, model.after, model.mode)
  const { added, removed } = countChanges(parts)
  const identical = added === 0 && removed === 0
  return h.div(
    [h.Class(stack)],
    [
      segmented(h, {
        label: 'Compare by',
        value: model.mode,
        options: [
          { value: 'lines', label: 'Lines' },
          { value: 'words', label: 'Words' },
          { value: 'chars', label: 'Characters' },
        ],
        onSelect: (mode) => Message.ChangedMode({ mode }),
      }),
      columns(h, [
        panel(h, null, [
          field(
            h,
            { label: 'Original', for: 'diff-before' },
            textArea(h, {
              id: 'diff-before',
              value: model.before,
              placeholder: 'Original text',
              rows: 10,
              onInput: (before) => Message.ChangedBefore({ before }),
            }),
          ),
        ]),
        panel(h, null, [
          field(
            h,
            { label: 'Changed', for: 'diff-after' },
            textArea(h, {
              id: 'diff-after',
              value: model.after,
              placeholder: 'Changed text',
              rows: 10,
              onInput: (after) => Message.ChangedAfter({ after }),
            }),
          ),
        ]),
      ]),
      model.before === '' && model.after === ''
        ? hint(h, 'Paste two texts to see what changed.')
        : panel(h, 'Difference', [
            stats(h, [
              ['Added', String(added)],
              ['Removed', String(removed)],
            ]),
            identical
              ? hint(h, 'The texts are identical.')
              : h.pre(
                  [h.Class(resultCls), h.Tabindex(0), h.AriaLabel('Difference')],
                  parts.map((part) =>
                    part.kind === 'add'
                      ? h.ins([], [part.text])
                      : part.kind === 'remove'
                        ? h.del([], [part.text])
                        : part.text,
                  ),
                ),
          ]),
    ],
  )
})

export const textDiff = defineTool({
  meta: {
    id: 'diff',
    name: 'Text diff',
    category: 'text',
    description: 'Compare two texts by line, word, or character.',
    keywords: ['compare', 'difference', 'changes', 'merge', 'versions'],
  },
  init: () => ({
    before: 'name: tools\nversion: 1.0.0\nlicense: MIT\nprivate: true',
    after: 'name: tools\nversion: 1.1.0\nlicense: MIT\nhomepage: tools.elianiva.com',
    mode: 'lines',
  }),
  update,
  view,
})
