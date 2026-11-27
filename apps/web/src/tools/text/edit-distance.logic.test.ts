import { describe, expect, it } from 'vitest'
import { align } from './edit-distance.logic.ts'

const cost = (a: string, b: string): number =>
  align(a, b).filter((step) => step.kind !== 'same').length

describe('align', () => {
  it('uses as many edits as the distance', () => {
    expect(cost('kitten', 'sitting')).toBe(3)
    expect(cost('', 'abc')).toBe(3)
    expect(cost('same', 'same')).toBe(0)
  })

  it('rebuilds both texts from its steps', () => {
    const steps = align('flaw', 'lawn')
    expect(steps.map((step) => step.from).join('')).toBe('flaw')
    expect(steps.map((step) => step.to).join('')).toBe('lawn')
  })
})
