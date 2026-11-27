export type Step = Readonly<{
  kind: 'same' | 'sub' | 'ins' | 'del'
  from: string
  to: string
}>

/** One cheapest sequence of edits that turns `a` into `b`, character by character. */
export const align = (a: string, b: string): ReadonlyArray<Step> => {
  const x = Array.from(a)
  const y = Array.from(b)
  const table = Array.from({ length: x.length + 1 }, () =>
    Array.from({ length: y.length + 1 }, () => 0),
  )
  for (let i = 0; i <= x.length; i += 1) (table[i] as number[])[0] = i
  for (let j = 0; j <= y.length; j += 1) (table[0] as number[])[j] = j
  const at = (i: number, j: number): number => table[i]?.[j] ?? 0
  for (let i = 1; i <= x.length; i += 1) {
    for (let j = 1; j <= y.length; j += 1) {
      ;(table[i] as number[])[j] = Math.min(
        at(i - 1, j) + 1,
        at(i, j - 1) + 1,
        at(i - 1, j - 1) + (x[i - 1] === y[j - 1] ? 0 : 1),
      )
    }
  }
  const steps: Array<Step> = []
  let i = x.length
  let j = y.length
  while (i > 0 || j > 0) {
    const from = x[i - 1] ?? ''
    const to = y[j - 1] ?? ''
    if (i > 0 && j > 0 && at(i, j) === at(i - 1, j - 1) + (from === to ? 0 : 1)) {
      steps.push({ kind: from === to ? 'same' : 'sub', from, to })
      i -= 1
      j -= 1
    } else if (i > 0 && at(i, j) === at(i - 1, j) + 1) {
      steps.push({ kind: 'del', from, to: '' })
      i -= 1
    } else {
      steps.push({ kind: 'ins', from: '', to })
      j -= 1
    }
  }
  return steps.toReversed()
}
