import { describe, expect, it } from 'vitest'
import { run } from './roi.ts'

describe('roi', () => {
  it('case 1', () => {
    expect(run('1000 1250')).toBe('Gain: 250.00\nROI: 25.00%')
  })
  it('case 2', () => {
    expect(run('1000 800')).toBe('Gain: -200.00\nROI: -20.00%')
  })
  it('case 3', () => {
    expect(() => run('0 100')).toThrow('Enter the amount invested')
  })
})
