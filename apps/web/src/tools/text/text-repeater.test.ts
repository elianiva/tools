import { describe, expect, it } from 'vitest'
import { run } from './text-repeater.ts'

describe('text-repeater', () => {
  it('case 1', () => {
    expect(run('hi', '2')).toBe('hi\nhi')
  })
  it('case 2', () => {
    expect(run('x', '10')).toBe(Array(10).fill('x').join('\n'))
  })
})
