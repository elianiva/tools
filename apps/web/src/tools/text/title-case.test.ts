import { describe, expect, it } from 'vitest'
import { run } from './title-case.ts'

describe('title-case', () => {
  it('case 1', () => {
    expect(run('the lord of the rings')).toBe('The Lord of the Rings')
  })
  it('case 2', () => {
    expect(run('WHAT TO DO IN PARIS')).toBe('What to Do in Paris')
  })
  it('case 3', () => {
    expect(run('what is this for')).toBe('What Is This For')
  })
  it('case 4', () => {
    expect(run("don't stop believing\nwar and peace")).toBe("Don't Stop Believing\nWar and Peace")
  })
  it('case 5', () => {
    expect(run('a tale of two cities')).toBe('A Tale of Two Cities')
  })
})
