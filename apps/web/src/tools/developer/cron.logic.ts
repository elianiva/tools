type Spec = Readonly<{ min: number; max: number; names?: ReadonlyArray<string> }>

const FIELDS: ReadonlyArray<Spec> = [
  { min: 0, max: 59 },
  { min: 0, max: 23 },
  { min: 1, max: 31 },
  {
    min: 1,
    max: 12,
    names: ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'],
  },
  { min: 0, max: 7, names: ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'] },
]

const value = (spec: Spec, token: string): number => {
  const named = spec.names?.indexOf(token.toUpperCase()) ?? -1
  const number = named >= 0 ? named + (spec.min === 1 ? 1 : 0) : Number(token)
  if (!Number.isInteger(number) || number < spec.min || number > spec.max)
    throw new Error(`"${token}" is out of range.`)
  return number
}

const expand = (spec: Spec, source: string): ReadonlySet<number> => {
  const out = new Set<number>()
  for (const part of source.split(',')) {
    const [range = '', stepText] = part.split('/')
    const step = stepText === undefined ? 1 : Number(stepText)
    if (!Number.isInteger(step) || step < 1) throw new Error(`"${part}" has a bad step.`)
    const [from, to] =
      range === '*'
        ? [spec.min, spec.max]
        : range.includes('-')
          ? range.split('-').map((token) => value(spec, token))
          : [value(spec, range), stepText === undefined ? value(spec, range) : spec.max]
    if (from === undefined || to === undefined || from > to)
      throw new Error(`"${part}" is not a range.`)
    for (let at = from; at <= to; at += step) out.add(spec === FIELDS[4] && at === 7 ? 0 : at)
  }
  return out
}

/** The next `count` times a five-field cron expression runs after `from`. */
export const nextRuns = (
  expression: string,
  from: Date,
  count: number,
  utc: boolean,
): ReadonlyArray<Date> => {
  const parts = expression.trim().split(/\s+/u)
  if (parts.length !== 5) throw new Error('Use five fields: minute hour day month weekday.')
  const [minutes, hours, days, months, weekdays] = parts.map((part, index) =>
    expand(FIELDS[index] as Spec, part),
  ) as [
    ReadonlySet<number>,
    ReadonlySet<number>,
    ReadonlySet<number>,
    ReadonlySet<number>,
    ReadonlySet<number>,
  ]
  const dayRestricted = parts[2] !== '*'
  const weekdayRestricted = parts[4] !== '*'
  const sortedHours = [...hours].toSorted((a, b) => a - b)
  const sortedMinutes = [...minutes].toSorted((a, b) => a - b)
  const out: Array<Date> = []
  const year = utc ? from.getUTCFullYear() : from.getFullYear()
  const month = utc ? from.getUTCMonth() : from.getMonth()
  const date = utc ? from.getUTCDate() : from.getDate()
  for (let offset = 0; offset < 366 * 8 && out.length < count; offset += 1) {
    const day = utc
      ? new Date(Date.UTC(year, month, date + offset))
      : new Date(year, month, date + offset)
    const dom = utc ? day.getUTCDate() : day.getDate()
    const mon = (utc ? day.getUTCMonth() : day.getMonth()) + 1
    const dow = utc ? day.getUTCDay() : day.getDay()
    if (!months.has(mon)) continue
    const domOk = days.has(dom)
    const dowOk = weekdays.has(dow)
    if (!(dayRestricted && weekdayRestricted ? domOk || dowOk : domOk && dowOk)) continue
    for (const hour of sortedHours) {
      for (const minute of sortedMinutes) {
        const at = new Date(day)
        if (utc) at.setUTCHours(hour, minute, 0, 0)
        else at.setHours(hour, minute, 0, 0)
        if (at > from && out.length < count) out.push(at)
      }
    }
  }
  return out
}
