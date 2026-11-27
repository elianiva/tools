import { columns, panel, segmented } from '../kit.ts'
import { defineLab, inputPanel, layout, resultPanel, tile, tileStrip } from './ui-b.ts'

export const run = (text: string, mode: string): string => {
  const small = new Set(['a', 'an', 'and', 'at', 'by', 'for', 'in', 'of', 'on', 'or', 'the', 'to'])
  return text
    .split(/[\s-]+/u)
    .filter((word) => word !== '' && (mode === 'all' || !small.has(word.toLowerCase())))
    .map((word) => (Array.from(word)[0] ?? '').toUpperCase())
    .join('')
}
export const acronym = defineLab({
  meta: {
    id: 'acronym',
    name: 'Acronym maker',
    category: 'text',
    description: 'Take the first letter of each word.',
    keywords: ['initials', 'abbreviation', 'acronym', 'shorten'],
  },
  mode: 'all',
  example: 'portable network graphics',
  view: (ctx) => {
    const { h, model } = ctx
    const words = model.input.split(/[\s-]+/u).filter((word) => word !== '')
    return layout(
      h,
      [
        segmented(h, {
          label: 'Words',
          value: model.mode,
          options: [
            { value: 'all', label: 'All words' },
            { value: 'skip', label: 'Skip small words' },
          ],
          onSelect: ctx.onMode,
        }),
      ],
      [
        columns(h, [
          inputPanel(ctx, { label: 'Phrase', placeholder: 'Type or paste text', rows: 4 }),
          resultPanel(h, run(model.input, model.mode), '', 'Acronym'),
        ]),
        words.length === 0
          ? null
          : panel(h, 'Words', [
              tileStrip(
                h,
                words.map((word) => {
                  const letter = run(word, model.mode)
                  return tile(h, {
                    top: letter === '' ? '–' : letter,
                    join: '↓',
                    bottom: word,
                    state: letter === '' ? 'dim' : 'on',
                  })
                }),
              ),
            ]),
      ],
    )
  },
})
