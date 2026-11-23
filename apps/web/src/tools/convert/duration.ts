import { defineTransform } from '../transform.ts'

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

export const duration = defineTransform({
  meta: {
    id: 'duration',
    name: 'Duration converter',
    category: 'convert',
    description: 'Seconds to days, hours, minutes, and back.',
    keywords: ['seconds', 'duration', 'time', 'hours', 'minutes', 'convert'],
  },
  modes: [
    { id: 'to-duration', label: 'Seconds to duration' },
    { id: 'to-seconds', label: 'Duration to seconds' },
  ],
  placeholder: '3661',
  example: '3661',
  fields: [{ label: 'Value', kind: 'text' }],
  run,
})
