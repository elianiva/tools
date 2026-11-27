import { cleaner, defineTextTool } from './ui.ts'

export const run = (text: string): string => {
  return text
    .replaceAll(
      /(?![\u00a9\u00ae\u2122])[\p{Extended_Pictographic}\u200d\ufe0f\u{1f3fb}-\u{1f3ff}]/gu,
      '',
    )
    .replaceAll(/[ \t]{2,}/gu, ' ')
    .trim()
}

export const emojiRemover = defineTextTool({
  meta: {
    id: 'emoji-remover',
    name: 'Emoji remover',
    category: 'text',
    description: 'Strip emoji from text and tidy the spaces left behind.',
    keywords: ['emoji', 'remove emoji', 'strip', 'clean', 'pictograph'],
  },
  example: 'Launch day 🚀 is here 🎉 thanks team 👩‍💻',
  files: true,
  render: (c) =>
    cleaner(c, {
      run,
      extra: (before) => [
        ['Emoji', String((before.match(/\p{Extended_Pictographic}/gu) ?? []).length)],
      ],
    }),
})
