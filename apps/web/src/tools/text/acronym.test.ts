import { describe, expect, it } from 'vitest'
import { run } from './acronym.ts'

describe('acronym', () => {
  it('case 1', () => {
    expect(run('portable network graphics', 'all')).toBe('PNG')
  })
  it('case 2', () => {
    expect(run('University of the Arts', 'skip')).toBe('UA')
  })
  it('case 3', () => {
    expect(run('University of the Arts', 'all')).toBe('UOTA')
  })
  it('case 4', () => {
    expect(run('self-contained underwater breathing apparatus', 'all')).toBe('SCUBA')
  })
})
