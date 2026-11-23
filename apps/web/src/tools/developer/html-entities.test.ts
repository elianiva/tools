import { describe, expect, it } from 'vitest'
import { run } from './html-entities.ts'

describe('html-entities', () => {
  it('case 1', () => {
    expect(run('<a href="x">&</a>', 'encode')).toBe('&lt;a href=&quot;x&quot;&gt;&amp;&lt;/a&gt;')
  })
  it('case 2', () => {
    expect(run('&lt;p&gt; &amp; &#169; &#x1F600; &copy;', 'decode')).toBe('<p> & © 😀 ©')
  })
  it('case 3', () => {
    expect(run('é 😀', 'encode-all')).toBe('&#233; &#128512;')
  })
  it('case 4', () => {
    expect(run('&unknown; &#99999999;', 'decode')).toBe('&unknown; &#99999999;')
  })
})
