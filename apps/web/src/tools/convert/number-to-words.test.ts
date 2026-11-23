import { describe, expect, it } from 'vitest'
import { run } from './number-to-words.ts'

describe('number-to-words', () => {
  it('case 1', () => {
    expect(run('0')).toBe('zero')
  })
  it('case 2', () => {
    expect(run('42')).toBe('forty-two')
  })
  it('case 3', () => {
    expect(run('1,001')).toBe('one thousand one')
  })
  it('case 4', () => {
    expect(run('1000000')).toBe('one million')
  })
  it('case 5', () => {
    expect(run('-215')).toBe('minus two hundred fifteen')
  })
  it('case 6', () => {
    expect(run('123456')).toBe('one hundred twenty-three thousand four hundred fifty-six')
  })
  it('case 7', () => {
    expect(run('2000000003')).toBe('two billion three')
  })
  it('case 8', () => {
    expect(() => run('abc')).toThrow('whole number')
  })
  it('case 9', () => {
    expect(() => run('1000000000000000')).toThrow('999 trillion')
  })
})
