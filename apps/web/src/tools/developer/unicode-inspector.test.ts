import { describe, expect, it } from 'vitest'
import { run } from './unicode-inspector.ts'

describe('unicode-inspector', () => {
  it('case 1', () => {
    expect(run('A€')).toBe('U+0041  A  41\nU+20AC  €  E2 82 AC')
  })
  it('case 2', () => {
    expect(run('😀')).toBe('U+1F600  😀  F0 9F 98 80')
  })
  it('case 3', () => {
    expect(run('\n')).toBe('U+000A  (control)  0A')
  })
})
