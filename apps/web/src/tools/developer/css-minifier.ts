import { defineTransform } from '../transform.ts'

export const run = (text: string): string => {
  return text
    .replaceAll(/\/\*[\s\S]*?\*\//gu, '')
    .replaceAll(/\s+/gu, ' ')
    .replaceAll(/\s*([{};:,>])\s*/gu, '$1')
    .replaceAll(';}', '}')
    .trim()
}

export const cssMinifier = defineTransform({
  meta: {
    id: 'css-minifier',
    name: 'CSS minifier',
    category: 'developer',
    description: 'Strip comments and whitespace from CSS.',
    keywords: ['css', 'minify', 'compress', 'stylesheet', 'whitespace'],
  },
  modes: [{ id: 'run', label: 'Run' }],
  placeholder: 'Type or paste text',
  acceptsFiles: true,
  run,
})
