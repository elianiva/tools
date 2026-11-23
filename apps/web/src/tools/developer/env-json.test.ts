import { describe, expect, it } from 'vitest'
import { run } from './env-json.ts'

describe('env-json', () => {
  it('case 1', () => {
    expect(run('A=1\n# note\nexport B="x y"\nC=\'z\'', 'to-json')).toBe(
      JSON.stringify({ A: '1', B: 'x y', C: 'z' }, null, 2),
    )
  })
  it('case 2', () => {
    expect(run('{"A":1,"B":"x y","C":true}', 'to-env')).toBe('A=1\nB="x y"\nC=true')
  })
  it('case 3', () => {
    expect(() => run('A=1\nbad line', 'to-json')).toThrow('Line 2 is not KEY=VALUE')
  })
  it('case 4', () => {
    expect(() => run('[1]', 'to-env')).toThrow('JSON object')
  })
  it('case 5', () => {
    expect(() => run('{"a":{}}', 'to-env')).toThrow('flat values')
  })
})
