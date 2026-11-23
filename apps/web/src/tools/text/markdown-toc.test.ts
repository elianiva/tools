import { describe, expect, it } from 'vitest'
import { run } from './markdown-toc.ts'

describe('markdown-toc', () => {
  it('case 1', () => {
    expect(run('# Intro\n## Setup & Run\n### Deep')).toBe(
      '- [Intro](#intro)\n  - [Setup & Run](#setup--run)\n    - [Deep](#deep)',
    )
  })
  it('case 2', () => {
    expect(run('```\n# not a heading\n```\n## Real')).toBe('- [Real](#real)')
  })
  it('case 3', () => {
    expect(() => run('no headings')).toThrow('No headings')
  })
})
