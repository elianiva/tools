import { defineTransform } from '../transform.ts'

export const run = (text: string): string => {
  return text.replaceAll(/(?<![\d.])\d+(?!\d|\.\d)/gu, (digits) => {
    const lastTwo = Number(digits.slice(-2))
    const last = lastTwo % 10
    const suffix =
      lastTwo >= 11 && lastTwo <= 13
        ? 'th'
        : last === 1
          ? 'st'
          : last === 2
            ? 'nd'
            : last === 3
              ? 'rd'
              : 'th'
    return `${digits}${suffix}`
  })
}

export const ordinalNumbers = defineTransform({
  meta: {
    id: 'ordinal-numbers',
    name: 'Ordinal numbers',
    category: 'convert',
    description: 'Write 1 as 1st, 2 as 2nd, and so on.',
    keywords: ['ordinal', '1st', '2nd', '3rd', 'suffix', 'rank'],
  },
  modes: [{ id: 'run', label: 'Run' }],
  placeholder: 'Type or paste text',
  acceptsFiles: true,
  example: '1 2 3 4 11 12 13 21 22 101 111 112',
  run,
})
