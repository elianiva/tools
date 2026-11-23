import { describe, expect, it } from 'vitest'
import { run } from './random-picker.ts'

describe('random-picker', () => {
  it('picks one of the items, and every item can win', () => {
    const seen = new Set<string>()
    for (let i = 0; i < 200; i += 1) seen.add(run(' a \nb\n\nc', 'pick'))
    expect([...seen].toSorted()).toEqual(['a', 'b', 'c'])
  })

  it('shuffles without losing or adding items', () => {
    const items = Array.from({ length: 20 }, (_, i) => `item${i}`)
    const out = run(items.join('\n'), 'shuffle').split('\n')
    expect(out.toSorted()).toEqual(items.toSorted())
  })

  it('needs at least one item', () => {
    expect(() => run('  \n ', 'pick')).toThrow('at least one')
  })
})
