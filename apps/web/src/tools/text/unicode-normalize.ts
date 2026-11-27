import { cleaner, defineTextTool } from './ui.ts'

export const run = (text: string, mode: string): string => {
  return text.normalize(mode.toUpperCase() as 'NFC' | 'NFD' | 'NFKC' | 'NFKD')
}

export const unicodeNormalize = defineTextTool({
  meta: {
    id: 'unicode-normalize',
    name: 'Unicode normaliser',
    category: 'text',
    description: 'Convert text to NFC, NFD, NFKC, or NFKD form.',
    keywords: ['unicode', 'normalize', 'nfc', 'nfd', 'nfkc', 'nfkd', 'composed'],
  },
  mode: 'nfc',
  example: 'e\u0301 ﬁne ① Å',
  files: true,
  render: (c) =>
    cleaner(c, {
      run,
      options: [
        { value: 'nfc', label: 'NFC' },
        { value: 'nfd', label: 'NFD' },
        { value: 'nfkc', label: 'NFKC' },
        { value: 'nfkd', label: 'NFKD' },
      ],
      extra: (before, after) => [['Code points', `${[...before].length} → ${[...after].length}`]],
    }),
})
