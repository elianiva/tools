import { describe, expect, it } from 'vitest'
import { run } from './semver-compare.ts'

describe('semver-compare', () => {
  it('case 1', () => {
    expect(run('1.2.3 1.10.0')).toBe('1.10.0 is greater than 1.2.3')
  })
  it('case 2', () => {
    expect(run('2.0.0 2.0.0')).toBe('Both versions are equal.')
  })
  it('case 3', () => {
    expect(run('v1.2.3 1.2.3')).toBe('Both versions are equal.')
  })
  it('case 4', () => {
    expect(run('1.0.0-alpha 1.0.0')).toBe('1.0.0 is greater than 1.0.0-alpha')
  })
  it('case 5', () => {
    expect(run('1.0.0-alpha.2 1.0.0-alpha.10')).toBe('1.0.0-alpha.10 is greater than 1.0.0-alpha.2')
  })
  it('case 6', () => {
    expect(run('1.0.0-alpha 1.0.0-beta')).toBe('1.0.0-beta is greater than 1.0.0-alpha')
  })
  it('case 7', () => {
    expect(run('1.0.0-alpha 1.0.0-alpha.1')).toBe('1.0.0-alpha.1 is greater than 1.0.0-alpha')
  })
  it('case 8', () => {
    expect(run('1.0.0-1 1.0.0-alpha')).toBe('1.0.0-alpha is greater than 1.0.0-1')
  })
  it('case 9', () => {
    expect(() => run('1.0.0')).toThrow('Enter two versions')
  })
  it('case 10', () => {
    expect(() => run('1.0 2.0.0')).toThrow('not a semantic version')
  })
})
