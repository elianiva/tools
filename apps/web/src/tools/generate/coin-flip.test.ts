import { describe, expect, it } from 'vitest'
import { run } from './coin-flip.ts'

describe('coin-flip', () => {
  it('shows each flip and the totals for a few flips', () => {
    const [flips = '', heads = '', tails = ''] = run('10').split('\n')
    expect(flips.split(' ')).toHaveLength(10)
    const h = Number(heads.replace('Heads: ', ''))
    expect(h + Number(tails.replace('Tails: ', ''))).toBe(10)
    expect(h).toBe(flips.split(' ').filter((f) => f === 'H').length)
  })

  it('shows only totals for many flips, and both sides come up', () => {
    const [heads = '', tails = '', extra] = run('1000').split('\n')
    const h = Number(heads.replace('Heads: ', ''))
    expect(extra).toBeUndefined()
    expect(h + Number(tails.replace('Tails: ', ''))).toBe(1000)
    expect(h).toBeGreaterThan(300)
    expect(h).toBeLessThan(700)
  })

  it('treats junk as one flip and caps at a thousand', () => {
    expect(run('x').split('\n')[0]).toMatch(/^[HT]$/u)
    expect(run('99999')).toMatch(/^Heads: \d+\nTails: \d+$/u)
  })
})
