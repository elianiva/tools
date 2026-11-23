import { describe, expect, it } from 'vitest'
import { run } from './pig-latin.ts'

describe('pig-latin', () => {
  it('case 1', () => {
    expect(run('hello world')).toBe('ellohay orldway')
  })
  it('case 2', () => {
    expect(run('apple')).toBe('appleway')
  })
  it('case 3', () => {
    expect(run('string')).toBe('ingstray')
  })
  it('case 4', () => {
    expect(run('Hello, you!')).toBe('Ellohay, ouyay!')
  })
  it('case 5', () => {
    expect(run('rhythm')).toBe('rhythmay')
  })
})
