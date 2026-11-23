import { defineTransform } from '../transform.ts'

export const run = (text: string, mode: string): string => {
  const width = Number(mode)
  return text
    .split('\n')
    .map((line) => {
      const out: Array<string> = []
      let current = ''
      for (const word of line.split(/\s+/u).filter((part) => part !== '')) {
        if (current === '') current = word
        else if (current.length + 1 + word.length <= width) current += ` ${word}`
        else {
          out.push(current)
          current = word
        }
      }
      out.push(current)
      return out.join('\n')
    })
    .join('\n')
}

export const textWrap = defineTransform({
  meta: {
    id: 'text-wrap',
    name: 'Text wrapper',
    category: 'text',
    description: 'Hard-wrap text at a fixed number of columns.',
    keywords: ['wrap', 'columns', 'line length', '80', 'reflow', 'fold'],
  },
  modes: [
    { id: '10', label: '10 columns' },
    { id: '40', label: '40 columns' },
    { id: '72', label: '72 columns' },
    { id: '80', label: '80 columns' },
  ],
  placeholder: 'Type or paste text',
  acceptsFiles: true,
  example: 'the quick brown fox jumps',
  run,
})
