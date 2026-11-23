import { describe, expect, it } from 'vitest'
import { runRegex, slices } from './regex.logic.ts'

describe('runRegex', () => {
  it('finds every match with its position and groups', () => {
    const run = runRegex('(\\d+)-(\\w)', '', 'a 12-x b 7-y')
    expect(run.matches).toEqual([
      { index: 2, text: '12-x', groups: ['12', 'x'] },
      { index: 9, text: '7-y', groups: ['7', 'y'] },
    ])
  })

  it('applies flags', () => {
    expect(runRegex('abc', 'i', 'ABC abc').matches).toHaveLength(2)
    expect(runRegex('^b', 'm', 'a\nb').matches).toHaveLength(1)
  })

  it('terminates on a pattern that matches nothing', () => {
    expect(runRegex('a*', '', 'bbb').matches.length).toBe(4)
  })

  it('reports a broken pattern without throwing', () => {
    expect(runRegex('(', '', 'x').error).toContain('Unterminated group')
  })

  it('stops at 500 matches and says so', () => {
    const run = runRegex('a', '', 'a'.repeat(900))
    expect(run.matches).toHaveLength(500)
    expect(run.truncated).toBe(true)
  })
})

describe('slices', () => {
  it('splits the text around matches and skips empty ones', () => {
    const text = 'xx12yy3'
    expect(slices(text, runRegex('\\d+', '', text).matches)).toEqual([
      { text: 'xx', hit: false },
      { text: '12', hit: true },
      { text: 'yy', hit: false },
      { text: '3', hit: true },
    ])
    expect(slices('abc', runRegex('x*', '', 'abc').matches)).toEqual([{ text: 'abc', hit: false }])
  })
})
