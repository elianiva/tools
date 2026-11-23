import { describe, expect, it } from 'vitest'
import { run } from './lorem-ipsum.ts'

describe('lorem-ipsum', () => {
  it('case 1', () => {
    expect(run('5', 'words')).toBe('lorem ipsum dolor sit amet')
  })
  it('case 2', () => {
    expect(run('1', 'sentences')).toContain('Lorem ipsum dolor sit amet')
  })
  it('case 3', () => {
    expect(run('1', 'sentences')).toBe(run('1', 'sentences'))
  })
  it('writes the asked number of paragraphs, each four sentences', () => {
    const paragraphs = run('3', 'paragraphs').split('\n\n')
    expect(paragraphs).toHaveLength(3)
    expect(paragraphs[0]?.match(/\./gu)).toHaveLength(4)
  })

  it('caps the count at 200 and treats nonsense as one', () => {
    expect(run('1000', 'words').split(' ')).toHaveLength(200)
    expect(run('abc', 'words').split(' ')).toHaveLength(1)
  })

  it('is the same every time', () => {
    expect(run('2', 'paragraphs')).toBe(run('2', 'paragraphs'))
  })

  it('starts the first sentence with a capital', () => {
    expect(run('1', 'sentences')).toMatch(/^Lorem ipsum dolor sit amet.*\.$/u)
  })
})
