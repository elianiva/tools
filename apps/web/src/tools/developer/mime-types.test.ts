import { describe, expect, it } from 'vitest'
import { run } from './mime-types.ts'

describe('mime-types', () => {
  it('case 1', () => {
    expect(run('png')).toBe('png: image/png')
  })
  it('case 2', () => {
    expect(run('.JPG')).toBe('jpg: image/jpeg')
  })
  it('case 3', () => {
    expect(run('*.woff2')).toBe('woff2: font/woff2')
  })
  it('case 4', () => {
    expect(run('image/jpeg')).toBe('image/jpeg: .jpg, .jpeg')
  })
  it('case 5', () => {
    expect(run('application/yaml')).toBe('application/yaml: .yaml, .yml')
  })
  it('case 6', () => {
    expect(() => run('xyz')).toThrow('not in the list')
  })
  it('case 7', () => {
    expect(() => run('image/xyz')).toThrow('No extension is known')
  })
})
