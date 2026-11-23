import { createHash } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { hashText } from './hash.logic.ts'

describe('hashText', () => {
  it('matches the published test vectors', () => {
    expect(hashText('abc', 'sha256')).toBe(
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    )
    expect(hashText('abc', 'sha1')).toBe('a9993e364706816aba3e25717850c26c9cd0d89d')
    expect(hashText('', 'md5')).toBe('d41d8cd98f00b204e9800998ecf8427e')
  })

  it('hashes the UTF-8 bytes of non-ASCII text, as Node does', () => {
    for (const text of ['é', '日本語', '👨‍👩‍👧']) {
      expect(hashText(text, 'sha512')).toBe(createHash('sha512').update(text, 'utf8').digest('hex'))
    }
  })
})
