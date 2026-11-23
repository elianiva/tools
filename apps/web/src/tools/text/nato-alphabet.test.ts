import { describe, expect, it } from 'vitest'
import { run } from './nato-alphabet.ts'

describe('nato-alphabet', () => {
  it('case 1', () => {
    expect(run('Hi 5')).toBe('Hotel India / Five')
  })
  it('case 2', () => {
    expect(run('a-z')).toBe('Alfa - Zulu')
  })
})
