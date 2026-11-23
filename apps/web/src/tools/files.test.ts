import { describe, expect, it } from 'vitest'
import { acceptsFile } from './files.ts'

const file = (name: string, type: string) => new File([''], name, { type })

describe('acceptsFile', () => {
  it('matches wildcards, exact types, and extensions', () => {
    expect(acceptsFile(['image/*'], file('a.png', 'image/png'))).toBe(true)
    expect(acceptsFile(['image/png'], file('a.jpg', 'image/jpeg'))).toBe(false)
    expect(acceptsFile(['.heic'], file('IMG_1.HEIC', ''))).toBe(true)
  })

  it('does not let a type prefix pass for a wildcard', () => {
    expect(acceptsFile(['image/*'], file('a.txt', 'imagery/other'))).toBe(false)
  })
})
