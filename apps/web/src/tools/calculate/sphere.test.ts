import { describe, expect, it } from 'vitest'
import { run } from './sphere.ts'

describe('sphere', () => {
  it('case 1', () => {
    expect(run('1')).toBe('Volume: 4.1888\nSurface area: 12.5664')
  })
  it('case 2', () => {
    expect(run('3')).toBe('Volume: 113.0973\nSurface area: 113.0973')
  })
  it('case 3', () => {
    expect(run('0.5')).toBe('Volume: 0.5236\nSurface area: 3.1416')
  })
  it('case 4', () => {
    expect(() => run('0')).toThrow('above zero')
  })
})
