import { describe, expect, it } from 'vitest'
import { run } from './whitespace-cleaner.ts'

describe('whitespace-cleaner', () => {
  it('case 1', () => {
    expect(run('a   b \t c', 'collapse')).toBe('a b c')
  })
  it('case 2', () => {
    expect(run('  a  \n b ', 'trim')).toBe('a\nb')
  })
  it('case 3', () => {
    expect(run('a b\nc', 'strip')).toBe('abc')
  })
  it('case 4', () => {
    expect(run('a\tb', 'tabs')).toBe('a    b')
  })
  it('case 5', () => {
    expect(run('a\u200Bb', 'invisible')).toBe('ab')
  })
})
