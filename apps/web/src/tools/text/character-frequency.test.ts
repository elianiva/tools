import { describe, expect, it } from 'vitest'
import { run } from './character-frequency.ts'

describe('character-frequency', () => {
  it('case 1', () => {
    expect(run('aab', 'letters')).toBe('a  2  66.7%\nb  1  33.3%')
  })
  it('case 2', () => {
    expect(run('Aa b!', 'letters')).toBe('a  2  66.7%\nb  1  33.3%')
  })
  it('case 3', () => {
    expect(run('a!!', 'all')).toBe('!  2  66.7%\na  1  33.3%')
  })
  it('case 4', () => {
    expect(() => run('123', 'letters')).toThrow('Nothing to count')
  })
})
