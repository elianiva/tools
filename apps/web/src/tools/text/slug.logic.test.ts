import { describe, expect, it } from 'vitest'
import { slugify } from './slug.logic.ts'

describe('slugify', () => {
  it('drops accents and punctuation', () => {
    expect(slugify('Crème brûlée & más!')).toBe('creme-brulee-mas')
  })
  it('trims separators and works per line', () => {
    expect(slugify('  --Hello,   World--  \nA_B')).toBe('hello-world\na-b')
  })
  it('keeps non-Latin words', () => {
    expect(slugify('日本語 test')).toBe('日本語-test')
  })
})
