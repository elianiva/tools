import { describe, expect, it } from 'vitest'
import { run } from './extract-data.ts'

describe('extract-data', () => {
  it('case 1', () => {
    expect(run('mail a.b@x.co and c@y.org', 'emails')).toBe('a.b@x.co\nc@y.org')
  })
  it('case 2', () => {
    expect(run('see https://a.com/x?y=1, and http://b.org.', 'urls')).toBe(
      'https://a.com/x?y=1\nhttp://b.org',
    )
  })
  it('case 3', () => {
    expect(run('a 3 b -4.5 c 10', 'numbers')).toBe('3\n-4.5\n10')
  })
  it('case 4', () => {
    expect(run('#a1 x #b_c', 'hashtags')).toBe('#a1\n#b_c')
  })
  it('case 5', () => {
    expect(run('hi @ada and @bob_2', 'mentions')).toBe('@ada\n@bob_2')
  })
  it('case 6', () => {
    expect(() => run('plain words', 'emails')).toThrow('Nothing found')
  })
})
