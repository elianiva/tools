import { describe, expect, it } from 'vitest'
import { run } from './find-replace.ts'

describe('find-replace', () => {
  it('case 1', () => {
    expect(run('cat => dog\nthe cat sat on a cat', 'plain')).toBe('the dog sat on a dog')
  })
  it('case 2', () => {
    expect(run('a => $&\nbanana', 'plain')).toBe('b$&n$&n$&')
  })
  it('case 3', () => {
    expect(run('(\\d+) => <$1>\nroom 12 and 345', 'regex')).toBe('room <12> and <345>')
  })
  it('case 4', () => {
    expect(run('x => \nabxc', 'plain')).toBe('abc')
  })
  it('case 5', () => {
    expect(() => run('no arrow here', 'plain')).toThrow('first line')
  })
  it('case 6', () => {
    expect(() => run('( => x\nabc', 'regex')).toThrow('not a valid pattern')
  })
  it('case 7', () => {
    expect(() => run(' => x\nabc', 'plain')).toThrow('find part is empty')
  })
})
