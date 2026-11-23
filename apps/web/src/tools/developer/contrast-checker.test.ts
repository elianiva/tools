import { describe, expect, it } from 'vitest'
import { run } from './contrast-checker.ts'

describe('contrast-checker', () => {
  it('case 1', () => {
    expect(run('#000 #fff')).toBe(
      'Contrast: 21.00:1\nAA normal text: pass\nAA large text: pass\nAAA normal text: pass\nAAA large text: pass',
    )
  })
  it('case 2', () => {
    expect(run('#777777 #ffffff')).toBe(
      'Contrast: 4.48:1\nAA normal text: fail\nAA large text: pass\nAAA normal text: fail\nAAA large text: fail',
    )
  })
  it('case 3', () => {
    expect(run('#fff #777')).toBe(
      'Contrast: 4.48:1\nAA normal text: fail\nAA large text: pass\nAAA normal text: fail\nAAA large text: fail',
    )
  })
  it('case 4', () => {
    expect(run('#fff #fff')).toBe(
      'Contrast: 1.00:1\nAA normal text: fail\nAA large text: fail\nAAA normal text: fail\nAAA large text: fail',
    )
  })
  it('case 5', () => {
    expect(() => run('#000')).toThrow('two hex colors')
  })
  it('case 6', () => {
    expect(() => run('#000 blue')).toThrow('not a hex color')
  })
})
