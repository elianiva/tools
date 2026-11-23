import { describe, expect, it } from 'vitest'
import { run } from './random-string.ts'

describe('random-string', () => {
  it('has the asked length and only characters of the chosen set', () => {
    expect(run('40', 'hex')).toMatch(/^[0-9a-f]{40}$/u)
    expect(run('25', 'digits')).toMatch(/^\d{25}$/u)
    expect(run('25', 'letters')).toMatch(/^[A-Za-z]{25}$/u)
    expect(run('50', 'alnum')).toMatch(/^[A-Za-z0-9]{50}$/u)
    expect(run('256', 'url')).toMatch(/^[A-Za-z0-9_-]{256}$/u)
  })

  it('uses sixteen characters by default and differs between runs', () => {
    expect(run('', 'alnum')).toHaveLength(16)
    expect(run('32', 'alnum')).not.toBe(run('32', 'alnum'))
  })

  it('reaches every digit', () => {
    expect(new Set(run('256', 'digits')).size).toBe(10)
  })

  it('rejects lengths out of range', () => {
    expect(() => run('257', 'hex')).toThrow('1 to 256')
  })
})
