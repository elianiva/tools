import { defineTransform } from '../transform.ts'

export const run = (text: string): string => {
  const raw = text.trim()
  let url: URL
  try {
    url = new URL(raw.includes('://') ? raw : `https://${raw}`)
  } catch {
    throw new Error('This is not a valid URL.')
  }
  const lines = [`Protocol: ${url.protocol}`, `Host: ${url.host}`, `Path: ${url.pathname}`]
  if (url.hash !== '') lines.push(`Hash: ${url.hash}`)
  const params = [...url.searchParams]
  if (params.length > 0)
    lines.push('', 'Parameters', ...params.map(([key, value]) => `${key} = ${value}`))
  return lines.join('\n')
}

export const urlParser = defineTransform({
  meta: {
    id: 'url-parser',
    name: 'URL parser',
    category: 'developer',
    description: 'Split a URL into its host, path, and query parameters.',
    keywords: ['url', 'query string', 'parameters', 'host', 'parse', 'utm'],
  },
  modes: [{ id: 'run', label: 'Run' }],
  placeholder: 'Type or paste text',
  example: 'https://x.com/a?b=1&c=hello%20w#top',
  present: 'facts',
  run,
})
