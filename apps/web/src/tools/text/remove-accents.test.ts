import { describe, expect, it } from 'vitest'
import { run } from './remove-accents.ts'

describe('remove-accents', () => {
  it('case 1', () => {
    expect(run('Crème brûlée ñ')).toBe('Creme brulee n')
  })
  it('case 2', () => {
    expect(run('plain')).toBe('plain')
  })
})
