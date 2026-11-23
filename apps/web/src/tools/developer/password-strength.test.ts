import { describe, expect, it } from 'vitest'
import { run } from './password-strength.ts'

describe('password-strength', () => {
  it('case 1', () => {
    expect(run('password')).toBe('Length: 8\nEntropy: 37 bits\nStrength: Weak')
  })
  it('case 2', () => {
    expect(run('Tr0ub4dor&3')).toBe('Length: 11\nEntropy: 72 bits\nStrength: Strong')
  })
  it('case 3', () => {
    expect(run('1234')).toBe('Length: 4\nEntropy: 13 bits\nStrength: Very weak')
  })
  it('case 4', () => {
    expect(run('correct horse battery staple')).toContain('Strength: Very strong')
  })
})
