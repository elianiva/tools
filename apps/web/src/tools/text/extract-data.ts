import { columns, hint, panel, stack, stats } from '../kit.ts'
import {
  attempt,
  chips,
  copyable,
  defineTextTool,
  marked,
  modePicker,
  sourcePanel,
  type Piece,
} from './ui.ts'

export const run = (text: string, mode: string): string => {
  const patterns: Readonly<Record<string, RegExp>> = {
    emails: /[\p{L}\p{N}._%+-]+@[\p{L}\p{N}.-]+\.\p{L}{2,}/gu,
    urls: /https?:\/\/[^\s<>"')]+/gu,
    numbers: /-?\d+(?:\.\d+)?/gu,
    hashtags: /#[\p{L}\p{N}_]+/gu,
    mentions: /@[\p{L}\p{N}_]+/gu,
  }
  const pattern = patterns[mode] ?? patterns['emails']
  const found = (pattern === undefined ? [] : [...text.matchAll(pattern)]).map((match) =>
    mode === 'urls' ? match[0].replace(/[.,;:!?]+$/u, '') : match[0],
  )
  if (found.length === 0) throw new Error('Nothing found.')
  return found.join('\n')
}

const KINDS = [
  { value: 'emails', label: 'Emails' },
  { value: 'urls', label: 'Links' },
  { value: 'numbers', label: 'Numbers' },
  { value: 'hashtags', label: 'Hashtags' },
  { value: 'mentions', label: 'Mentions' },
]

const itemsOf = (text: string, mode: string): ReadonlyArray<string> => {
  const { value } = attempt(() => run(text, mode))
  return value === '' ? [] : value.split('\n')
}

const pieces = (text: string, items: ReadonlyArray<string>): ReadonlyArray<Piece> => {
  const out: Array<Piece> = []
  let at = 0
  for (const item of items) {
    const start = text.indexOf(item, at)
    if (start === -1) continue
    out.push({ text: text.slice(at, start) }, { text: item, kind: 'hit' })
    at = start + item.length
  }
  out.push({ text: text.slice(at) })
  return out
}

export const extractData = defineTextTool({
  meta: {
    id: 'extract-data',
    name: 'Data extractor',
    category: 'text',
    description: 'Pull emails, links, numbers, hashtags, or mentions out of text.',
    keywords: ['email', 'url', 'link', 'number', 'hashtag', 'mention', 'scrape'],
  },
  mode: 'emails',
  example:
    'Mail a.b@x.co or c@y.org. See https://example.com/docs, call 555-0100 on 12 May. #launch @team',
  files: true,
  render: (c) => {
    const { h } = c
    const items = itemsOf(c.input, c.mode)
    return h.div(
      [h.Class(stack)],
      [
        modePicker(
          c,
          KINDS.map((kind) => ({
            value: kind.value,
            label:
              c.input === ''
                ? kind.label
                : `${kind.label} · ${itemsOf(c.input, kind.value).length}`,
          })),
          'Extract',
        ),
        columns(h, [
          sourcePanel(c),
          panel(h, 'Found', [
            items.length === 0
              ? hint(h, c.input === '' ? 'Paste text to search.' : 'Nothing found.')
              : h.div(
                  [h.Class(stack)],
                  [
                    stats(h, [
                      ['Found', String(items.length)],
                      ['Unique', String(new Set(items).size)],
                    ]),
                    copyable(
                      h,
                      items.join('\n'),
                      chips(
                        h,
                        items.map((text) => ({ text })),
                      ),
                    ),
                    marked(h, 'Text with matches highlighted', pieces(c.input, items)),
                  ],
                ),
          ]),
        ]),
      ],
    )
  },
})
