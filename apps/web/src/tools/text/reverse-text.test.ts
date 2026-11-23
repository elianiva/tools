import { describe, expect, it } from 'vitest'
import { run } from './reverse-text.ts'

describe('reverse-text', () => {
  it('case 1', () => {
    expect(run('abc', 'chars')).toBe('cba')
  })
  it('case 2', () => {
    expect(run('a b c', 'words')).toBe('c b a')
  })
  it('case 3', () => {
    expect(run('x\ny', 'lines')).toBe('y\nx')
  })
  it('case 4', () => {
    expect(run('a👨‍👩‍👧', 'chars')).toBe('👨‍👩‍👧a')
  })
})
