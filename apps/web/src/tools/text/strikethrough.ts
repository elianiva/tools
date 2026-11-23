import { defineTransform } from '../transform.ts'

export const run = (text: string, mode: string): string => {
  const marks: Readonly<Record<string, string>> = {
    strike: '\u0336',
    underline: '\u0332',
    slash: '\u0338',
  }
  const mark = marks[mode] ?? ''
  return Array.from(text, (char) => (char === '\n' ? char : char + mark)).join('')
}

export const strikethrough = defineTransform({
  meta: {
    id: 'strikethrough',
    name: 'Strikethrough text',
    category: 'text',
    description: 'Strike, underline, or slash text with Unicode marks that work anywhere.',
    keywords: ['strikethrough', 'underline', 'unicode', 'combining', 'cross out'],
  },
  modes: [
    { id: 'strike', label: 'Strikethrough' },
    { id: 'underline', label: 'Underline' },
    { id: 'slash', label: 'Slash' },
  ],
  placeholder: 'Type or paste text',
  example: 'ab',
  present: 'display',
  run,
})
