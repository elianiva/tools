import { describe, expect, it } from 'vitest'
import { run } from './palindrome.ts'

describe('palindrome', () => {
  it('case 1', () => {
    expect(run('A man, a plan, a canal: Panama')).toBe('Yes, it is a palindrome.')
  })
  it('case 2', () => {
    expect(run('hello')).toBe('No, it is not a palindrome.')
  })
  it('case 3', () => {
    expect(run('Été')).toBe('Yes, it is a palindrome.')
  })
  it('case 4', () => {
    expect(run('12321')).toBe('Yes, it is a palindrome.')
  })
  it('case 5', () => {
    expect(() => run('!!!')).toThrow('letters or digits')
  })
})
