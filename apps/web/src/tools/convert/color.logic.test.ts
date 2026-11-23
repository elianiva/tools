import { describe, expect, it } from 'vitest'
import { describeColor } from './color.logic.ts'

describe('describeColor', () => {
  it('converts red between notations', () => {
    const out = describeColor('#ff0000')
    expect(out).toContain('HEX    #ff0000')
    expect(out).toContain('RGB    rgb(255, 0, 0)')
    expect(out).toContain('HSL    hsl(0, 100%, 50%)')
    expect(out).toContain('OKLCH  oklch(0.628 0.258 29.2)')
  })

  it('reads named colors and modern syntax', () => {
    expect(describeColor('rebeccapurple')).toContain('HEX    #663399')
    expect(describeColor('hsl(120 100% 25%)')).toContain('HEX    #008000')
  })

  it('keeps alpha', () => {
    expect(describeColor('#00000080')).toContain('HEX    #00000080')
  })

  it('explains a bad color', () => {
    expect(() => describeColor('not a color')).toThrow('not a CSS color')
  })
})
