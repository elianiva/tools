import { describe, expect, it } from 'vitest'
import { convertYaml } from './yaml-json.logic.ts'

describe('convertYaml', () => {
  it('converts both ways', () => {
    expect(convertYaml('a: 1\nb:\n  - x\n  - y', 'yaml-to-json')).toBe(
      '{\n  "a": 1,\n  "b": [\n    "x",\n    "y"\n  ]\n}',
    )
    expect(convertYaml('{"a":1,"b":["x"]}', 'json-to-yaml')).toBe('a: 1\nb:\n  - x\n')
  })

  it('reports a YAML error on one line', () => {
    expect(() => convertYaml('a: [1,\nb: }', 'yaml-to-json')).toThrow()
  })
})
