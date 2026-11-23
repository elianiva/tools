import { defineTransform } from '../transform.ts'

export const run = (text: string): string => {
  const small = new Set([
    'a',
    'an',
    'and',
    'as',
    'at',
    'but',
    'by',
    'for',
    'in',
    'nor',
    'of',
    'on',
    'or',
    'the',
    'to',
    'up',
    'via',
    'vs',
  ])
  const word = /[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu
  return text
    .split('\n')
    .map((line) => {
      const matches = [...line.matchAll(word)]
      const first = matches[0]?.index
      const last = matches.at(-1)?.index
      return line
        .toLocaleLowerCase()
        .replaceAll(word, (found: string, offset: number) =>
          offset === first || offset === last || !small.has(found)
            ? found.charAt(0).toLocaleUpperCase() + found.slice(1)
            : found,
        )
    })
    .join('\n')
}

export const titleCase = defineTransform({
  meta: {
    id: 'title-case',
    name: 'Title case',
    category: 'text',
    description: 'Capitalise a headline the way style guides do.',
    keywords: ['headline', 'capitalize', 'title', 'ap style', 'chicago'],
  },
  modes: [{ id: 'run', label: 'Run' }],
  placeholder: 'Type or paste text',
  acceptsFiles: true,
  example: 'the lord of the rings',
  run,
})
