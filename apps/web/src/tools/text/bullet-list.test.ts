import { describe, expect, it } from 'vitest'
import { run } from './bullet-list.ts'

describe('bullet-list', () => {
  it('case 1', () => {
    expect(run('a\n b\n\nc', 'bullets')).toBe('- a\n- b\n- c')
  })
  it('case 2', () => {
    expect(run('a\nb', 'numbered')).toBe('1. a\n2. b')
  })
  it('case 3', () => {
    expect(run('1. a', 'checklist')).toBe('- [ ] a')
  })
  it('case 4', () => {
    expect(run('- [x] done\n2) two\n* three', 'strip')).toBe('done\ntwo\nthree')
  })
  it('case 5', () => {
    expect(run('- a\n- b', 'numbered')).toBe('1. a\n2. b')
  })
})
