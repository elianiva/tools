import { Schema } from 'effect'
import { Submodel } from 'foldkit'
import { defineMessageUnion } from 'foldkit/message'
import { css } from '../../../styled-system/css'
import { checkbox, field, hint, panel, row, stack, stats, textArea, textInput } from '../kit.ts'
import { defineTool } from '../tool.ts'
import { runRegex, slices } from './regex.logic.ts'

const FLAGS = [
  { id: 'i', label: 'Ignore case' },
  { id: 'm', label: 'Multiline' },
  { id: 's', label: 'Dot matches newline' },
  { id: 'u', label: 'Unicode' },
] as const

const Model = Schema.Struct({ pattern: Schema.String, flags: Schema.String, text: Schema.String })
type Model = typeof Model.Type

const Message = defineMessageUnion({
  ChangedPattern: { pattern: Schema.String },
  ChangedText: { text: Schema.String },
  ToggledFlag: { flag: Schema.String },
})
type Message = typeof Message.Type

const update = (model: Model, message: Message) =>
  Message.match<{ model: Model }>(message, {
    ChangedPattern: ({ pattern }) => ({ model: { ...model, pattern } }),
    ChangedText: ({ text }) => ({ model: { ...model, text } }),
    ToggledFlag: ({ flag }) => ({
      model: {
        ...model,
        flags: model.flags.includes(flag) ? model.flags.replace(flag, '') : model.flags + flag,
      },
    }),
  })

const highlightCls = css({
  margin: 0,
  padding: '0.8rem 0.9rem',
  maxHeight: '24rem',
  overflow: 'auto',
  borderRadius: 'var(--radius)',
  background: 'var(--well)',
  boxShadow: 'var(--elev-well)',
  fontFamily: 'var(--mono)',
  fontSize: '0.82rem',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
  '& mark': {
    background: 'var(--warn-soft)',
    color: 'inherit',
    borderRadius: '3px',
    boxShadow: 'inset 0 0 0 1px var(--warn)',
  },
})
const listCls = css({
  margin: 0,
  padding: 0,
  listStyle: 'none',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.35rem',
  fontFamily: 'var(--mono)',
  fontSize: '0.8rem',
  '& li': { display: 'flex', gap: '0.75rem', flexWrap: 'wrap' },
  '& li > span:first-child': { color: 'var(--muted-foreground)', minWidth: '4rem' },
})
const errorCls = css({
  margin: 0,
  color: 'var(--danger)',
  fontFamily: 'var(--mono)',
  fontSize: '0.85rem',
})

const view = Submodel.defineView<Model, Message>((model, h) => {
  const run = runRegex(model.pattern, model.flags, model.text)
  return h.div(
    [h.Class(stack)],
    [
      panel(h, null, [
        field(
          h,
          { label: 'Pattern', for: 'regex-pattern' },
          textInput(h, {
            id: 'regex-pattern',
            value: model.pattern,
            placeholder: '(\\w+)@(\\w+)\\.com',
            onInput: (pattern) => Message.ChangedPattern({ pattern }),
          }),
        ),
        h.div(
          [h.Class(row)],
          FLAGS.map((flag) =>
            checkbox(h, {
              id: `regex-${flag.id}`,
              label: flag.label,
              checked: model.flags.includes(flag.id),
              onToggle: Message.ToggledFlag({ flag: flag.id }),
            }),
          ),
        ),
        run.error === '' ? null : h.p([h.Role('alert'), h.Class(errorCls)], [run.error]),
      ]),
      panel(h, null, [
        field(
          h,
          { label: 'Test text', for: 'regex-text' },
          textArea(h, {
            id: 'regex-text',
            value: model.text,
            placeholder: 'Text to search',
            rows: 8,
            onInput: (text) => Message.ChangedText({ text }),
          }),
        ),
      ]),
      model.pattern === '' || run.error !== ''
        ? model.pattern === ''
          ? hint(h, 'Enter a pattern to see the matches.')
          : null
        : panel(h, 'Matches', [
            stats(h, [['Matches', `${run.matches.length}${run.truncated ? '+' : ''}`]]),
            h.pre(
              [h.Class(highlightCls), h.Tabindex(0), h.AriaLabel('Highlighted matches')],
              slices(model.text, run.matches).map((slice) =>
                slice.hit ? h.mark([], [slice.text]) : slice.text,
              ),
            ),
            run.matches.length === 0
              ? hint(h, 'No match.')
              : h.ul(
                  [h.Class(listCls)],
                  run.matches
                    .slice(0, 50)
                    .map((found, index) =>
                      h.li(
                        [h.Key(String(index))],
                        [
                          h.span([], [`@${found.index}`]),
                          h.span([], [found.text === '' ? '(empty)' : found.text]),
                          ...found.groups.map((group, n) =>
                            h.span([], [`$${n + 1} ${group === undefined ? '—' : group}`]),
                          ),
                        ],
                      ),
                    ),
                ),
            run.truncated ? hint(h, 'Showing the first 500 matches.') : null,
          ]),
    ],
  )
})

export const regexTester = defineTool({
  meta: {
    id: 'regex',
    name: 'Regex tester',
    category: 'developer',
    description: 'Test a JavaScript regular expression with live highlighting and groups.',
    keywords: ['regular expression', 'regexp', 'pattern', 'match', 'groups', 'test'],
  },
  init: () => ({
    pattern: '(\\w+)@(\\w+)\\.com',
    flags: '',
    text: 'Write to ada@example.com or grace@navy.com.\nIgnore bob@example.org.',
  }),
  update,
  view,
})
