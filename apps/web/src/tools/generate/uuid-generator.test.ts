import { describe, expect, it } from 'vitest'
import { run } from './uuid-generator.ts'

describe('uuid-generator', () => {
  it('writes the asked number of distinct version 4 UUIDs', () => {
    const lines = run('3').split('\n')
    expect(lines).toHaveLength(3)
    for (const line of lines) {
      expect(line).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/u)
    }
    expect(new Set(lines).size).toBe(3)
  })

  it('caps the count at 100 and treats junk as one', () => {
    expect(run('5000').split('\n')).toHaveLength(100)
    expect(run('abc').split('\n')).toHaveLength(1)
  })
})
