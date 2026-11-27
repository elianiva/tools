import { columns, hint, panel, stack } from '../kit.ts'
import { defineTextTool, display, sourcePanel, useAsInput, type Piece } from './ui.ts'

export const run = (text: string): string => {
  const small = new Set([
    'a',
    'an',
    'and',
    'as',
    'at',
    'but',
    'by',
    'for',
    'in',
    'nor',
    'of',
    'on',
    'or',
    'the',
    'to',
    'up',
    'via',
    'vs',
  ])
  const word = /[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu
  return text
    .split('\n')
    .map((line) => {
      const matches = [...line.matchAll(word)]
      const first = matches[0]?.index
      const last = matches.at(-1)?.index
      return line
        .toLocaleLowerCase()
        .replaceAll(word, (found: string, offset: number) =>
          offset === first || offset === last || !small.has(found)
            ? found.charAt(0).toLocaleUpperCase() + found.slice(1)
            : found,
        )
    })
    .join('\n')
}

/** Words the headline left in lower case are dimmed, so the rule is visible. */
const pieces = (after: string): ReadonlyArray<Piece> =>
  after.split(/(\s+)/u).map((part) => {
    return /^\p{Ll}/u.test(part) ? { text: part, kind: 'dim' as const } : { text: part }
  })

export const titleCase = defineTextTool({
  meta: {
    id: 'title-case',
    name: 'Title case',
    category: 'text',
    description: 'Capitalise a headline the way style guides do.',
    keywords: ['headline', 'capitalize', 'title', 'ap style', 'chicago'],
  },
  example: 'the lord of the rings\nwhat to do in paris',
  files: true,
  render: (c) => {
    const { h } = c
    const value = run(c.input)
    return h.div(
      [h.Class(stack)],
      [
        columns(h, [
          sourcePanel(c, { label: 'Headline', rows: 6 }),
          panel(h, 'Title case', [
            c.input === ''
              ? hint(h, 'Paste a headline.')
              : h.div(
                  [h.Class(stack)],
                  [
                    display(h, 'Title case', value, pieces(value)),
                    hint(h, 'Dimmed words stay in lower case.'),
                    useAsInput(c, value),
                  ],
                ),
          ]),
        ]),
      ],
    )
  },
})
