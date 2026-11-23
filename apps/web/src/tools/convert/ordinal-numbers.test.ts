import { describe, expect, it } from 'vitest'
import { run } from './ordinal-numbers.ts'

describe('ordinal-numbers', () => {
  it('case 1', () => {
    expect(run('1 2 3 4 11 12 13 21 22 101 111 112')).toBe(
      '1st 2nd 3rd 4th 11th 12th 13th 21st 22nd 101st 111th 112th',
    )
  })
  it('case 2', () => {
    expect(run('1.5 and 2')).toBe('1.5 and 2nd')
  })
  it('case 3', () => {
    expect(run('finished 3.')).toBe('finished 3rd.')
  })
  it('case 4', () => {
    expect(run('0')).toBe('0th')
  })
})
