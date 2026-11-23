import { describe, expect, it } from 'vitest'
import { formatJson } from './json-formatter.logic.ts'

describe('formatJson', () => {
  it('indents by two spaces and minifies', () => {
    expect(formatJson('{"a":[1,2]}', 'pretty')).toBe('{\n  "a": [\n    1,\n    2\n  ]\n}')
    expect(formatJson('{ "a" : [ 1, 2 ] }', 'minify')).toBe('{"a":[1,2]}')
  })

  it('sorts keys at every depth but keeps array order', () => {
    expect(formatJson('{"b":{"z":1,"y":[3,1]},"a":0}', 'sorted')).toBe(
      '{\n  "a": 0,\n  "b": {\n    "y": [\n      3,\n      1\n    ],\n    "z": 1\n  }\n}',
    )
  })

  it('points at the line and column of an error', () => {
    expect(() => formatJson('{\n  "a": 1,\n  oops\n}', 'pretty')).toThrow(/line 3, column 3/u)
  })
})
