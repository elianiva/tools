import { css } from '../../../styled-system/css'
import { columns, hint, panel, stack, stats } from '../kit.ts'
import { attempt, defineTextTool, errorLine, marked, plural, sourcePanel } from './ui.ts'

export const run = (text: string): string => {
  const words = (text.match(/[A-Za-z']+/gu) ?? []).map((word) => word.toLowerCase())
  if (words.length === 0) throw new Error('Write some English text first.')
  const sentences = Math.max(1, (text.match(/[.!?]+(\s|$)/gu) ?? []).length)
  const syllables = (word: string): number => {
    const clean = word.replaceAll("'", '')
    let count = (clean.match(/[aeiouy]+/gu) ?? []).length
    if (clean.length > 2 && clean.endsWith('e') && !clean.endsWith('le') && count > 1) count -= 1
    return Math.max(1, count)
  }
  const total = words.reduce((sum, word) => sum + syllables(word), 0)
  const ease = 206.835 - 1.015 * (words.length / sentences) - 84.6 * (total / words.length)
  const grade = 0.39 * (words.length / sentences) + 11.8 * (total / words.length) - 15.59
  const label =
    ease >= 90
      ? 'Very easy'
      : ease >= 80
        ? 'Easy'
        : ease >= 70
          ? 'Fairly easy'
          : ease >= 60
            ? 'Plain English'
            : ease >= 50
              ? 'Fairly difficult'
              : ease >= 30
                ? 'Difficult'
                : 'Very difficult'
  return [
    `Words: ${words.length}`,
    `Sentences: ${sentences}`,
    `Syllables: ${total}`,
    `Flesch reading ease: ${ease.toFixed(1)} (${label})`,
    `Grade level: ${grade.toFixed(1)}`,
  ].join('\n')
}

const LONG = 20

const scoreCls = css({ display: 'flex', alignItems: 'baseline', gap: '0.8rem' })
const bigCls = css({
  fontFamily: 'var(--mono)',
  fontSize: '2.6rem',
  fontWeight: 500,
  fontVariantNumeric: 'tabular-nums',
  lineHeight: 1,
})
const gaugeCls = css({
  position: 'relative',
  height: '10px',
  margin: '0.4rem 0',
  borderRadius: '999px',
  background:
    'linear-gradient(90deg, var(--danger), var(--warn) 35%, oklch(0.75 0.14 120) 65%, var(--ok))',
  '& i': {
    position: 'absolute',
    top: '-5px',
    width: '4px',
    height: '20px',
    marginLeft: '-2px',
    borderRadius: '2px',
    background: 'var(--foreground)',
    boxShadow: '0 0 0 2px var(--card)',
    transition: 'left 250ms cubic-bezier(0.23, 1, 0.32, 1)',
  },
})
const scaleCls = css({
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: '0.72rem',
  color: 'var(--muted-foreground)',
})

const field = (value: string, name: string): string =>
  new RegExp(`^${name}: (.+)$`, 'mu').exec(value)?.[1] ?? ''

const sentencesOf = (text: string): ReadonlyArray<Readonly<{ text: string; words: number }>> =>
  [...new Intl.Segmenter('en', { granularity: 'sentence' }).segment(text)].map((part) => ({
    text: part.segment,
    words: (part.segment.match(/[A-Za-z']+/gu) ?? []).length,
  }))

export const readability = defineTextTool({
  meta: {
    id: 'readability',
    name: 'Readability score',
    category: 'text',
    description: 'Flesch reading ease and grade level of English text.',
    keywords: ['flesch', 'grade', 'reading level', 'syllables', 'plain language'],
  },
  example:
    'The quick brown fox jumps over the lazy dog. Short sentences help readers. Long sentences that wander through several clauses, pile up qualifications, and never quite reach a point make the same reader work much harder than they should have to.',
  files: true,
  render: (c) => {
    const { h } = c
    const result = attempt(() => (c.input.trim() === '' ? '' : run(c.input)))
    const [ease = '', label = ''] = field(result.value, 'Flesch reading ease')
      .replace(')', '')
      .split(' (')
    const sentences = sentencesOf(c.input)
    const long = sentences.filter((sentence) => sentence.words > LONG).length
    const words = Number(field(result.value, 'Words'))
    const count = Number(field(result.value, 'Sentences'))
    return h.div(
      [h.Class(stack)],
      [
        columns(h, [
          sourcePanel(c),
          panel(h, 'Reading ease', [
            result.value === ''
              ? hint(h, result.error === '' ? 'Write some English text.' : result.error)
              : h.div(
                  [],
                  [
                    h.div(
                      [h.Class(scoreCls)],
                      [h.span([h.Class(bigCls)], [ease]), h.b([], [label])],
                    ),
                    h.div(
                      [h.Class(gaugeCls)],
                      [
                        h.i(
                          [
                            h.Style({
                              left: `${Math.min(100, Math.max(0, Number(ease)))}%`,
                            }),
                          ],
                          [],
                        ),
                      ],
                    ),
                    h.div([h.Class(scaleCls)], [h.span([], ['Hard']), h.span([], ['Easy'])]),
                  ],
                ),
            errorLine(c, result.value === '' ? '' : result.error),
            result.value === ''
              ? null
              : stats(h, [
                  ['Grade level', field(result.value, 'Grade level')],
                  ['Words', String(words)],
                  ['Sentences', String(count)],
                  ['Syllables', field(result.value, 'Syllables')],
                  ['Words per sentence', count === 0 ? '0' : (words / count).toFixed(1)],
                ]),
          ]),
        ]),
        result.value === ''
          ? null
          : panel(h, `Long sentences · ${long} over ${LONG} words`, [
              long === 0
                ? hint(h, `Every sentence is ${plural(LONG, 'word')} or shorter.`)
                : marked(
                    h,
                    'Text with long sentences highlighted',
                    sentences.map((sentence) => ({
                      text: sentence.text,
                      ...(sentence.words > LONG ? { kind: 'warn' as const } : {}),
                    })),
                  ),
            ]),
      ],
    )
  },
})
