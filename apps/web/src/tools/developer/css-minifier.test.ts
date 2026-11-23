import { describe, expect, it } from 'vitest'
import { run } from './css-minifier.ts'

describe('css-minifier', () => {
  it('case 1', () => {
    expect(run('a { color : red; }\n/* c */ b{margin:0 }')).toBe('a{color:red}b{margin:0}')
  })
  it('case 2', () => {
    expect(run('.a > .b,\n.c {\n  margin: 0 auto;\n}')).toBe('.a>.b,.c{margin:0 auto}')
  })
})
