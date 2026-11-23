import { describe, expect, it } from 'vitest'
import { run } from './json-to-typescript.ts'

describe('json-to-typescript', () => {
  it('case 1', () => {
    expect(run('{"a":1,"b":[1,2],"c":{"d":true}}')).toBe(
      'type Root = {\n  a: number\n  b: number[]\n  c: {\n    d: boolean\n  }\n}',
    )
  })
  it('case 2', () => {
    expect(run('[1,"a"]')).toBe('type Root = (number | string)[]')
  })
  it('case 3', () => {
    expect(run('[]')).toBe('type Root = unknown[]')
  })
  it('case 4', () => {
    expect(run('{"a-b":null}')).toBe('type Root = {\n  "a-b": null\n}')
  })
  it('case 5', () => {
    expect(run('"x"')).toBe('type Root = string')
  })
  it('case 6', () => {
    expect(() => run('{')).toThrow('not valid JSON')
  })
})
