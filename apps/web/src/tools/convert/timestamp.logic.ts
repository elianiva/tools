const UNITS: ReadonlyArray<readonly [Intl.RelativeTimeFormatUnit, number]> = [
  ['year', 31_536_000],
  ['month', 2_592_000],
  ['day', 86_400],
  ['hour', 3600],
  ['minute', 60],
  ['second', 1],
]

const relative = (target: number, now: number): string => {
  const seconds = Math.round((target - now) / 1000)
  const unit = UNITS.find(([, size]) => Math.abs(seconds) >= size) ?? UNITS[UNITS.length - 1]
  const [name, size] = unit ?? ['second', 1]
  return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
    Math.round(seconds / size),
    name,
  )
}

/** A number is seconds up to 11 digits and milliseconds beyond; anything else is parsed as a date. */
const toMillis = (text: string): number => {
  const trimmed = text.trim()
  if (/^-?\d+(\.\d+)?$/u.test(trimmed)) {
    const value = Number(trimmed)
    return Math.abs(value) >= 1e11 ? value : value * 1000
  }
  const parsed = Date.parse(trimmed)
  if (Number.isNaN(parsed))
    throw new Error('Not a timestamp or a date. Try 1700000000 or 2024-05-01T12:00:00Z.')
  return parsed
}

export const describeTime = (text: string, now = Date.now(), timeZone?: string): string => {
  const millis = toMillis(text)
  const date = new Date(millis)
  if (Number.isNaN(date.getTime())) throw new Error('That moment is out of range.')
  const local = new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'full',
    timeStyle: 'long',
    ...(timeZone === undefined ? {} : { timeZone }),
  }).format(date)
  return [
    `Unix (s)   ${Math.floor(millis / 1000)}`,
    `Unix (ms)  ${millis}`,
    `UTC        ${date.toISOString()}`,
    `Local      ${local}`,
    `Relative   ${relative(millis, now)}`,
  ].join('\n')
}
