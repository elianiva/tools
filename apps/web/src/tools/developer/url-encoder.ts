import { codecView, defineWorkbench } from './ui.ts'

const run = (text: string, mode: string): string => {
  try {
    return mode === 'decode'
      ? decodeURIComponent(text.replaceAll('+', ' '))
      : mode === 'url'
        ? encodeURI(text)
        : encodeURIComponent(text)
  } catch {
    throw new Error('This has a broken % sequence and cannot be decoded.')
  }
}

/** The first `%` that is not followed by two hex digits. */
const badPercent = (input: string): number | undefined => {
  const at = input.search(/%(?![0-9a-fA-F]{2})/u)
  return at < 0 ? undefined : at
}

export const urlEncoder = defineWorkbench({
  meta: {
    id: 'url-encoder',
    name: 'URL encoder',
    category: 'developer',
    description: 'Percent-encode and decode URLs and query values.',
    keywords: ['percent', 'encode', 'decode', 'uri', 'query string', 'escape'],
  },
  mode: 'component',
  example: 'hello world & more',
  view: (h, ctx) =>
    codecView(h, ctx, {
      id: 'url-encoder',
      modes: [
        { value: 'component', label: 'Encode value' },
        { value: 'url', label: 'Encode URL' },
        { value: 'decode', label: 'Decode' },
      ],
      inverse: { component: 'decode', url: 'decode', decode: 'component' },
      run,
      locate: (input, mode) => (mode === 'decode' ? badPercent(input) : undefined),
      labels: (mode) => (mode === 'decode' ? ['Encoded', 'Decoded'] : ['Text', 'Encoded']),
      placeholder: 'hello world & more',
    }),
})
