import { defineTransform } from '../transform.ts'

export const run = (text: string, mode: string): string => {
  const [first = '', ...rest] = text.split('\n')
  const arrow = first.indexOf(' => ')
  if (arrow === -1) throw new Error('Put find => replace on the first line, then the text below.')
  const find = first.slice(0, arrow)
  const replacement = first.slice(arrow + 4)
  if (find === '') throw new Error('The find part is empty.')
  const body = rest.join('\n')
  if (mode === 'regex') {
    let pattern: RegExp
    try {
      pattern = new RegExp(find, 'gu')
    } catch {
      throw new Error('This is not a valid pattern.')
    }
    return body.replace(pattern, replacement)
  }
  return body.replaceAll(find, () => replacement)
}

export const findReplace = defineTransform({
  meta: {
    id: 'find-replace',
    name: 'Find and replace',
    category: 'text',
    description: 'Put find => replace on the first line, then the text below.',
    keywords: ['find', 'replace', 'substitute', 'regex', 'search'],
  },
  modes: [
    { id: 'plain', label: 'Plain text' },
    { id: 'regex', label: 'Regular expression' },
  ],
  placeholder: 'cat => dog (then the text on the next lines)',
  acceptsFiles: true,
  example: 'cat => dog\nthe cat sat on a cat',
  run,
})
