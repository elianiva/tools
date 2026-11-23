import { describe, expect, it } from 'vitest'
import { run } from './emoji-remover.ts'

describe('emoji-remover', () => {
  it('case 1', () => {
    expect(run('hi 😀 there')).toBe('hi there')
  })
  it('case 2', () => {
    expect(run('a👨‍👩‍👧b')).toBe('ab')
  })
  it('case 3', () => {
    expect(run('ok 👍🏽!')).toBe('ok !')
  })
  it('case 4', () => {
    expect(run('© 2024 😀')).toBe('© 2024')
  })
  it('case 5', () => {
    expect(run('plain text')).toBe('plain text')
  })
})
