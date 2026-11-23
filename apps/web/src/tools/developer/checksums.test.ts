import { describe, expect, it } from 'vitest'
import { run } from './checksums.ts'

describe('checksums', () => {
  it('case 1', () => {
    expect(run('hello', 'crc32')).toBe('3610a686')
  })
  it('case 2', () => {
    expect(run('123456789', 'crc32')).toBe('cbf43926')
  })
  it('case 3', () => {
    expect(run('Wikipedia', 'adler32')).toBe('11e60398')
  })
  it('case 4', () => {
    expect(run('a', 'adler32')).toBe('00620062')
  })
})
