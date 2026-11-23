import { defineTransform } from '../transform.ts'

export const run = (text: string, mode: string): string => {
  return text.normalize(mode.toUpperCase() as 'NFC' | 'NFD' | 'NFKC' | 'NFKD')
}

export const unicodeNormalize = defineTransform({
  meta: {
    id: 'unicode-normalize',
    name: 'Unicode normaliser',
    category: 'text',
    description: 'Convert text to NFC, NFD, NFKC, or NFKD form.',
    keywords: ['unicode', 'normalize', 'nfc', 'nfd', 'nfkc', 'nfkd', 'composed'],
  },
  modes: [
    { id: 'nfc', label: 'NFC' },
    { id: 'nfd', label: 'NFD' },
    { id: 'nfkc', label: 'NFKC' },
    { id: 'nfkd', label: 'NFKD' },
  ],
  placeholder: 'Type or paste text',
  acceptsFiles: true,
  example: 'e\u0301',
  present: 'display',
  run,
})
