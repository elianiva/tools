import cronstrue from 'cronstrue'
import { css } from '../../../styled-system/css'
import { checkbox, columns, panel, stack } from '../kit.ts'
import { nextRuns } from './cron.logic.ts'
import {
  attempt,
  chips,
  dataTable,
  defineWorkbench,
  errorNote,
  sectionLabel,
  textField,
} from './ui.ts'

const PRESETS = [
  { value: '* * * * *', label: 'Every minute' },
  { value: '*/15 * * * *', label: 'Every 15 min' },
  { value: '0 * * * *', label: 'Hourly' },
  { value: '0 0 * * *', label: 'Daily' },
  { value: '0 9 * * 1-5', label: 'Weekdays 09:00' },
  { value: '0 0 1 * *', label: 'Monthly' },
]
const NAMES = ['Minute', 'Hour', 'Day', 'Month', 'Weekday']

const partsCls = css({
  display: 'grid',
  gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
  gap: '0.5rem',
  '& div': {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.2rem',
    padding: '0.6rem 0.7rem',
    borderRadius: 'var(--radius)',
    background: 'var(--well)',
    boxShadow: 'var(--elev-well)',
  },
  '& b': { fontFamily: 'var(--mono)', fontSize: '1.2rem', fontWeight: 500, wordBreak: 'break-all' },
  '& span': { fontSize: '0.72rem', color: 'var(--muted-foreground)' },
})
const sentenceCls = css({ margin: 0, fontSize: '1.15rem', fontWeight: 500 })

export const cron = defineWorkbench({
  meta: {
    id: 'cron',
    name: 'Cron explainer',
    category: 'developer',
    description: 'Say in plain English when a cron expression runs.',
    keywords: ['cron', 'crontab', 'schedule', 'expression'],
  },
  example: '*/15 9-17 * * 1-5',
  view: (h, ctx) => {
    const utc = ctx.opt('utc') === '1'
    const text = ctx.input.trim()
    const sentence = attempt(() => cronstrue.toString(text, { use24HourTimeFormat: true }))
    const runs =
      text === ''
        ? { dates: [] as ReadonlyArray<Date>, error: '' }
        : (() => {
            try {
              return { dates: nextRuns(text, new Date(), 10, utc), error: '' }
            } catch (error) {
              return {
                dates: [] as ReadonlyArray<Date>,
                error: error instanceof Error ? error.message : '',
              }
            }
          })()
    const error =
      text === '' ? '' : sentence.error === '' ? runs.error : 'This is not a valid cron expression.'
    const tokens = text.split(/\s+/u)
    const format = new Intl.DateTimeFormat('en-GB', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      ...(utc ? { timeZone: 'UTC' } : {}),
    })
    return h.div(
      [h.Class(stack)],
      [
        panel(h, null, [
          textField(h, {
            id: 'cron-input',
            label: 'Expression',
            value: ctx.input,
            placeholder: '*/15 9-17 * * 1-5',
            onInput: ctx.on.input,
          }),
          chips(h, {
            label: 'Presets',
            value: text,
            options: PRESETS,
            onPick: ctx.on.input,
          }),
          errorNote(h, error),
        ]),
        error !== '' || text === ''
          ? null
          : columns(h, [
              panel(h, null, [
                h.p([h.Class(sentenceCls)], [sentence.value]),
                tokens.length === 5
                  ? h.div(
                      [h.Class(partsCls)],
                      tokens.map((token, index) =>
                        h.div([], [h.b([], [token]), h.span([], [NAMES[index] ?? ''])]),
                      ),
                    )
                  : null,
              ]),
              panel(h, null, [
                h.div(
                  [
                    h.Class(
                      css({
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }),
                    ),
                  ],
                  [
                    sectionLabel(h, 'Next runs'),
                    checkbox(h, {
                      id: 'cron-utc',
                      label: 'UTC',
                      checked: utc,
                      onToggle: ctx.on.toggle('utc'),
                    }),
                  ],
                ),
                dataTable(h, {
                  headers: ['#', 'When'],
                  kinds: ['num', 'mono'],
                  empty: 'No run in the next eight years.',
                  rows: runs.dates.map((date, index) => [String(index + 1), format.format(date)]),
                }),
              ]),
            ]),
      ],
    )
  },
})
