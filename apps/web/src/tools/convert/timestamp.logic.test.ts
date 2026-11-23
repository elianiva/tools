import { describe, expect, it } from 'vitest'
import { describeTime } from './timestamp.logic.ts'

const NOW = Date.UTC(2024, 4, 1, 12, 0, 0)

describe('describeTime', () => {
  it('reads seconds and milliseconds as the same moment', () => {
    const fromSeconds = describeTime('1714564800', NOW, 'UTC')
    const fromMillis = describeTime('1714564800000', NOW, 'UTC')
    expect(fromSeconds).toBe(fromMillis)
    expect(fromSeconds).toContain('UTC        2024-05-01T12:00:00.000Z')
  })

  it('reads an ISO date and shows the zone it was asked for', () => {
    const out = describeTime('2024-05-01T12:00:00Z', NOW, 'Asia/Jakarta')
    expect(out).toContain('Unix (s)   1714564800')
    expect(out).toContain('19:00:00')
  })

  it('says how far away it is, in both directions', () => {
    expect(describeTime('2024-05-01T14:00:00Z', NOW, 'UTC')).toContain('in 2 hours')
    expect(describeTime('2024-04-29T12:00:00Z', NOW, 'UTC')).toContain('2 days ago')
    expect(describeTime('2024-05-01T12:00:00Z', NOW, 'UTC')).toContain('now')
  })

  it('refuses text that is no date', () => {
    expect(() => describeTime('tomorrow-ish', NOW)).toThrow('Not a timestamp')
  })
})
