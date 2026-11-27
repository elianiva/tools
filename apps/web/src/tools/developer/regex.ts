import { css } from '../../../styled-system/css'
import { checkbox, columns, panel, row, stack, stats } from '../kit.ts'
import { runRegex, slices } from './regex.logic.ts'
import {
  copyButton,
  dataTable,
  defineWorkbench,
  errorNote,
  inputBox,
  sectionLabel,
  textField,
} from './ui.ts'

const FLAGS = [
  { id: 'i', label: 'Ignore case' },
  { id: 'm', label: 'Multiline' },
  { id: 's', label: 'Dot all' },
  { id: 'u', label: 'Unicode' },
] as const

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
  '& mark:nth-of-type(even)': {
    background: 'color-mix(in oklab, var(--info) 22%, transparent)',
    boxShadow: 'inset 0 0 0 1px var(--info)',
  },
})

export const regexTester = defineWorkbench({
  meta: {
    id: 'regex',
    name: 'Regex tester',
    category: 'developer',
    description: 'Test a JavaScript regular expression with live highlighting and groups.',
    keywords: ['regular expression', 'regexp', 'pattern', 'match', 'groups', 'test'],
  },
  example: 'Write to ada@example.com or grace@navy.com.\nIgnore bob@example.org.',
  opts: { pattern: '(\\w+)@(\\w+)\\.com', flags: '' },
  view: (h, ctx) => {
    const pattern = ctx.opt('pattern')
    const flags = ctx.opt('flags')
    const run = runRegex(pattern, flags, ctx.input)
    const groupCount = Math.max(0, ...run.matches.map((found) => found.groups.length))
    return h.div(
      [h.Class(stack)],
      [
        panel(h, null, [
          textField(h, {
            id: 'regex-pattern',
            label: 'Pattern',
            value: pattern,
            placeholder: '(\\w+)@(\\w+)\\.com',
            onInput: ctx.on.option('pattern'),
          }),
          h.div(
            [h.Class(row)],
            FLAGS.map((flag) =>
              checkbox(h, {
                id: `regex-${flag.id}`,
                label: `${flag.label} (${flag.id})`,
                checked: flags.includes(flag.id),
                onToggle: ctx.on.option('flags')(
                  flags.includes(flag.id) ? flags.replace(flag.id, '') : flags + flag.id,
                ),
              }),
            ),
          ),
          errorNote(h, run.error),
        ]),
        columns(h, [
          panel(h, null, [
            inputBox(h, ctx, {
              id: 'regex-text',
              label: 'Test text',
              placeholder: 'Text to search',
              rows: 10,
            }),
          ]),
          panel(h, null, [
            sectionLabel(h, 'Matches'),
            stats(h, [['Matches', `${run.matches.length}${run.truncated ? '+' : ''}`]]),
            h.pre(
              [h.Class(highlightCls), h.Tabindex(0), h.AriaLabel('Highlighted matches')],
              pattern === '' || run.error !== ''
                ? [ctx.input]
                : slices(ctx.input, run.matches).map((slice) =>
                    slice.hit ? h.mark([], [slice.text]) : slice.text,
                  ),
            ),
          ]),
        ]),
        run.matches.length === 0
          ? null
          : panel(h, null, [
              dataTable(h, {
                headers: [
                  '#',
                  'Index',
                  'Match',
                  ...Array.from({ length: groupCount }, (_, n) => `Group ${n + 1}`),
                ],
                kinds: [
                  'num',
                  'num',
                  'mono',
                  ...Array.from({ length: groupCount }, () => 'mono' as const),
                ],
                rows: run.matches
                  .slice(0, 100)
                  .map((found, index) => [
                    String(index + 1),
                    String(found.index),
                    h.span(
                      [],
                      [found.text === '' ? '(empty)' : found.text, copyButton(h, found.text)],
                    ),
                    ...Array.from({ length: groupCount }, (_, n) => found.groups[n] ?? '—'),
                  ]),
              }),
            ]),
      ],
    )
  },
})
