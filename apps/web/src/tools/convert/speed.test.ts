import { describe, expect, it } from 'vitest'
import { run } from './speed.ts'

describe('speed', () => {
  it('case 1', () => {
    expect(run('100 kmh')).toContain('62.1371 mph')
  })
  it('case 2', () => {
    expect(run('100 km/h')).toContain('27.7778 m/s')
  })
  it('case 3', () => {
    expect(run('10 knots')).toContain('11.5078 mph')
  })
  it('case 4', () => {
    expect(run('60 mph')).toContain('96.5606 km/h')
  })
  it('case 5', () => {
    expect(run('36 kph')).toContain('10 m/s')
  })
  it('case 6', () => {
    expect(() => run('5 parsecs')).toThrow('Write a speed')
  })
})
