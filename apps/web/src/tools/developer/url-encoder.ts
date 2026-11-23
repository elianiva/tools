import { defineTransform } from '../transform.ts'

export const urlEncoder = defineTransform({
  meta: {
    id: 'url-encoder',
    name: 'URL encoder',
    category: 'developer',
    description: 'Percent-encode and decode URLs and query values.',
    keywords: ['percent', 'encode', 'decode', 'uri', 'query string', 'escape'],
  },
  modes: [
    { id: 'component', label: 'Encode value' },
    { id: 'url', label: 'Encode whole URL' },
    { id: 'decode', label: 'Decode' },
  ],
  placeholder: 'hello world & more',
  present: 'code',
  run: (text, mode) => {
    try {
      return mode === 'decode'
        ? decodeURIComponent(text.replaceAll('+', ' '))
        : mode === 'url'
          ? encodeURI(text)
          : encodeURIComponent(text)
    } catch {
      throw new Error('This has a broken % sequence and cannot be decoded.')
    }
  },
})
