import { describe, expect, it } from 'vitest'
import { run } from './upside-down.ts'

describe('upside-down', () => {
  it('case 1', () => {
    expect(run('hello')).toBe('ollǝɥ')
  })
  it('case 2', () => {
    expect(run('Hi!')).toBe('¡ᴉɥ')
  })
})
