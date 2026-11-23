import { describe, expect, it } from 'vitest'
import { run } from './remove-line-breaks.ts'

describe('remove-line-breaks', () => {
  it('case 1', () => {
    expect(run('a\n b', 'space')).toBe('a b')
  })
  it('case 2', () => {
    expect(run('a\nb\n\nc', 'paragraphs')).toBe('a b\n\nc')
  })
  it('case 3', () => {
    expect(run('a\r\nb\n\nc', 'none')).toBe('abc')
  })
})
