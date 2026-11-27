import { panel, stats } from '../kit.ts'
import { align } from './edit-distance.logic.ts'
import { banner, defineLab, layout, pairOf, pairPanel, tile, tileStrip } from './ui-b.ts'

export const run = (text: string): string => {
  const lines = text.split('\n').map((line) => line.replace(/\r$/u, ''))
  const [first, second] = lines
  if (lines.length !== 2 || first === undefined || second === undefined)
    throw new Error('Enter two lines to compare.')
  const x = Array.from(first)
  const y = Array.from(second)
  let previous = Array.from({ length: y.length + 1 }, (_, index) => index)
  for (let i = 1; i <= x.length; i += 1) {
    const row = [i]
    for (let j = 1; j <= y.length; j += 1) {
      row.push(
        Math.min(
          (previous[j] ?? 0) + 1,
          (row[j - 1] ?? 0) + 1,
          (previous[j - 1] ?? 0) + (x[i - 1] === y[j - 1] ? 0 : 1),
        ),
      )
    }
    previous = row
  }
  const distance = previous[y.length] ?? 0
  const longest = Math.max(x.length, y.length)
  return `Distance: ${distance}\nSimilarity: ${longest === 0 ? '100.0' : ((1 - distance / longest) * 100).toFixed(1)}%`
}
const MARK = { sub: '→', ins: '+', del: '−' } as const

export const editDistance = defineLab({
  meta: {
    id: 'edit-distance',
    name: 'Edit distance',
    category: 'text',
    description: 'How many single-character edits turn one line into another.',
    keywords: ['levenshtein', 'edit distance', 'similarity', 'fuzzy', 'typo', 'compare'],
  },
  example: 'kitten\nsitting',
  view: (ctx) => {
    const { h, model } = ctx
    const [first, second] = pairOf(model.input)
    const facts = run(`${first}\n${second}`)
      .split('\n')
      .map((line) => {
        const [label = '', value = ''] = line.split(': ')
        return [label, value] as const
      })
    const steps =
      Array.from(first).length > 150 || Array.from(second).length > 150 ? [] : align(first, second)
    const same = first === second
    return layout(
      h,
      [],
      [
        pairPanel(ctx, { labels: ['From', 'To'], placeholders: ['kitten', 'sitting'] }),
        first === '' && second === ''
          ? null
          : panel(h, null, [
              stats(h, facts),
              steps.length === 0
                ? null
                : tileStrip(
                    h,
                    steps.map((step) =>
                      tile(h, {
                        top: step.from === '' ? '∅' : step.from,
                        ...(step.kind === 'same' ? {} : { join: MARK[step.kind] }),
                        bottom: step.to === '' ? '∅' : step.to,
                        state: step.kind === 'same' ? 'same' : 'diff',
                      }),
                    ),
                  ),
              same ? banner(h, { yes: true, title: 'Identical', detail: '' }) : null,
            ]),
      ],
    )
  },
})
