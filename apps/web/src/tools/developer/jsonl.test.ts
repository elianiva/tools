import { describe, expect, it } from 'vitest'
import { run } from './jsonl.ts'

describe('jsonl', () => {
  it('case 1', () => {
    expect(run('[{"a":1},{"b":[2]}]', 'to-lines')).toBe('{"a":1}\n{"b":[2]}')
  })
  it('case 2', () => {
    expect(run('{"a":1}\n\n{"b":2}', 'to-array')).toBe(
      JSON.stringify([{ a: 1 }, { b: 2 }], null, 2),
    )
  })
  it('case 3', () => {
    expect(() => run('{"a":1}\nnope', 'to-array')).toThrow('valid JSON')
  })
  it('case 4', () => {
    expect(() => run('{}', 'to-lines')).toThrow('JSON array')
  })
})
