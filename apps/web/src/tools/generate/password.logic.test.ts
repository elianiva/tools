import { describe, expect, it } from 'vitest'
import { entropyBits, generatePassword, secureInt, SET_IDS, SETS } from './password.logic.ts'

const has = (password: string, chars: string) => [...password].some((c) => chars.includes(c))

describe('generatePassword', () => {
  it('has the asked length and every chosen kind, even when random always picks the first', () => {
    const password = generatePassword(8, SET_IDS, () => 0)
    expect(password).toHaveLength(8)
    for (const id of SET_IDS) expect(has(password, SETS[id])).toBe(true)
  })

  it('uses only the chosen kinds', () => {
    for (let i = 0; i < 50; i += 1) {
      const password = generatePassword(20, ['digits'], secureInt)
      expect(password).toMatch(/^\d{20}$/u)
    }
  })

  it('keeps every kind across many real draws at the shortest length', () => {
    for (let i = 0; i < 200; i += 1) {
      const password = generatePassword(4, SET_IDS, secureInt)
      for (const id of SET_IDS) expect(has(password, SETS[id])).toBe(true)
    }
  })

  it('refuses an empty choice', () => {
    expect(() => generatePassword(16, [], secureInt)).toThrow('at least one')
  })
})

describe('secureInt', () => {
  it('stays in range and reaches both ends', () => {
    const seen = new Set<number>()
    for (let i = 0; i < 500; i += 1) seen.add(secureInt(3))
    expect([...seen].toSorted()).toEqual([0, 1, 2])
  })
})

describe('entropyBits', () => {
  it('is length times log2 of the pool', () => {
    expect(entropyBits(16, ['lower'])).toBe(75)
    expect(entropyBits(10, ['digits'])).toBe(33)
    expect(entropyBits(10, [])).toBe(0)
  })
})
