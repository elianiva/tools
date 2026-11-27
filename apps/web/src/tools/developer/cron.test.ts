import { describe, expect, it } from 'vitest'
import { nextRuns } from './cron.logic.ts'

const iso = (dates: ReadonlyArray<Date>) => dates.map((date) => date.toISOString())

describe('nextRuns', () => {
  it('steps through minutes', () => {
    expect(iso(nextRuns('*/15 * * * *', new Date('2026-01-01T00:00:00Z'), 3, true))).toEqual([
      '2026-01-01T00:15:00.000Z',
      '2026-01-01T00:30:00.000Z',
      '2026-01-01T00:45:00.000Z',
    ])
  })
  it('honours weekday ranges and hours', () => {
    // 2026-01-03 is a Saturday, so the next weekday run is Monday the 5th.
    expect(iso(nextRuns('0 9 * * 1-5', new Date('2026-01-03T00:00:00Z'), 1, true))).toEqual([
      '2026-01-05T09:00:00.000Z',
    ])
  })
  it('treats day and weekday as either-or when both are set', () => {
    const runs = iso(nextRuns('0 0 13 * 5', new Date('2026-01-01T00:00:00Z'), 2, true))
    expect(runs[0]).toBe('2026-01-02T00:00:00.000Z')
  })
  it('rejects bad input', () => {
    expect(() => nextRuns('* * *', new Date(), 1, true)).toThrow()
    expect(() => nextRuns('61 * * * *', new Date(), 1, true)).toThrow()
  })
})
