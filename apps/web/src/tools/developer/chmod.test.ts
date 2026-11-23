import { describe, expect, it } from 'vitest'
import { run } from './chmod.ts'

describe('chmod', () => {
  it('case 1', () => {
    expect(run('755', 'to-symbolic')).toBe('rwxr-xr-x')
  })
  it('case 2', () => {
    expect(run('644', 'to-symbolic')).toBe('rw-r--r--')
  })
  it('case 3', () => {
    expect(run('000', 'to-symbolic')).toBe('---------')
  })
  it('case 4', () => {
    expect(run('rwxr-xr-x', 'to-octal')).toBe('755')
  })
  it('case 5', () => {
    expect(run('rw-------', 'to-octal')).toBe('600')
  })
  it('case 6', () => {
    expect(() => run('888', 'to-symbolic')).toThrow('three octal')
  })
  it('case 7', () => {
    expect(() => run('rwx', 'to-octal')).toThrow('nine characters')
  })
})
