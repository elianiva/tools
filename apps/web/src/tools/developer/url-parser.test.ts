import { describe, expect, it } from 'vitest'
import { run } from './url-parser.ts'

describe('url-parser', () => {
  it('case 1', () => {
    expect(run('https://x.com/a?b=1&c=hello%20w#top')).toContain('c = hello w')
  })
  it('case 2', () => {
    expect(run('https://x.com/a?b=1&c=hello%20w#top')).toContain('Host: x.com')
  })
  it('case 3', () => {
    expect(run('https://x.com/a?b=1&c=hello%20w#top')).toContain('Path: /a')
  })
  it('case 4', () => {
    expect(run('https://x.com/a?b=1&c=hello%20w#top')).toContain('Hash: #top')
  })
  it('case 5', () => {
    expect(run('example.com:8080/p')).toContain('Host: example.com:8080')
  })
  it('case 6', () => {
    expect(() => run('http://')).toThrow('not a valid URL')
  })
})
