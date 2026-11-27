import { segmented } from '../kit.ts'
import { card, chips, defineForm, errorText, field, hero, page, parseLines, split } from './ui.ts'

export const run = (text: string, mode: string): string => {
  const match = /^\s*(\d+(?:\.\d+)?)\s*(?:km|mi)?\s+(\d+(?::\d{1,2}){1,2})\s*$/iu.exec(text)
  if (match === null) throw new Error('Enter distance and time, such as 5 25:00 or 42.2 3:45:00.')
  const distance = Number(match[1])
  const [a = 0, b = 0, c] = (match[2] ?? '').split(':').map(Number)
  const seconds = c === undefined ? a * 60 + b : a * 3600 + b * 60 + c
  if (distance <= 0 || seconds <= 0) throw new Error('Distance and time must be above zero.')
  const pace = Math.round(seconds / distance)
  const unit = mode === 'mi' ? 'mi' : 'km'
  return [
    `Pace: ${Math.floor(pace / 60)}:${String(pace % 60).padStart(2, '0')} /${unit}`,
    `Speed: ${((distance / seconds) * 3600).toFixed(2)} ${unit}/h`,
  ].join('\n')
}

const PRESETS: ReadonlyArray<readonly [string, string, string]> = [
  ['5K', '5', '25:00'],
  ['10K', '10', '55:00'],
  ['Half marathon', '21.0975', '1:50:00'],
  ['Marathon', '42.195', '3:59:00'],
]

export const pace = defineForm({
  meta: {
    id: 'pace',
    name: 'Running pace',
    category: 'convert',
    description: 'Pace and speed from a distance and a time.',
    keywords: ['running', 'pace', 'minutes per km', 'marathon', 'race', 'speed'],
  },
  init: { distance: '5', time: '25:00', unit: 'km' },
  view: (form, h) => {
    const unit = form.get('unit')
    let out: Readonly<Record<string, string>> = {}
    let error = ''
    try {
      out = parseLines(run(`${form.get('distance')} ${form.get('time')}`, unit))
    } catch (caught) {
      error = caught instanceof Error ? caught.message : ''
    }
    return page(h, [
      segmented(h, {
        label: 'Unit',
        value: unit,
        options: [
          { value: 'km', label: 'Kilometres' },
          { value: 'mi', label: 'Miles' },
        ],
        onSelect: (value) => form.patch({ unit: value }),
      }),
      split(h, [
        card(h, null, [
          field(h, {
            id: 'distance',
            label: 'Distance',
            value: form.get('distance'),
            suffix: unit,
            inputMode: 'decimal',
            onInput: form.set('distance'),
          }),
          field(h, {
            id: 'time',
            label: 'Time',
            value: form.get('time'),
            suffix: 'h:mm:ss',
            onInput: form.set('time'),
          }),
          chips(
            h,
            PRESETS.map(([label, distance, time]) => ({
              label,
              message: form.patch({ distance, time, unit: 'km' }),
            })),
          ),
          errorText(h, error),
        ]),
        hero(h, 'Pace', out['Pace'] ?? ''),
        hero(h, 'Speed', out['Speed'] ?? ''),
      ]),
    ])
  },
})
