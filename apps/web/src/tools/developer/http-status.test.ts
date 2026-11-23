import { describe, expect, it } from 'vitest'
import { run } from './http-status.ts'

describe('http-status', () => {
  it('case 1', () => {
    expect(run('404')).toContain('404 Not Found: Nothing lives at this address.')
  })
  it('case 2', () => {
    expect(run('teapot')).toContain('418')
  })
  it('case 3', () => {
    expect(run('4xx')).toContain('429 Too Many Requests')
  })
  it('case 4', () => {
    expect(run('rate limit')).toContain('429')
  })
  it('case 5', () => {
    expect(() => run('999')).toThrow('No status code')
  })
})
