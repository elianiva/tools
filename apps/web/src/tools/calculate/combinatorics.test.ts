import { describe, expect, it } from 'vitest'
import { run } from './combinatorics.ts'

describe('combinatorics', () => {
  it('case 1', () => {
    expect(run('5 2')).toBe('Combinations: 10\nPermutations: 20')
  })
  it('case 2', () => {
    expect(run('52 5')).toBe('Combinations: 2598960\nPermutations: 311875200')
  })
  it('case 3', () => {
    expect(run('10 0')).toBe('Combinations: 1\nPermutations: 1')
  })
  it('case 4', () => {
    expect(run('6 6')).toBe('Combinations: 1\nPermutations: 720')
  })
  it('case 5', () => {
    expect(() => run('2 5')).toThrow('r cannot be larger')
  })
  it('case 6', () => {
    expect(() => run('5')).toThrow('Enter n and r')
  })
})
