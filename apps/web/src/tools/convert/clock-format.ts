import { segmented, textArea } from '../kit.ts'
import { card, cells, defineForm, errorText, hero, page, split } from './ui.ts'

export const run = (text: string, mode: string): string => {
  return text
    .split('\n')
    .map((line) => {
      const shown = line.trim()
      const match = /^(\d{1,2}):(\d{2})\s*(am|pm)?$/iu.exec(shown)
      if (match === null) throw new Error(`"${shown}" is not a time such as 14:30 or 2:30 PM.`)
      const hour = Number(match[1])
      const minute = match[2] ?? '00'
      const suffix = (match[3] ?? '').toLowerCase()
      if (Number(minute) > 59 || hour > 23 || (suffix !== '' && (hour < 1 || hour > 12)))
        throw new Error(`"${shown}" is not a valid time.`)
      if (mode === 'to-24') {
        if (suffix === '') throw new Error('Add AM or PM to each time.')
        return `${String(suffix === 'pm' ? (hour % 12) + 12 : hour % 12).padStart(2, '0')}:${minute}`
      }
      if (suffix !== '') return `${hour}:${minute} ${suffix.toUpperCase()}`
      return `${hour % 12 === 0 ? 12 : hour % 12}:${minute} ${hour >= 12 ? 'PM' : 'AM'}`
    })
    .join('\n')
}

export const clockFormat = defineForm({
  meta: {
    id: 'clock-format',
    name: '12 and 24 hour clock',
    category: 'convert',
    description: 'Convert times between 12-hour and 24-hour clocks, one per line.',
    keywords: ['am pm', '24 hour', 'military time', 'clock', 'time format'],
    accepts: ['text/*', '.txt', '.json', '.md'],
  },
  init: { text: '14:30', mode: 'to-12' },
  view: (form, h) => {
    const mode = form.get('mode')
    const text = form.get('text')
    let out = ''
    let error = ''
    if (text.trim() !== '') {
      try {
        out = run(text, mode)
      } catch (caught) {
        error = caught instanceof Error ? caught.message : ''
      }
    }
    const hours = Array.from({ length: 24 }, (_, hour) => {
      const clock = `${String(hour).padStart(2, '0')}:00`
      return [clock, run(clock, 'to-12')] as const
    })
    return page(h, [
      segmented(h, {
        label: 'Direction',
        value: mode,
        options: [
          { value: 'to-12', label: 'To 12-hour' },
          { value: 'to-24', label: 'To 24-hour' },
        ],
        onSelect: (value) => form.patch({ mode: value }),
      }),
      split(h, [
        card(h, null, [
          textArea(h, { id: 'text', value: text, rows: 4, onInput: form.set('text') }),
          errorText(h, error),
        ]),
        hero(h, 'Result', out),
      ]),
      card(h, 'All hours', [cells(h, hours)]),
    ])
  },
})
