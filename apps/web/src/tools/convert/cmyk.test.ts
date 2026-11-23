import { describe, expect, it } from 'vitest'
import { run } from './cmyk.ts'

describe('cmyk', () => {
  it('case 1', () => {
    expect(run('#3b82f6', 'to-cmyk')).toBe('CMYK: 76% 47% 0% 4%')
  })
  it('case 2', () => {
    expect(run('#ff0000', 'to-cmyk')).toBe('CMYK: 0% 100% 100% 0%')
  })
  it('case 3', () => {
    expect(run('#000', 'to-cmyk')).toBe('CMYK: 0% 0% 0% 100%')
  })
  it('case 4', () => {
    expect(run('#fff', 'to-cmyk')).toBe('CMYK: 0% 0% 0% 0%')
  })
  it('case 5', () => {
    expect(run('76 47 0 4', 'to-hex')).toBe('#3b82f5')
  })
  it('case 6', () => {
    expect(run('0 100 100 0', 'to-hex')).toBe('#ff0000')
  })
  it('case 7', () => {
    expect(run('0 0 0 100', 'to-hex')).toBe('#000000')
  })
  it('case 8', () => {
    expect(() => run('blue', 'to-cmyk')).toThrow('hex color')
  })
  it('case 9', () => {
    expect(() => run('10 20 30', 'to-hex')).toThrow('four percentages')
  })
  it('case 10', () => {
    expect(() => run('10 20 30 140', 'to-hex')).toThrow('four percentages')
  })
})
