const n = (value: number): string => String(Number(value.toFixed(6)))

/** Understands `20% of 150`, `30 is what % of 120`, `80 to 100` (change) and `150 +20%`. */
export const percentage = (text: string): string => {
  const t = text.trim().toLowerCase().replaceAll(',', '')
  const num = String.raw`(-?\d+(?:\.\d+)?)`
  const of = new RegExp(`^${num}\\s*%\\s*of\\s*${num}$`, 'u').exec(t)
  if (of) return `${n((Number(of[1]) / 100) * Number(of[2]))}`
  const what = new RegExp(`^${num}\\s*is what\\s*%?\\s*of\\s*${num}$`, 'u').exec(t)
  if (what) {
    if (Number(what[2]) === 0) throw new Error('Cannot take a percentage of zero.')
    return `${n((Number(what[1]) / Number(what[2])) * 100)}%`
  }
  const change = new RegExp(`^${num}\\s*to\\s*${num}$`, 'u').exec(t)
  if (change) {
    const from = Number(change[1])
    if (from === 0) throw new Error('Cannot measure change from zero.')
    const pct = ((Number(change[2]) - from) / Math.abs(from)) * 100
    return `${pct >= 0 ? '+' : ''}${n(pct)}%`
  }
  const adjust = new RegExp(`^${num}\\s*([+-])\\s*${num}\\s*%$`, 'u').exec(t)
  if (adjust) {
    const base = Number(adjust[1])
    const delta = (base * Number(adjust[3])) / 100
    return n(adjust[2] === '+' ? base + delta : base - delta)
  }
  throw new Error('Try 20% of 150, 30 is what % of 120, 80 to 100, or 150 + 20%.')
}
