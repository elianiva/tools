import { describe, expect, it } from 'vitest'
import { run } from './html-to-text.ts'

describe('html-to-text', () => {
  it('case 1', () => {
    expect(run('<p>Hi <b>there</b></p><script>x()</script>')).toBe('Hi there')
  })
  it('case 2', () => {
    expect(run('<ul><li>a</li><li>b</li></ul>')).toBe('a\nb')
  })
  it('case 3', () => {
    expect(run('a<br>b &amp; c')).toBe('a\nb & c')
  })
})
