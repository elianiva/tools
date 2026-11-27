import { byteLength, codecView, defineWorkbench, formatSize } from './ui.ts'
import { facts } from './ui.ts'

export const run = (text: string): string => {
  return text
    .replaceAll(/\/\*[\s\S]*?\*\//gu, '')
    .replaceAll(/\s+/gu, ' ')
    .replaceAll(/\s*([{};:,>])\s*/gu, '$1')
    .replaceAll(';}', '}')
    .trim()
}

export const cssMinifier = defineWorkbench({
  meta: {
    id: 'css-minifier',
    name: 'CSS minifier',
    category: 'developer',
    description: 'Strip comments and whitespace from CSS.',
    keywords: ['css', 'minify', 'compress', 'stylesheet', 'whitespace'],
  },
  example: 'a { color : red; }\n/* c */ b{margin:0 }',
  acceptsFiles: true,
  view: (h, ctx) =>
    codecView(h, ctx, {
      id: 'css-minifier',
      modes: [],
      run,
      labels: () => ['CSS', 'Minified'],
      placeholder: 'a { color: red; }',
      details: (input, output) => {
        const before = byteLength(input)
        const after = byteLength(output)
        return facts(h, [
          ['Original', formatSize(before)],
          ['Minified', formatSize(after)],
          ['Saved', before === 0 ? '—' : `${(((before - after) / before) * 100).toFixed(0)}%`],
        ])
      },
    }),
})
