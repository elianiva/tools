import { button } from '../kit.ts'
import { describeTime } from './timestamp.logic.ts'
import { card, defineForm, errorText, field, hero, page, parseColumns, rows, split } from './ui.ts'

const ZONES = ['UTC', 'America/New_York', 'Europe/London', 'Asia/Jakarta', 'Asia/Tokyo']

export const timestamp = defineForm({
  meta: {
    id: 'timestamp',
    name: 'Timestamp converter',
    category: 'convert',
    description: 'Unix time and dates, in UTC and your time zone.',
    keywords: ['unix', 'epoch', 'date', 'time', 'iso 8601', 'utc', 'time zone'],
  },
  init: { text: '1700000000' },
  view: (form, h) => {
    const useNow = form.live
    const text = useNow ? String(Math.floor(form.now / 1000)) : form.get('text')
    let lines: ReadonlyArray<readonly [string, string]> = []
    let error = ''
    let zones: ReadonlyArray<readonly [string, string]> = []
    if (text.trim() !== '') {
      try {
        lines = parseColumns(describeTime(text, form.now))
        const millis = Number(lines.find(([label]) => label === 'Unix (ms)')?.[1])
        zones = ZONES.map(
          (zone) =>
            [
              zone,
              new Intl.DateTimeFormat('en-GB', {
                dateStyle: 'medium',
                timeStyle: 'medium',
                timeZone: zone,
              }).format(new Date(millis)),
            ] as const,
        )
      } catch (caught) {
        error = caught instanceof Error ? caught.message : ''
      }
    }
    const relative = lines.find(([label]) => label === 'Relative')?.[1] ?? ''
    return page(h, [
      split(h, [
        card(h, null, [
          field(h, {
            id: 'timestamp',
            label: 'Timestamp or date',
            value: text,
            copy: true,
            invalid: error !== '',
            onInput: form.set('text'),
          }),
          h.div(
            [],
            [
              button(
                h,
                { variant: useNow ? 'primary' : 'secondary', size: 'sm' },
                [h.OnClick(form.toggleLive)],
                [useNow ? 'Stop' : 'Live now'],
              ),
            ],
          ),
          errorText(h, error),
        ]),
        hero(h, 'Relative', relative),
      ]),
      lines.length === 0
        ? null
        : card(h, 'Formats', [
            rows(
              h,
              lines.filter(([l]) => l !== 'Relative'),
            ),
          ]),
      zones.length === 0 ? null : card(h, 'Time zones', [rows(h, zones)]),
    ])
  },
})
