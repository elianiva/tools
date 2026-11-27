import { card, cells, defineForm, errorText, field, hero, page, split } from './ui.ts'

export const run = (text: string, mode: string): string => {
  if (mode === 'to-seconds') {
    const seconds: Readonly<Record<string, number>> = { d: 86_400, h: 3600, m: 60, s: 1 }
    const parts = [...text.matchAll(/(\d+(?:\.\d+)?)\s*([dhms])/giu)]
    if (parts.length === 0) throw new Error('Use units such as 1d 2h 30m 15s.')
    return String(
      Math.round(
        parts.reduce(
          (sum, part) => sum + Number(part[1]) * (seconds[(part[2] ?? 's').toLowerCase()] ?? 0),
          0,
        ),
      ),
    )
  }
  if (!/^\d+$/u.test(text.trim())) throw new Error('Enter a whole number of seconds.')
  let rest = Number(text.trim())
  const units: ReadonlyArray<readonly [string, number]> = [
    ['d', 86_400],
    ['h', 3600],
    ['m', 60],
    ['s', 1],
  ]
  const out: Array<string> = []
  for (const [label, size] of units) {
    const amount = Math.floor(rest / size)
    rest -= amount * size
    if (amount > 0) out.push(`${amount}${label}`)
  }
  return out.length === 0 ? '0s' : out.join(' ')
}

const PARTS: ReadonlyArray<readonly [string, string, number]> = [
  ['d', 'Days', 86_400],
  ['h', 'Hours', 3600],
  ['m', 'Minutes', 60],
  ['s', 'Seconds', 1],
]

export const duration = defineForm({
  meta: {
    id: 'duration',
    name: 'Duration converter',
    category: 'convert',
    description: 'Seconds to days, hours, minutes, and back.',
    keywords: ['seconds', 'duration', 'time', 'hours', 'minutes', 'convert'],
  },
  init: { d: '0', h: '1', m: '1', s: '1' },
  view: (form, h) => {
    const total = PARTS.reduce((sum, [key, , size]) => sum + (Number(form.get(key)) || 0) * size, 0)
    const bad = PARTS.some(([key]) => Number.isNaN(Number(form.get(key))))
    const seconds = Math.round(total)
    const spelled = bad ? '' : run(String(seconds), 'to-duration')
    return page(h, [
      split(h, [
        card(
          h,
          null,
          PARTS.map(([key, label]) =>
            field(h, {
              id: key,
              label,
              value: form.get(key),
              inputMode: 'decimal',
              invalid: Number.isNaN(Number(form.get(key))),
              onInput: form.set(key),
            }),
          ),
        ),
        hero(h, 'Total seconds', bad ? '' : String(seconds)),
      ]),
      bad
        ? errorText(h, 'Enter numbers only.')
        : card(h, null, [
            cells(h, [
              ['Compact', spelled],
              ['Minutes', String(Number((seconds / 60).toFixed(4)))],
              ['Hours', String(Number((seconds / 3600).toFixed(4)))],
              ['Days', String(Number((seconds / 86_400).toFixed(4)))],
            ]),
          ]),
    ])
  },
})
