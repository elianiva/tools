import { describe, expect, it } from 'vitest'
import { run } from './dice-roller.ts'

const parse = (out: string) => {
  const [rolls = '', total = ''] = out.split('\n')
  return {
    rolls: rolls.replace('Rolls: ', '').split(', ').map(Number),
    total: Number(total.replace('Total: ', '')),
  }
}

describe('dice-roller', () => {
  it('rolls within range and adds the bonus to the total', () => {
    for (let i = 0; i < 200; i += 1) {
      const { rolls, total } = parse(run('3d6+2'))
      expect(rolls).toHaveLength(3)
      for (const roll of rolls) expect(roll).toBeGreaterThanOrEqual(1)
      for (const roll of rolls) expect(roll).toBeLessThanOrEqual(6)
      expect(total).toBe(rolls.reduce((a, b) => a + b, 0) + 2)
    }
  })

  it('treats a bare d20 as one die and allows a negative bonus', () => {
    const { rolls, total } = parse(run('d20 - 3'))
    expect(rolls).toHaveLength(1)
    expect(total).toBe((rolls[0] ?? 0) - 3)
  })

  it('reaches both ends of the die', () => {
    const seen = new Set<number>()
    for (let i = 0; i < 300; i += 1) seen.add(parse(run('1d4')).total)
    expect([...seen].toSorted()).toEqual([1, 2, 3, 4])
  })

  it('rejects bad rolls', () => {
    expect(() => run('hello')).toThrow('2d6+3')
    expect(() => run('101d6')).toThrow('1 to 100')
    expect(() => run('1d1')).toThrow('2 to 1000')
  })
})
