import { describe, expect, it } from 'vitest'
import { run } from './random-color.ts'

describe('random-color', () => {
  it('writes the asked number of hex colors', () => {
    const colors = run('7').split('\n')
    expect(colors).toHaveLength(7)
    for (const color of colors) expect(color).toMatch(/^#[0-9a-f]{6}$/u)
  })

  it('writes one color for junk and caps at fifty', () => {
    expect(run('x').split('\n')).toHaveLength(1)
    expect(run('900').split('\n')).toHaveLength(50)
  })
})
