import { describe, expect, it } from 'vitest'
import { run } from './smart-quotes.ts'

describe('smart-quotes', () => {
  it('case 1', () => {
    expect(run('He said "it\'s fine"', 'curly')).toBe('He said \u201Cit\u2019s fine\u201D')
  })
  it('case 2', () => {
    expect(run('\u201Chi\u201D \u2018x\u2019', 'straight')).toBe('"hi" \'x\'')
  })
  it('case 3', () => {
    expect(run("'quoted' text", 'curly')).toBe('\u2018quoted\u2019 text')
  })
})
