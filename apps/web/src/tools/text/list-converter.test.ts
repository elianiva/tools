import { describe, expect, it } from 'vitest'
import { run } from './list-converter.ts'

describe('list-converter', () => {
  it('case 1', () => {
    expect(run('a\n b \n\nc', 'comma')).toBe('a, b, c')
  })
  it('case 2', () => {
    expect(run('a, b ,c,', 'lines')).toBe('a\nb\nc')
  })
  it('case 3', () => {
    expect(run('a\nb', 'quoted')).toBe('"a", "b"')
  })
  it('case 4', () => {
    expect(run('a\nb', 'json')).toBe('["a","b"]')
  })
  it('case 5', () => {
    expect(run("it's\nok", 'sql')).toBe("'it''s', 'ok'")
  })
})
