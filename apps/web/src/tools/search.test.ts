import { describe, expect, it } from 'vitest'
import { groupByBestMatch, groupTools, highlight, searchTools } from './search.ts'
import type { Tool } from './tool.ts'

const tool = (
  id: string,
  name: string,
  keywords: ReadonlyArray<string>,
  description = '',
  category: Tool['meta']['category'] = 'text',
): Tool => ({
  meta: { id, name, category, description, keywords },
  init: () => null,
  update: (model) => ({ model }),
  view: () => null,
  receive: undefined,
})

const list = [
  tool('json', 'JSON formatter', ['pretty', 'minify']),
  tool('count', 'Word counter', ['characters', 'length']),
  tool('case', 'Case converter', ['upper', 'lower']),
  tool('qr', 'QR code generator', [], 'Make a code from a link.'),
]

describe('searchTools', () => {
  it('returns everything for an empty query', () => {
    expect(searchTools(list, '  ')).toHaveLength(4)
  })

  it('ranks a name prefix above a word prefix', () => {
    expect(searchTools(list, 'c').map((t) => t.meta.id)).toEqual(['case', 'count', 'qr'])
  })

  it('needs every word to match', () => {
    expect(searchTools(list, 'word json')).toEqual([])
    expect(searchTools(list, 'json pretty').map((t) => t.meta.id)).toEqual(['json'])
  })

  it('finds a tool by keyword and by description', () => {
    expect(searchTools(list, 'minify').map((t) => t.meta.id)).toEqual(['json'])
    expect(searchTools(list, 'link').map((t) => t.meta.id)).toEqual(['qr'])
  })
})

describe('highlight', () => {
  const marked = (text: string, query: string): ReadonlyArray<string> =>
    highlight(text, query).map((piece) => (piece.match ? `[${piece.text}]` : piece.text))

  it('leaves the text whole when nothing matches', () => {
    expect(marked('Word counter', 'zzz')).toEqual(['Word counter'])
    expect(marked('Word counter', '')).toEqual(['Word counter'])
  })

  it('marks the matched run in place', () => {
    expect(marked('Word counter', 'count')).toEqual(['Word ', '[count]', 'er'])
    expect(marked('Base64', '64')).toEqual(['Base', '[64]'])
  })

  it('marks every query word and merges runs that touch', () => {
    expect(marked('Timestamp converter', 'time conv')).toEqual([
      '[Time]',
      'stamp ',
      '[conv]',
      'erter',
    ])
    expect(marked('Base64', 'base 64')).toEqual(['[Base64]'])
  })

  it('ignores case and only marks the first place a word appears', () => {
    expect(marked('Case case', 'CASE')).toEqual(['[Case]', ' case'])
  })
})

describe('groupTools', () => {
  it('keeps registry order inside a category and drops empty ones', () => {
    expect(groupTools(list).map((group) => group.tools.map((t) => t.meta.id))).toEqual([
      ['json', 'count', 'case', 'qr'],
    ])
  })
})

describe('groupByBestMatch', () => {
  const ranked = [
    tool('time', 'Timestamp converter', [], '', 'convert'),
    tool('count', 'Word counter', [], '', 'text'),
    tool('clock', 'Clock', [], '', 'convert'),
  ]

  it('puts the category of the best hit first and keeps ranks inside a group', () => {
    expect(
      groupByBestMatch(ranked).map((group) => [group.name, group.tools.map((t) => t.meta.id)]),
    ).toEqual([
      ['Convert', ['time', 'clock']],
      ['Text', ['count']],
    ])
  })
})
