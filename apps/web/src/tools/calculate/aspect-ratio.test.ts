import { describe, expect, it } from 'vitest'
import { run } from './aspect-ratio.ts'

describe('aspect-ratio', () => {
  it('case 1', () => {
    expect(run('1920 1080')).toBe('Ratio: 16:9\nDecimal: 1.78')
  })
  it('case 2', () => {
    expect(run('1000 750')).toBe('Ratio: 4:3\nDecimal: 1.33')
  })
  it('case 3', () => {
    expect(run('1 1')).toBe('Ratio: 1:1\nDecimal: 1.00')
  })
  it('case 4', () => {
    expect(() => run('1920')).toThrow('Enter a width')
  })
})
