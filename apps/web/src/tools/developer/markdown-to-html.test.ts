import { describe, expect, it } from 'vitest'
import { run } from './markdown-to-html.ts'

describe('markdown-to-html', () => {
  it('case 1', () => {
    expect(run('# Hi\n\n*there* **you**')).toContain('<h1>Hi</h1>')
  })
  it('case 2', () => {
    expect(run('# Hi\n\n*there* **you**')).toContain('<em>there</em> <strong>you</strong>')
  })
  it('case 3', () => {
    expect(run('- a\n- b')).toContain('<li>b</li>')
  })
})
