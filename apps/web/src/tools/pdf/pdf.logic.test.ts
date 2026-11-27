import { describe, expect, it } from 'vitest'
import {
  blocksOf,
  describeSize,
  parseGroups,
  parsePages,
  pdfName,
  withoutPages,
} from './pdf.logic.ts'

describe('parsePages', () => {
  it('keeps the order written, including repeats', () => {
    expect(parsePages('3, 1, 3', 5)).toEqual([3, 1, 3])
  })

  it('opens a range at either end', () => {
    expect(parsePages('4-', 6)).toEqual([4, 5, 6])
    expect(parsePages('-2', 6)).toEqual([1, 2])
  })

  it('runs a backwards range backwards', () => {
    expect(parsePages('5-3', 6)).toEqual([5, 4, 3])
  })

  it('means every page when empty', () => {
    expect(parsePages('  ', 3)).toEqual([1, 2, 3])
  })

  it('names the page that is out of range, on both sides', () => {
    expect(() => parsePages('1-9', 5)).toThrow('Page 9 is outside 1–5.')
    expect(() => parsePages('0', 5)).toThrow('Page 0 is outside 1–5.')
  })

  it('rejects words and a lone dash', () => {
    expect(() => parsePages('two', 5)).toThrow('"two" is not a page')
    expect(() => parsePages('-', 5)).toThrow('is not a page')
  })
})

describe('parseGroups', () => {
  it('makes one group per comma', () => {
    expect(parseGroups('1-2, 4', 5)).toEqual([[1, 2], [4]])
  })

  it('keeps spaces inside a group as separate pages', () => {
    expect(parseGroups('1 3, 5', 5)).toEqual([[1, 3], [5]])
  })
})

describe('blocksOf', () => {
  it('leaves a short last block', () => {
    expect(blocksOf(5, 2)).toEqual([[1, 2], [3, 4], [5]])
  })

  it('treats a size below one as one', () => {
    expect(blocksOf(2, 0)).toEqual([[1], [2]])
  })
})

describe('withoutPages', () => {
  it('drops pages once even when they repeat', () => {
    expect(withoutPages(4, [2, 2, 4])).toEqual([1, 3])
  })
})

describe('names and sizes', () => {
  it('swaps the extension', () => {
    expect(pdfName('Annual report.v2.PDF', '-part-1')).toBe('Annual report.v2-part-1.pdf')
    expect(pdfName('scan', '-merged')).toBe('scan-merged.pdf')
  })

  it('names a paper size in either direction', () => {
    expect(describeSize(595.28, 841.89)).toBe('595 × 842 pt (A4)')
    expect(describeSize(792, 612)).toBe('792 × 612 pt (Letter)')
    expect(describeSize(300, 300)).toBe('300 × 300 pt')
  })
})
