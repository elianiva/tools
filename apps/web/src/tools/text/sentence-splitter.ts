import { css } from '../../../styled-system/css'
import { columns, hint, panel, stack } from '../kit.ts'
import { copyable, defineTextTool, plural, sourcePanel, useAsInput } from './ui.ts'

export const run = (text: string): string => {
  return [...new Intl.Segmenter('en', { granularity: 'sentence' }).segment(text)]
    .map((part) => part.segment.trim())
    .filter((sentence) => sentence !== '')
    .join('\n')
}

const listCls = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.35rem',
  margin: 0,
  padding: 0,
  listStyle: 'none',
  paddingRight: '2.4rem',
  maxHeight: '28rem',
  overflow: 'auto',
  counterReset: 'sentence',
  '& li': {
    display: 'grid',
    gridTemplateColumns: '1.8rem 1fr auto',
    gap: '0.6rem',
    alignItems: 'baseline',
    padding: '0.5rem 0.7rem',
    borderRadius: '8px',
    background: 'var(--well)',
    boxShadow: 'var(--elev-well)',
    counterIncrement: 'sentence',
    '&::before': {
      content: 'counter(sentence)',
      fontFamily: 'var(--mono)',
      fontSize: '0.7rem',
      color: 'var(--muted-foreground)',
    },
    '& small': { fontFamily: 'var(--mono)', color: 'var(--muted-foreground)', fontSize: '0.7rem' },
  },
})

export const sentenceSplitter = defineTextTool({
  meta: {
    id: 'sentence-splitter',
    name: 'Sentence splitter',
    category: 'text',
    description: 'Put every sentence on its own line.',
    keywords: ['sentences', 'split', 'lines', 'break'],
  },
  example: 'Hi there. How are you? Fine! Mr. Smith left at 5 p.m. today.',
  files: true,
  render: (c) => {
    const { h } = c
    const value = run(c.input)
    const sentences = value === '' ? [] : value.split('\n')
    return h.div(
      [h.Class(stack)],
      [
        columns(h, [
          sourcePanel(c),
          panel(h, plural(sentences.length, 'sentence'), [
            sentences.length === 0
              ? hint(h, 'Paste text to split.')
              : copyable(
                  h,
                  value,
                  h.ol(
                    [h.Class(listCls)],
                    sentences.map((sentence) =>
                      h.li(
                        [],
                        [
                          h.span([], [sentence]),
                          h.small([], [plural(sentence.split(/\s+/u).length, 'word')]),
                        ],
                      ),
                    ),
                  ),
                ),
            useAsInput(c, value),
          ]),
        ]),
      ],
    )
  },
})
