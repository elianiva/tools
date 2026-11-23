import { describe, expect, it } from 'vitest'
import { run } from './timezones.ts'

describe('timezones', () => {
  it('case 1', () => {
    expect(run('2024-05-01T12:00:00Z')).toContain('Asia/Jakarta  2024-05-01 19:00')
  })
  it('case 2', () => {
    expect(run('2024-05-01T12:00:00Z')).toContain('America/New_York  2024-05-01 08:00')
  })
  it('case 3', () => {
    expect(run('2024-05-01T12:00:00Z')).toContain('Europe/London  2024-05-01 13:00')
  })
  it('case 4', () => {
    expect(run('2024-05-01T12:00:00Z')).toContain('Asia/Kolkata  2024-05-01 17:30')
  })
  it('case 5', () => {
    expect(run('2024-12-31T20:00:00Z')).toContain('Asia/Tokyo  2025-01-01 05:00')
  })
  it('case 6', () => {
    expect(run('2024-01-15T12:00:00Z')).toContain('America/New_York  2024-01-15 07:00')
  })
  it('case 7', () => {
    expect(() => run('soon')).toThrow('Not a date')
  })
})
