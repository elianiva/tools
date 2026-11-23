import { describe, expect, it } from 'vitest'
import { run } from './markup-margin.ts'

describe('markup-margin', () => {
  it('case 1', () => {
    expect(run('60 100')).toBe('Profit: 40.00\nMargin: 40.00%\nMarkup: 66.67%')
  })
  it('case 2', () => {
    expect(run('80 100')).toBe('Profit: 20.00\nMargin: 20.00%\nMarkup: 25.00%')
  })
  it('case 3', () => {
    expect(run('100 80')).toBe('Profit: -20.00\nMargin: -25.00%\nMarkup: -20.00%')
  })
  it('case 4', () => {
    expect(() => run('0 10')).toThrow('above zero')
  })
})
