import { defineLab, gallery, inputPanel, layout } from './ui-b.ts'

export const run = (text: string, mode: string): string => {
  const marks: Readonly<Record<string, string>> = {
    strike: '\u0336',
    underline: '\u0332',
    slash: '\u0338',
  }
  const mark = marks[mode] ?? ''
  return Array.from(text, (char) => (char === '\n' ? char : char + mark)).join('')
}
const STYLES = [
  { id: 'strike', label: 'Strikethrough' },
  { id: 'underline', label: 'Underline' },
  { id: 'slash', label: 'Slash' },
]

export const strikethrough = defineLab({
  meta: {
    id: 'strikethrough',
    name: 'Strikethrough text',
    category: 'text',
    description: 'Strike, underline, or slash text with Unicode marks that work anywhere.',
    keywords: ['strikethrough', 'underline', 'unicode', 'combining', 'cross out'],
  },
  example: 'Cross it out',
  view: (ctx) => {
    const { h, model } = ctx
    const empty = model.input === ''
    const source = empty ? ctx.example : model.input
    return layout(
      h,
      [],
      [
        inputPanel(ctx, { label: 'Text', placeholder: 'Type or paste text', rows: 4 }),
        gallery(
          h,
          STYLES.map((style) => ({ label: style.label, text: run(source, style.id) })),
          empty,
        ),
      ],
    )
  },
})
