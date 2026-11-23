import { describe, expect, it } from 'vitest'
import { decodeBase64, encodeBase64 } from './base64.logic.ts'

describe('base64', () => {
  it('matches the standard alphabet', () => {
    expect(encodeBase64('hello', false)).toBe('aGVsbG8=')
    expect(encodeBase64('', false)).toBe('')
  })

  it('round-trips text outside ASCII', () => {
    const text = '日本語 ✓ 👨‍👩‍👧 é'
    expect(decodeBase64(encodeBase64(text, false))).toBe(text)
    expect(decodeBase64(encodeBase64(text, true))).toBe(text)
  })

  it('writes the URL-safe form without padding or + and /', () => {
    // '>>>???' encodes to 'Pj4+Pz8/' in the standard alphabet.
    expect(encodeBase64('>>>???', false)).toBe('Pj4+Pz8/')
    expect(encodeBase64('>>>???', true)).toBe('Pj4-Pz8_')
    expect(encodeBase64('a', true)).toBe('YQ')
  })

  it('decodes input with line breaks and no padding', () => {
    expect(decodeBase64('aGVs\nbG8')).toBe('hello')
  })

  it('says what is wrong', () => {
    expect(() => decodeBase64('***')).toThrow('not valid Base64')
    expect(() => decodeBase64('/w==')).toThrow('not UTF-8')
  })

  it('handles an input larger than the argument limit', () => {
    const big = 'x'.repeat(300_000)
    expect(decodeBase64(encodeBase64(big, false))).toBe(big)
  })
})
