import { describe, expect, it } from 'vitest'
import { run } from './sentence-splitter.ts'

describe('sentence-splitter', () => {
  it('case 1', () => {
    expect(run('Hi there. How are you? Fine!')).toBe('Hi there.\nHow are you?\nFine!')
  })
  it('case 2', () => {
    expect(run('One.')).toBe('One.')
  })
})
