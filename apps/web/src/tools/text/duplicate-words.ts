import { button, columns, hint, panel, stack, stats } from '../kit.ts'
import { removeRepeats, repeatedRuns } from './duplicate-words.logic.ts'
import { chips, defineTextTool, marked, sourcePanel, type Piece } from './ui.ts'

export const run = (text: string): string => {
  const words = [...new Intl.Segmenter(undefined, { granularity: 'word' }).segment(text)]
    .filter((part) => part.isWordLike === true)
    .map((part) => part.segment.toLowerCase())
  const found: Array<string> = []
  let start = 0
  for (let i = 1; i <= words.length; i += 1) {
    if (words[i] === words[start]) continue
    if (i - start > 1) found.push(`${words[start]}: words ${start + 1}-${i}`)
    start = i
  }
  return found.length === 0 ? 'No repeated words.' : found.join('\n')
}

const pieces = (text: string): ReadonlyArray<Piece> => {
  const out: Array<Piece> = []
  let at = 0
  for (const found of repeatedRuns(text)) {
    out.push({ text: text.slice(at, found.start) })
    out.push({ text: text.slice(found.start, found.end), kind: 'warn' })
    at = found.end
  }
  out.push({ text: text.slice(at) })
  return out
}

export const duplicateWords = defineTextTool({
  meta: {
    id: 'duplicate-words',
    name: 'Repeated words',
    category: 'text',
    description: 'Find words typed twice in a row, such as the the.',
    keywords: ['duplicate words', 'repeated', 'typo', 'proofread', 'double'],
  },
  example: 'the the cat sat sat down. It was was a very very quiet night.',
  files: true,
  render: (c) => {
    const { h } = c
    const found = repeatedRuns(c.input)
    return h.div(
      [h.Class(stack)],
      [
        columns(h, [
          sourcePanel(c),
          panel(h, 'Repeats', [
            c.input.trim() === ''
              ? hint(h, 'Paste text to check.')
              : found.length === 0
                ? hint(h, 'No repeated words.')
                : h.div(
                    [h.Class(stack)],
                    [
                      stats(h, [
                        ['Repeats', String(found.length)],
                        [
                          'Extra words',
                          String(found.reduce((sum, item) => sum + item.count - 1, 0)),
                        ],
                      ]),
                      chips(
                        h,
                        found.map((item) => ({ text: item.word, note: `×${item.count}` })),
                      ),
                      marked(h, 'Text with repeats highlighted', pieces(c.input)),
                      button(
                        h,
                        { variant: 'primary', size: 'sm' },
                        [h.OnClick(c.setInput(removeRepeats(c.input)))],
                        ['Remove repeats'],
                      ),
                    ],
                  ),
          ]),
        ]),
      ],
    )
  },
})
