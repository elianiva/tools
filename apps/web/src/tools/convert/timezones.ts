import { range } from '../kit.ts'
import { card, defineForm, errorText, page, field, rows } from './ui.ts'

export const run = (text: string): string => {
  const date = new Date(Date.parse(text.trim()))
  if (Number.isNaN(date.getTime())) throw new Error('Not a date. Try 2024-05-01T12:00:00Z.')
  const zones = [
    'UTC',
    'America/Los_Angeles',
    'America/New_York',
    'Europe/London',
    'Europe/Berlin',
    'Asia/Dubai',
    'Asia/Kolkata',
    'Asia/Jakarta',
    'Asia/Tokyo',
    'Australia/Sydney',
  ]
  const show = (zone: string): string => {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: zone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(date)
    const get = (type: string): string => parts.find((part) => part.type === type)?.value ?? ''
    return `${zone}  ${get('year')}-${get('month')}-${get('day')} ${get('hour')}:${get('minute')}`
  }
  return zones.map(show).join('\n')
}

export const timezones = defineForm({
  meta: {
    id: 'timezones',
    name: 'Time zone converter',
    category: 'convert',
    description: 'One moment shown in ten time zones.',
    keywords: ['time zone', 'utc', 'convert', 'meeting', 'world clock', 'jakarta'],
  },
  init: { text: '2024-05-01T12:00:00Z', shift: '0' },
  view: (form, h) => {
    const shift = Number(form.get('shift'))
    const text = form.get('text')
    let lines: ReadonlyArray<readonly [string, string]> = []
    let error = ''
    try {
      const base = Date.parse(text.trim())
      if (Number.isNaN(base)) throw new Error('Not a date. Try 2024-05-01T12:00:00Z.')
      lines = run(new Date(base + shift * 60_000).toISOString())
        .split('\n')
        .map((line) => {
          const [zone = '', when = ''] = line.split(/\s{2,}/u)
          return [zone, when] as const
        })
    } catch (caught) {
      error = caught instanceof Error ? caught.message : ''
    }
    return page(h, [
      card(h, null, [
        field(h, {
          id: 'moment',
          label: 'Date and time',
          value: text,
          invalid: error !== '',
          onInput: form.set('text'),
        }),
        h.label([h.For('shift')], [`Shift: ${shift >= 0 ? '+' : '−'}${Math.abs(shift) / 60} h`]),
        range(h, {
          id: 'shift',
          min: -720,
          max: 720,
          step: 15,
          value: shift,
          onInput: (value) => form.patch({ shift: String(value) }),
        }),
        errorText(h, error),
      ]),
      lines.length === 0 ? null : card(h, null, [rows(h, lines)]),
    ])
  },
})
