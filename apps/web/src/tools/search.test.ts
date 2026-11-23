import { describe, expect, it } from 'vitest'
import { searchTools } from './search.ts'
import type { Tool } from './tool.ts'

const tool = (
  id: string,
  name: string,
  keywords: ReadonlyArray<string>,
  description = '',
): Tool => ({
  meta: { id, name, category: 'text', description, keywords },
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
