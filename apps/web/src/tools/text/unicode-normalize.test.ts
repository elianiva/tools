import { describe, expect, it } from 'vitest'
import { run } from './unicode-normalize.ts'

describe('unicode-normalize', () => {
  it('case 1', () => {
    expect(run('e\u0301', 'nfc')).toBe('\u00e9')
  })
  it('case 2', () => {
    expect(run('\u00e9', 'nfd')).toBe('e\u0301')
  })
  it('case 3', () => {
    expect(run('\ufb01', 'nfkc')).toBe('fi')
  })
  it('case 4', () => {
    expect(run('\u2460', 'nfkd')).toBe('1')
  })
  it('case 5', () => {
    expect(run('\ufb01', 'nfc')).toBe('\ufb01')
  })
})
