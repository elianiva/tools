import { defineTransform } from '../transform.ts'

export const run = (text: string, mode: string): string => {
  const patterns: Readonly<Record<string, RegExp>> = {
    emails: /[\p{L}\p{N}._%+-]+@[\p{L}\p{N}.-]+\.\p{L}{2,}/gu,
    urls: /https?:\/\/[^\s<>"')]+/gu,
    numbers: /-?\d+(?:\.\d+)?/gu,
    hashtags: /#[\p{L}\p{N}_]+/gu,
    mentions: /@[\p{L}\p{N}_]+/gu,
  }
  const pattern = patterns[mode] ?? patterns['emails']
  const found = (pattern === undefined ? [] : [...text.matchAll(pattern)]).map((match) =>
    mode === 'urls' ? match[0].replace(/[.,;:!?]+$/u, '') : match[0],
  )
  if (found.length === 0) throw new Error('Nothing found.')
  return found.join('\n')
}

export const extractData = defineTransform({
  meta: {
    id: 'extract-data',
    name: 'Data extractor',
    category: 'text',
    description: 'Pull emails, links, numbers, hashtags, or mentions out of text.',
    keywords: ['email', 'url', 'link', 'number', 'hashtag', 'mention', 'scrape'],
  },
  modes: [
    { id: 'emails', label: 'Emails' },
    { id: 'urls', label: 'Links' },
    { id: 'numbers', label: 'Numbers' },
    { id: 'hashtags', label: 'Hashtags' },
    { id: 'mentions', label: 'Mentions' },
  ],
  placeholder: 'Type or paste text',
  acceptsFiles: true,
  run,
})
