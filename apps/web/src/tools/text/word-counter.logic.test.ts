import { describe, expect, it } from 'vitest'
import { analyze, duration, keywords } from './word-counter.logic.ts'

describe('analyze', () => {
  it('counts words apart from punctuation', () => {
    expect(analyze("Hello, world! It's fine.").words).toBe(4)
  })

  it('counts characters as graphemes, so an emoji family is one', () => {
    const stats = analyze('a 👨‍👩‍👧 b')
    expect(stats.characters).toBe(5)
    expect(stats.charactersNoSpaces).toBe(3)
  })

  it('counts paragraphs and sentences', () => {
    const stats = analyze('One. Two!\n\nThree?\n\n\n')
    expect(stats.paragraphs).toBe(2)
    expect(stats.sentences).toBe(3)
  })

  it('finds words in Japanese, which has no spaces', () => {
    expect(analyze('私は猫です。', 'ja').words).toBeGreaterThan(1)
  })

  it('measures reading time by characters for Japanese', () => {
    const text = '日本語'.repeat(500)
    expect(analyze(text, 'ja').readingSeconds).toBe(180)
  })

  it('is zero for an empty text', () => {
    expect(analyze('')).toMatchObject({ words: 0, characters: 0, sentences: 0, lines: 0 })
  })
})

describe('keywords', () => {
  it('ranks by count and skips filler and short words', () => {
    const list = keywords('The cat and the dog. The cat saw a bird. Cat, cat!')
    expect(list[0]).toMatchObject({ word: 'cat', count: 4 })
    expect(list.map((k) => k.word)).not.toContain('the')
    expect(list.map((k) => k.word)).toEqual(['cat', 'bird', 'dog', 'saw'])
  })
})

describe('duration', () => {
  it('formats seconds and minutes', () => {
    expect(duration(45)).toBe('45 s')
    expect(duration(60)).toBe('1 min')
    expect(duration(135)).toBe('2 min 15 s')
  })
})
